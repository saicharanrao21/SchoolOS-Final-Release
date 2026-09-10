import { Controller, Post, Body, Param, UseGuards, Patch } from '@nestjs/common';
import { StudentDocumentsService } from './student-documents.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../auth/decorators/user.decorator';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { Permissions } from '../../auth/decorators/permissions.decorator';

@Controller('student-documents')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class StudentDocumentsController {
  constructor(private readonly documentsService: StudentDocumentsService) {}

  @Post(':studentId')
  @Permissions('student.documents.manage')
  upload(@Param('studentId') studentId: string, @Body() data: any, @User('id') actorId: string) {
    return this.documentsService.create(studentId, data, actorId);
  }

  @Patch(':id/verify')
  @Permissions('student.documents.manage')
  verify(@Param('id') id: string, @Body('status') status: string, @User('id') actorId: string) {
    return this.documentsService.verify(id, status, actorId);
  }
}
