import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { Prisma, RelationshipType } from '@prisma/client';
import { AuditService } from '../../audit/audit.service';

@Injectable()
export class GuardiansService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
  ) {}

  async create(organizationId: string, data: any, actorId?: string) {
    const guardian = await this.db.guardian.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        occupation: data.occupation,
        address: data.address,
      },
    });

    if (data.studentId) {
      await this.linkToStudent(guardian.id, data.studentId, data.relationship, data.isPrimary);
    }

    await this.audit.log({
      action: 'guardian.create',
      resource: 'Guardian',
      resourceId: guardian.id,
      actorId,
      organizationId,
      metadata: { phone: guardian.phone },
    });

    return guardian;
  }

  async linkToStudent(guardianId: string, studentId: string, relationship: RelationshipType, isPrimary: boolean = false) {
    return this.db.guardianStudent.upsert({
      where: {
        studentId_guardianId: { studentId, guardianId },
      },
      update: { relationship, isPrimary },
      create: {
        studentId,
        guardianId,
        relationship,
        isPrimary,
      },
    });
  }

  async findAll(organizationId: string, search?: string) {
    return this.db.guardian.findMany({
      where: {
        OR: search ? [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search } },
        ] : undefined,
        students: {
          some: {
            student: { school: { organizationId } }
          }
        }
      },
      include: {
        students: {
          include: { student: true }
        }
      }
    });
  }

  async findOne(id: string) {
    const guardian = await this.db.guardian.findUnique({
      where: { id },
      include: {
        students: {
          include: { student: { include: { school: true } } }
        }
      }
    });
    if (!guardian) throw new NotFoundException('Guardian not found');
    return guardian;
  }
}
