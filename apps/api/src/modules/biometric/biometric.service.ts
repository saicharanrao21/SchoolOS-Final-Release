import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { AuditService } from '../../audit/audit.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AttendanceStatus, AttendanceSessionStatus } from '@prisma/client';

@Injectable()
export class BiometricService {
  private readonly logger = new Logger(BiometricService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // --- Device Management ---

  async registerDevice(organizationId: string, schoolId: string, data: any, actorId: string) {
    const existing = await this.db.biometricDevice.findFirst({
      where: { serialNumber: data.serialNumber },
    });
    if (existing) {
      throw new BadRequestException(`Biometric device with serial number ${data.serialNumber} is already registered`);
    }

    const device = await this.db.biometricDevice.create({
      data: {
        organizationId,
        schoolId,
        deviceName: data.deviceName,
        serialNumber: data.serialNumber,
        ipAddress: data.ipAddress,
        deviceType: data.deviceType || 'ADMS',
        location: data.location,
        secretKey: data.secretKey,
        status: 'ONLINE',
      },
    });

    await this.audit.log({
      action: 'biometric.device.register',
      resource: 'BiometricDevice',
      resourceId: device.id,
      actorId,
      organizationId,
      schoolId,
    });

    return device;
  }

  async getDevices(organizationId: string, schoolId: string) {
    return this.db.biometricDevice.findMany({
      where: { schoolId, school: { organizationId } },
      orderBy: { createdAt: 'desc' },
    });
  }

  // --- Punch Ingestion (ADMS / HTTP Push Standard) ---

  async processPunch(serialNumber: string, punchData: { biometricUserId: string; punchTime: Date; punchType?: string; secretKey?: string; rawPayload?: any }) {
    const device = await this.db.biometricDevice.findUnique({
      where: { serialNumber },
    });
    if (!device) {
      throw new NotFoundException(`Unknown biometric device: ${serialNumber}`);
    }

    if (device.secretKey && device.secretKey !== punchData.secretKey) {
      throw new BadRequestException('Invalid device secret key');
    }

    // Update last ping
    await this.db.biometricDevice.update({
      where: { id: device.id },
      data: { lastPingAt: new Date(), status: 'ONLINE' },
    });

    const punchTime = new Date(punchData.punchTime);
    const sixtySecsAgo = new Date(punchTime.getTime() - 60000);

    // Deduplication check
    const duplicate = await this.db.biometricPunchLog.findFirst({
      where: {
        schoolId: device.schoolId,
        biometricUserId: punchData.biometricUserId,
        punchTime: { gte: sixtySecsAgo, lte: punchTime },
      },
    });

    if (duplicate) {
      this.logger.log(`Duplicate punch ignored for biometricUser ${punchData.biometricUserId}`);
      return { status: 'DUPLICATE', punchLogId: duplicate.id };
    }

    // Map to Employee or Student
    const employee = await this.db.employee.findFirst({
      where: { schoolId: device.schoolId, OR: [{ employeeId: punchData.biometricUserId }, { id: punchData.biometricUserId }] },
    });

    const student = !employee
      ? await this.db.student.findFirst({
          where: { schoolId: device.schoolId, OR: [{ admissionNumber: punchData.biometricUserId }, { id: punchData.biometricUserId }] },
        })
      : null;

    const punchLog = await this.db.biometricPunchLog.create({
      data: {
        organizationId: device.organizationId,
        schoolId: device.schoolId,
        deviceId: device.id,
        deviceSerialNumber: serialNumber,
        biometricUserId: punchData.biometricUserId,
        employeeId: employee?.id,
        studentId: student?.id,
        punchTime,
        punchType: punchData.punchType || 'CHECK_IN',
        rawPayload: punchData.rawPayload || {},
        status: employee || student ? 'PROCESSED' : 'UNMAPPED',
        processedAt: new Date(),
      },
    });

    // Auto-record Attendance
    if (student) {
      await this.recordStudentBiometricAttendance(device.schoolId, student.id, punchTime, punchData.punchType || 'CHECK_IN');
    } else if (employee) {
      await this.recordEmployeeBiometricAttendance(device.schoolId, employee.id, punchTime, punchData.punchType || 'CHECK_IN');
    }

    this.eventEmitter.emit('biometric.punch.ingested', {
      schoolId: device.schoolId,
      punchLogId: punchLog.id,
      biometricUserId: punchData.biometricUserId,
      mapped: !!(employee || student),
    });

    return punchLog;
  }

  private async recordStudentBiometricAttendance(schoolId: string, studentId: string, punchTime: Date, punchType: string) {
    const dateStr = punchTime.toISOString().split('T')[0];
    const sessionDate = new Date(dateStr);

    let session = await this.db.attendanceSession.findFirst({
      where: { schoolId, date: sessionDate },
    });

    if (!session) {
      const academicYear = await this.db.academicYear.findFirst({ where: { schoolId, status: 'ACTIVE' } });
      session = await this.db.attendanceSession.create({
        data: {
          schoolId,
          date: sessionDate,
          type: 'DAILY',
          status: AttendanceSessionStatus.LOCKED,
          createdById: 'BIOMETRIC_SYSTEM',
          academicYearId: academicYear?.id || 'DEFAULT',
        },
      });
    }

    await this.db.studentAttendanceRecord.upsert({
      where: { sessionId_studentId: { sessionId: session.id, studentId } },
      update: {
        status: AttendanceStatus.PRESENT,
        remarks: `Biometric ${punchType} at ${punchTime.toLocaleTimeString()}`,
      },
      create: {
        sessionId: session.id,
        studentId,
        markedById: 'BIOMETRIC_SYSTEM',
        status: AttendanceStatus.PRESENT,
        remarks: `Biometric ${punchType} at ${punchTime.toLocaleTimeString()}`,
      },
    });
  }

  private async recordEmployeeBiometricAttendance(schoolId: string, employeeId: string, punchTime: Date, punchType: string) {
    const dateStr = punchTime.toISOString().split('T')[0];
    const date = new Date(dateStr);

    const existing = await this.db.employeeAttendanceRecord.findFirst({
      where: { schoolId, employeeId, date },
    });

    if (existing) {
      await this.db.employeeAttendanceRecord.update({
        where: { id: existing.id },
        data: {
          status: AttendanceStatus.PRESENT,
          checkInTime: punchType === 'CHECK_IN' ? punchTime : existing.checkInTime,
          checkOutTime: punchType === 'CHECK_OUT' ? punchTime : existing.checkOutTime,
          remarks: `Biometric ${punchType}`,
        },
      });
    } else {
      await this.db.employeeAttendanceRecord.create({
        data: {
          schoolId,
          employeeId,
          date,
          status: AttendanceStatus.PRESENT,
          checkInTime: punchTime,
          remarks: `Biometric ${punchType}`,
        },
      });
    }
  }

  async getPunchLogs(organizationId: string, schoolId: string, page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    const where = { schoolId, school: { organizationId } };

    const [items, total] = await Promise.all([
      this.db.biometricPunchLog.findMany({
        where,
        skip,
        take: limit,
        include: { device: true, employee: true, student: true },
        orderBy: { punchTime: 'desc' },
      }),
      this.db.biometricPunchLog.count({ where }),
    ]);

    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  }
}
