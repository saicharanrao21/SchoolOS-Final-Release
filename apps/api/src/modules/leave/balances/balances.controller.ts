import { Controller, Get, Post, Body, UseGuards, Query, Param } from '@nestjs/common';
import { LeaveBalancesService } from './balances.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../../auth/decorators/user.decorator';
import { PermissionsGuard } from '../../../auth/guards/permissions.guard';
import { Permissions } from '../../../auth/decorators/permissions.decorator';

@Controller('leave/balances')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class LeaveBalancesController {
  constructor(private readonly service: LeaveBalancesService) {}

  @Get('employee/:employeeId')
  @Permissions('leave.read')
  findByEmployee(@Param('employeeId') employeeId: string, @Query('academicYearId') academicYearId: string) {
    return this.service.findByEmployee(employeeId, academicYearId);
  }

  @Post()
  @Permissions('leave.policy.manage')
  updateBalance(@Body() data: any) {
    return this.service.updateBalance(data);
  }
}
