import { Controller, Get, Post, Body, Param, Patch, UseGuards, Query } from '@nestjs/common';
import { LibraryService } from './library.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../auth/decorators/user.decorator';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { Permissions } from '../../auth/decorators/permissions.decorator';

@Controller('library')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class LibraryController {
  constructor(private readonly service: LibraryService) {}

  @Post('books')
  @Permissions('library.books.create')
  createBook(@User('org') organizationId: string, @Body() data: any, @User('id') actorId: string) { return this.service.createBook(organizationId, data, actorId); }

  @Post('copies')
  @Permissions('library.copies.manage')
  addCopy(@User('org') organizationId: string, @Body() data: any, @User('id') actorId: string) { return this.service.addCopy(organizationId, data, actorId); }

  @Post('members')
  @Permissions('library.reservation.manage')
  createMember(@User('org') organizationId: string, @Body() data: any, @User('id') actorId: string) { return this.service.createMember(organizationId, data, actorId); }

  @Post('issues')
  @Permissions('library.issue')
  issueBook(@User('org') organizationId: string, @Body() data: any, @User('id') actorId: string) { return this.service.issueBook(organizationId, data, actorId); }

  @Patch('issues/:id/renew')
  @Permissions('library.renew')
  renewBook(@User('org') organizationId: string, @Param('id') id: string, @Body() data: any, @User('id') actorId: string) { return this.service.renewBook(organizationId, id, data, actorId); }

  @Patch('issues/:id/return')
  @Permissions('library.return')
  returnBook(@User('org') organizationId: string, @Param('id') id: string, @Query('schoolId') schoolId: string, @User('id') actorId: string) { return this.service.returnBook(organizationId, id, actorId, schoolId); }

  @Post('reservations')
  @Permissions('library.reservation.manage')
  reserveBook(@User('org') organizationId: string, @Body() data: any, @User('id') actorId: string) { return this.service.reserveBook(organizationId, data, actorId); }

  @Patch('reservations/:id/cancel')
  @Permissions('library.reservation.manage')
  cancelReservation(@User('org') organizationId: string, @Param('id') id: string, @Query('schoolId') schoolId: string, @User('id') actorId: string) { return this.service.cancelReservation(organizationId, id, actorId, schoolId); }

  @Get('reservations')
  @Permissions('library.read')
  listReservations(@User('org') organizationId: string, @Query('schoolId') schoolId: string) { return this.service.listReservations(organizationId, schoolId); }

  @Get('overdue')
  @Permissions('library.read')
  listOverdue(@User('org') organizationId: string, @Query('schoolId') schoolId: string) { return this.service.listOverdue(organizationId, schoolId); }

  @Post('fines/:id/pay')
  @Permissions('library.fines.manage')
  payFine(@User('org') organizationId: string, @Param('id') id: string, @Body() data: any, @Query('schoolId') schoolId: string, @User('id') actorId: string) { return this.service.payFine(organizationId, id, Number(data.amount), actorId, schoolId); }

  @Patch('libraries/:id/policy')
  @Permissions('library.fines.manage')
  updatePolicy(@User('org') organizationId: string, @Param('id') id: string, @Body() data: any, @Query('schoolId') schoolId: string, @User('id') actorId: string) { return this.service.updatePolicy(organizationId, id, data, actorId, schoolId); }

  @Get('dashboard')
  @Permissions('library.read')
  getDashboard(@User('org') organizationId: string, @Query('schoolId') schoolId: string) { return this.service.getDashboard(organizationId, schoolId); }

  @Get('books')
  @Permissions('library.read')
  findAll(@User('org') organizationId: string, @Query('schoolId') schoolId: string, @Query('search') search?: string) { return this.service.findAllBooks(organizationId, schoolId, search); }

  @Get('my-issues')
  getMyIssues(@User('id') userId: string, @User('org') organizationId: string) { return this.service.getMemberIssues(userId, organizationId); }
}
