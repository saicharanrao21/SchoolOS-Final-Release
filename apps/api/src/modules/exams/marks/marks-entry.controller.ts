import { Controller, Post, Body, Param, UseGuards, Patch } from '@nestjs/common';
import { MarksEntryService } from './marks-entry.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../../auth/decorators/user.decorator';
import { PermissionsGuard } from '../../../auth/guards/permissions.guard';
import { Permissions } from '../../../auth/decorators/permissions.decorator';

@Controller('exams/marks')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class MarksEntryController {
  constructor(private readonly service: MarksEntryService) {}

  @Post('bulk')
  @Permissions('marks.enter')
  markBulk(@User('org') organizationId: string, @Body() data: any, @User('id') actorId: string) {
    return this.service.markBulk(organizationId, data, actorId);
  }

  @Patch(':id/submit')
  @Permissions('marks.submit')
  submit(@User('org') organizationId: string, @Param('id') id: string, @User('id') actorId: string) {
    return this.service.submit(organizationId, id, actorId);
  }
}
