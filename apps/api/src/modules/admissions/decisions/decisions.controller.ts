import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { DecisionsService } from './decisions.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../../auth/decorators/user.decorator';
import { PermissionsGuard } from '../../../auth/guards/permissions.guard';
import { Permissions } from '../../../auth/decorators/permissions.decorator';

@Controller('admissions/decisions')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class DecisionsController {
  constructor(private readonly decisionsService: DecisionsService) {}

  @Post()
  @Permissions('admissions.decision.manage')
  makeDecision(@User('org') organizationId: string, @Body() data: any, @User('id') actorId: string) {
    return this.decisionsService.makeDecision(organizationId, data, actorId);
  }
}
