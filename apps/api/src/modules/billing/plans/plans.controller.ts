import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { SaaSPlansService } from './plans.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../../auth/decorators/user.decorator';
import { PermissionsGuard } from '../../../auth/guards/permissions.guard';
import { Permissions } from '../../../auth/decorators/permissions.decorator';

@Controller('billing/plans')
export class SaaSPlansController {
  constructor(private readonly service: SaaSPlansService) {}

  @Get()
  async getPublicPlans() {
    return this.service.getPublicPlans();
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions('billing.admin')
  async createPlan(@User('id') actorId: string, @Body() data: any) {
    return this.service.createPlan(data, actorId);
  }
}
