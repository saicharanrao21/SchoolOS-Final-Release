import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { StudentHistoryService } from './student-history.service';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { Permissions } from '../../auth/decorators/permissions.decorator';

@Controller('student-history')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class StudentHistoryController {
  constructor(private readonly historyService: StudentHistoryService) {}

  @Get(':studentId/academic')
  @Permissions('student.read')
  getAcademic(@Param('studentId') studentId: string) {
    return this.historyService.getAcademicHistory(studentId);
  }

  @Get(':studentId/audit')
  @Permissions('student.read')
  getAudit(@Param('studentId') studentId: string) {
    return this.historyService.getAuditHistory(studentId);
  }
}
