import { Controller, Get, Post, Body, Param, Query, UseGuards, Headers } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import { User } from '../../auth/decorators/user.decorator';
import { BiometricService } from './biometric.service';

@Controller('biometric')
export class BiometricController {
  constructor(private readonly service: BiometricService) {}

  // --- Device Administration ---

  @Get('devices')
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions('attendance.manage')
  async getDevices(@User('org') organizationId: string, @Query('schoolId') schoolId: string) {
    return this.service.getDevices(organizationId, schoolId);
  }

  @Post('devices')
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions('attendance.manage')
  async registerDevice(@User('org') organizationId: string, @Query('schoolId') schoolId: string, @Body() data: any, @User('id') actorId: string) {
    return this.service.registerDevice(organizationId, schoolId, data, actorId);
  }

  @Get('logs')
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions('attendance.read')
  async getPunchLogs(
    @User('org') organizationId: string,
    @Query('schoolId') schoolId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.service.getPunchLogs(organizationId, schoolId, Number(page) || 1, Number(limit) || 50);
  }

  // --- ADMS / HTTP Push Device Endpoint (Unprotected by JWT, validated via Device Serial Number & Secret) ---

  @Post('push/iclock/cdata')
  async handleAdmsPush(
    @Query('SN') serialNumber: string,
    @Body() body: any,
    @Headers('x-device-secret') secretKey?: string,
  ) {
    const biometricUserId = body.biometricUserId || body.userId || body.pin || body.empCode;
    const punchTime = body.punchTime || body.timestamp || new Date();
    const punchType = body.punchType || body.status || 'CHECK_IN';

    return this.service.processPunch(serialNumber, {
      biometricUserId: String(biometricUserId),
      punchTime: new Date(punchTime),
      punchType,
      secretKey,
      rawPayload: body,
    });
  }

  // --- API Simulation Playground for Admin Testing ---

  @Post('simulate-punch')
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions('attendance.manage')
  async simulatePunch(@Body() data: { serialNumber: string; biometricUserId: string; punchType?: string }) {
    return this.service.processPunch(data.serialNumber, {
      biometricUserId: data.biometricUserId,
      punchTime: new Date(),
      punchType: data.punchType || 'CHECK_IN',
    });
  }
}
