import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from '../guards/permissions.guard';
import { Permissions } from '../decorators/permissions.decorator';
import { User } from '../decorators/user.decorator';
import { AuthorizationService } from './authorization.service';
import { DelegationService } from './delegation.service';
import { DatabaseService } from '../../database/database.service';
import { PERMISSION_REGISTRY_METADATA } from '../permissions/permission.registry';

@Controller('auth')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class AuthorizationAdminController {
  constructor(
    private readonly authz: AuthorizationService,
    private readonly delegationService: DelegationService,
    private readonly db: DatabaseService,
  ) {}

  // --- Effective Access Preview ("Why does this user have access?") ---

  @Get('access-preview')
  @Permissions('platform.read')
  async getAccessPreview(
    @User('org') organizationId: string,
    @Query('targetUserId') targetUserId: string,
  ) {
    return this.authz.getAccessPreview(targetUserId, organizationId);
  }

  // --- Permission Registry Inspection ---

  @Get('permissions/registry')
  @Permissions('settings.read')
  async getPermissionRegistry() {
    return PERMISSION_REGISTRY_METADATA;
  }

  // --- User Memberships Management ---

  @Get('memberships')
  @Permissions('settings.read')
  async getMemberships(
    @User('org') organizationId: string,
    @Query('schoolId') schoolId?: string,
  ) {
    return this.db.userMembership.findMany({
      where: { organizationId, ...(schoolId ? { schoolId } : {}) },
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
        role: true,
        school: true,
        campus: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Post('memberships')
  @Permissions('settings.manage')
  async createMembership(
    @User('org') organizationId: string,
    @Body() data: any,
  ) {
    return this.db.userMembership.create({
      data: {
        userId: data.userId,
        organizationId,
        schoolId: data.schoolId,
        campusId: data.campusId,
        academicYearId: data.academicYearId,
        roleId: data.roleId,
        isActive: true,
      },
    });
  }

  // --- Authority Delegations Management ---

  @Get('delegations')
  @Permissions('settings.read')
  async getDelegations(
    @User('org') organizationId: string,
    @Query('schoolId') schoolId?: string,
  ) {
    return this.delegationService.getDelegations(organizationId, schoolId);
  }

  @Post('delegations')
  @Permissions('settings.manage')
  async createDelegation(
    @User('org') organizationId: string,
    @User('id') delegatorId: string,
    @Body() data: any,
  ) {
    return this.delegationService.createDelegation(organizationId, delegatorId, data);
  }

  @Post('delegations/:id/revoke')
  @Permissions('settings.manage')
  async revokeDelegation(
    @User('org') organizationId: string,
    @Param('id') id: string,
    @User('id') actorId: string,
  ) {
    return this.delegationService.revokeDelegation(organizationId, id, actorId);
  }
}
