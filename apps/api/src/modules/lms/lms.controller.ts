import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import { User } from '../../auth/decorators/user.decorator';
import { LmsService } from './lms.service';

@Controller('lms')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class LmsController {
  constructor(private readonly service: LmsService) {}

  @Get('dashboard')
  @Permissions('lms.read')
  dashboard(@User('org') org: string, @Query('schoolId') school: string) { return this.service.dashboard(org, school); }

  @Get('courses')
  @Permissions('lms.read')
  courses(@User('org') org: string, @Query('schoolId') school: string, @Query('status') status?: string) { return this.service.listCourses(org, school, status); }

  @Post('courses')
  @Permissions('lms.manage')
  createCourse(@User('org') org: string, @User('id') actor: string, @Body() body: any) { return this.service.createCourse(org, actor, body); }

  @Patch('courses/:id/publish')
  @Permissions('lms.manage')
  publish(@User('org') org: string, @User('id') actor: string, @Param('id') id: string, @Body() body: any) { return this.service.setCoursePublished(org, body.schoolId, id, actor, Boolean(body.published)); }

  @Post('courses/:id/modules')
  @Permissions('lms.manage')
  createModule(@User('org') org: string, @User('id') actor: string, @Param('id') courseId: string, @Body() body: any) { return this.service.createModule(org, body.schoolId, courseId, actor, body); }

  @Post('modules/:id/lessons')
  @Permissions('lms.manage')
  createLesson(@User('org') org: string, @User('id') actor: string, @Param('id') moduleId: string, @Body() body: any) { return this.service.createLesson(org, body.schoolId, moduleId, actor, body); }

  @Post('lessons/:id/resources')
  @Permissions('lms.manage')
  resource(@User('org') org: string, @User('id') actor: string, @Param('id') lessonId: string, @Body() body: any) { return this.service.addResource(org, body.schoolId, lessonId, actor, body); }

  @Post('courses/:id/enroll')
  @Permissions('lms.manage')
  enroll(@User('org') org: string, @User('id') actor: string, @Param('id') courseId: string, @Body() body: any) { return this.service.enrollStudent(org, body.schoolId, courseId, body.studentId, actor); }

  @Post('lessons/:id/progress')
  @Permissions('lms.read')
  progress(@User('org') org: string, @User('id') actor: string, @Param('id') lessonId: string, @Body() body: any) { return this.service.updateProgress(org, body.schoolId, lessonId, body.studentId, actor, body); }

  @Get('students/:studentId/progress')
  @Permissions('lms.read')
  studentProgress(@User('org') org: string, @Query('schoolId') school: string, @Param('studentId') studentId: string) { return this.service.studentProgress(org, school, studentId); }

  @Post('courses/:id/live-classes')
  @Permissions('lms.manage')
  liveClass(@User('org') org: string, @User('id') actor: string, @Param('id') courseId: string, @Body() body: any) { return this.service.createLiveClass(org, body.schoolId, courseId, actor, body); }

  @Post('live-classes/:id/attendance')
  @Permissions('lms.read')
  liveAttendance(@User('org') org: string, @User('id') actor: string, @Param('id') liveClassId: string, @Body() body: any) { return this.service.recordLiveAttendance(org, body.schoolId, liveClassId, body.userId || actor, body); }

  @Post('courses/:id/quizzes')
  @Permissions('lms.manage')
  quiz(@User('org') org: string, @User('id') actor: string, @Param('id') courseId: string, @Body() body: any) { return this.service.createQuiz(org, body.schoolId, courseId, actor, body); }

  @Post('quizzes/:id/questions')
  @Permissions('lms.manage')
  question(@User('org') org: string, @User('id') actor: string, @Param('id') quizId: string, @Body() body: any) { return this.service.addQuizQuestion(org, body.schoolId, quizId, actor, body); }

  @Post('quizzes/:id/attempts')
  @Permissions('lms.read')
  attempt(@User('org') org: string, @User('id') actor: string, @Param('id') quizId: string, @Body() body: any) { return this.service.startQuizAttempt(org, body.schoolId, quizId, body.studentId, actor); }

  @Post('quiz-attempts/:id/submit')
  @Permissions('lms.read')
  submit(@User('org') org: string, @User('id') actor: string, @Param('id') attemptId: string, @Body() body: any) { return this.service.submitQuizAttempt(org, body.schoolId, attemptId, body.studentId, actor, body.answers); }
}
