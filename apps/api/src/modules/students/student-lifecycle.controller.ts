import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { StudentLifecycleService } from './student-lifecycle.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../auth/decorators/user.decorator';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { Permissions } from '../../auth/decorators/permissions.decorator';

@Controller('student-lifecycle')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class StudentLifecycleController {
  constructor(private readonly lifecycleService: StudentLifecycleService) {}

  @Post('transfer')
  @Permissions('student.transfer')
  transfer(@User('org') organizationId: string, @Body() data: any, @User('id') actorId: string) {
    return this.lifecycleService.transfer(organizationId, data, actorId);
  }

  @Post('withdraw')
  @Permissions('student.withdraw')
  withdraw(@User('org') organizationId: string, @Body() data: any, @User('id') actorId: string) {
    return this.lifecycleService.withdraw(organizationId, data, actorId);
  }
}
