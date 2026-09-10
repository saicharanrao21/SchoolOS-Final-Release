import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { HrSelfServiceService } from './hr-self-service.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../../auth/decorators/user.decorator';

@Controller('hr/self-service')
@UseGuards(AuthGuard('jwt'))
export class HrSelfServiceController {
  constructor(private readonly service: HrSelfServiceService) {}

  @Get('me')
  async getMyInfo(@User('id') userId: string) {
    return this.service.getMyInfo(userId);
  }

  @Post('loans')
  async applyLoan(@User('id') userId: string, @Body() data: any) {
    return this.service.applyLoan(userId, data);
  }

  @Post('reimbursements')
  async submitReimbursement(@User('id') userId: string, @Body() data: any) {
    return this.service.submitReimbursement(userId, data);
  }
}
