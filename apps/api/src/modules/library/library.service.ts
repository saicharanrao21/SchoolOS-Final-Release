import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { AuditService } from '../../audit/audit.service';
import { Prisma, BookCopyStatus, IssueStatus, ReservationStatus, FineStatus } from '@prisma/client';

@Injectable()
export class LibraryService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
  ) {}

  private async assertLibraryInSchool(libraryId: string, schoolId: string, organizationId: string) {
    const library = await this.db.library.findFirst({ where: { id: libraryId, schoolId, school: { organizationId } } });
    if (!library) throw new NotFoundException('Library not found for this school');
    return library;
  }

  private async assertCopy(copyId: string, organizationId: string, schoolId: string) {
    const copy = await this.db.bookCopy.findFirst({
      where: { id: copyId, library: { schoolId, school: { organizationId } } },
      include: { book: true, library: { include: { policies: true } } },
    });
    if (!copy) throw new NotFoundException('Book copy not found');
    return copy;
  }

  private async assertMember(memberId: string, organizationId: string) {
    const member = await this.db.libraryMember.findFirst({ where: { id: memberId, isActive: true, user: { organizationId } } });
    if (!member) throw new NotFoundException('Library member not found');
    return member;
  }

  async createBook(organizationId: string, data: any, actorId: string) {
    const schoolId = String(data.schoolId || '');
    if (!schoolId) throw new BadRequestException('schoolId is required');
    const library = await this.assertLibraryInSchool(data.libraryId, schoolId, organizationId);
    if (data.categoryId) {
      const category = await this.db.libraryCategory.findFirst({ where: { id: data.categoryId, libraryId: library.id } });
      if (!category) throw new BadRequestException('Category does not belong to this library');
    }
    const book = await this.db.book.create({
      data: {
        title: data.title,
        subtitle: data.subtitle,
        isbn: data.isbn,
        author: data.author,
        publisher: data.publisher,
        publicationYear: data.publicationYear,
        language: data.language,
        description: data.description,
        classification: data.classification,
        libraryId: library.id,
        categoryId: data.categoryId,
      },
    });

    await this.audit.log({
      action: 'library.book.create',
      resource: 'Book',
      resourceId: book.id,
      actorId,
      organizationId,
    });

    return book;
  }

  async addCopy(organizationId: string, data: any, actorId: string) {
    const schoolId = String(data.schoolId || '');
    if (!schoolId) throw new BadRequestException('schoolId is required');
    const library = await this.assertLibraryInSchool(data.libraryId, schoolId, organizationId);
    const book = await this.db.book.findFirst({ where: { id: data.bookId, libraryId: library.id } });
    if (!book) throw new NotFoundException('Book does not belong to this library');
    const copy = await this.db.bookCopy.create({
      data: {
        accessionNumber: data.accessionNumber,
        barcode: data.barcode,
        bookId: book.id,
        libraryId: library.id,
        location: data.location,
        condition: data.condition,
        cost: data.cost,
        status: BookCopyStatus.AVAILABLE,
      },
    });

    return copy;
  }

  async issueBook(organizationId: string, data: any, actorId: string) {
    const schoolId = String(data.schoolId || '');
    if (!schoolId) throw new BadRequestException('schoolId is required');
    return this.db.$transaction(async (tx) => {
      const copy = await tx.bookCopy.findFirst({
        where: { id: data.copyId, library: { schoolId, school: { organizationId } } },
        include: { library: { include: { policies: true } }, book: true },
      });
      if (!copy || copy.status !== BookCopyStatus.AVAILABLE) throw new BadRequestException('Book copy is not available');
      const member = await tx.libraryMember.findFirst({ where: { id: data.memberId, isActive: true, user: { organizationId } } });
      if (!member) throw new NotFoundException('Library member not found');
      const policy = copy.library.policies;
      const activeCount = await tx.libraryIssue.count({ where: { memberId: member.id, status: { in: [IssueStatus.ISSUED, IssueStatus.OVERDUE, IssueStatus.RENEWED] } } });
      if (policy && activeCount >= policy.maxBooks) throw new BadRequestException('Member borrowing limit reached');
      const reserved = await tx.libraryReservation.findFirst({ where: { bookId: copy.bookId, status: ReservationStatus.PENDING, libraryId: copy.libraryId }, orderBy: { reservationDate: 'asc' } });
      if (reserved && reserved.memberId !== member.id) throw new BadRequestException('Book is reserved for another member');
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + (policy?.issueDuration || 14));
      const issue = await tx.libraryIssue.create({ data: { copyId: copy.id, memberId: member.id, dueDate, operatorId: actorId, libraryId: copy.libraryId, status: IssueStatus.ISSUED } });
      await tx.bookCopy.update({ where: { id: copy.id }, data: { status: BookCopyStatus.ISSUED } });
      if (reserved) await tx.libraryReservation.update({ where: { id: reserved.id }, data: { status: ReservationStatus.FULFILLED } });
      await this.audit.log({ action: 'library.book.issue', resource: 'LibraryIssue', resourceId: issue.id, actorId, organizationId });
      return issue;
    });
  }

  async renewBook(organizationId: string, issueId: string, data: any, actorId: string) {
    const schoolId = String(data.schoolId || '');
    if (!schoolId) throw new BadRequestException('schoolId is required');
    return this.db.$transaction(async (tx) => {
      const issue = await tx.libraryIssue.findFirst({ where: { id: issueId, library: { schoolId, school: { organizationId } } }, include: { copy: { include: { library: { include: { policies: true } } } } } });
      if (!issue || issue.status === IssueStatus.RETURNED) throw new NotFoundException('Issue not found');
      const policy = issue.copy.library.policies;
      if (issue.renewCount >= (policy?.renewalLimit || 0)) throw new BadRequestException('Renewal limit reached');
      const competing = await tx.libraryReservation.count({ where: { bookId: issue.copy.bookId, memberId: { not: issue.memberId }, status: ReservationStatus.PENDING } });
      if (competing > 0) throw new BadRequestException('Renewal blocked because another member has reserved this book');
      const dueDate = new Date(issue.dueDate);
      dueDate.setDate(dueDate.getDate() + (policy?.issueDuration || 14));
      const updated = await tx.libraryIssue.update({ where: { id: issue.id }, data: { dueDate, renewCount: { increment: 1 }, status: IssueStatus.RENEWED } });
      await this.audit.log({ action: 'library.book.renew', resource: 'LibraryIssue', resourceId: issue.id, actorId, organizationId });
      return updated;
    });
  }

  async returnBook(organizationId: string, issueId: string, actorId: string, schoolId: string) {
    if (!schoolId) throw new BadRequestException('schoolId is required');
    return this.db.$transaction(async (tx) => {
      const issue = await tx.libraryIssue.findFirst({ where: { id: issueId, library: { schoolId, school: { organizationId } } }, include: { copy: { include: { library: { include: { policies: true } } } } } });
      if (!issue || issue.status === IssueStatus.RETURNED) throw new BadRequestException('Invalid issue or already returned');
      const returnDate = new Date();
      let fineAmount = new Prisma.Decimal(0);
      const policy = issue.copy.library.policies;
      if (returnDate > issue.dueDate && policy?.finePerDay) {
        const diffDays = Math.ceil((returnDate.getTime() - issue.dueDate.getTime()) / 86400000);
        const chargeableDays = Math.max(0, diffDays - (policy.gracePeriod || 0));
        fineAmount = policy.finePerDay.mul(chargeableDays);
      }
      await tx.libraryIssue.update({ where: { id: issueId }, data: { returnDate, status: IssueStatus.RETURNED } });
      await tx.bookCopy.update({ where: { id: issue.copyId }, data: { status: BookCopyStatus.AVAILABLE } });
      if (fineAmount.gt(0)) await tx.libraryFine.upsert({ where: { issueId }, create: { issueId, amount: fineAmount, reason: 'Overdue return' }, update: { amount: fineAmount, status: FineStatus.UNPAID } });
      await this.audit.log({ action: 'library.book.return', resource: 'LibraryIssue', resourceId: issue.id, actorId, organizationId });
      return { success: true, fineAmount };
    });
  }

  async reserveBook(organizationId: string, data: any, actorId: string) {
    const schoolId = String(data.schoolId || '');
    const library = await this.assertLibraryInSchool(data.libraryId, schoolId, organizationId);
    await this.assertMember(data.memberId, organizationId);
    const book = await this.db.book.findFirst({ where: { id: data.bookId, libraryId: library.id } });
    if (!book) throw new NotFoundException('Book not found');
    const existing = await this.db.libraryReservation.findFirst({ where: { bookId: book.id, memberId: data.memberId, status: ReservationStatus.PENDING } });
    if (existing) return existing;
    const reservation = await this.db.libraryReservation.create({ data: { bookId: book.id, memberId: data.memberId, libraryId: library.id, expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined } });
    await this.audit.log({ action: 'library.reservation.create', resource: 'LibraryReservation', resourceId: reservation.id, actorId, organizationId });
    return reservation;
  }

  async cancelReservation(organizationId: string, reservationId: string, actorId: string, schoolId: string) {
    const reservation = await this.db.libraryReservation.findFirst({ where: { id: reservationId, library: { schoolId, school: { organizationId } } } });
    if (!reservation) throw new NotFoundException('Reservation not found');
    const updated = await this.db.libraryReservation.update({ where: { id: reservationId }, data: { status: ReservationStatus.CANCELLED } });
    await this.audit.log({ action: 'library.reservation.cancel', resource: 'LibraryReservation', resourceId: reservationId, actorId, organizationId });
    return updated;
  }

  async listOverdue(organizationId: string, schoolId: string) {
    if (!schoolId) throw new BadRequestException('schoolId is required');
    const now = new Date();
    await this.db.libraryIssue.updateMany({ where: { status: IssueStatus.ISSUED, dueDate: { lt: now }, library: { schoolId, school: { organizationId } } }, data: { status: IssueStatus.OVERDUE } });
    return this.db.libraryIssue.findMany({ where: { status: { in: [IssueStatus.OVERDUE, IssueStatus.ISSUED] }, dueDate: { lt: now }, library: { schoolId, school: { organizationId } } }, include: { copy: { include: { book: true } }, member: { include: { user: { select: { id: true, firstName: true, lastName: true, phone: true, email: true } } } }, fine: true }, orderBy: { dueDate: 'asc' } });
  }

  async payFine(organizationId: string, fineId: string, amount: number, actorId: string, schoolId: string) {
    if (!schoolId || amount <= 0) throw new BadRequestException('Valid schoolId and amount are required');
    const fine = await this.db.libraryFine.findFirst({ where: { id: fineId, issue: { library: { schoolId, school: { organizationId } } } } });
    if (!fine) throw new NotFoundException('Fine not found');
    const remaining = fine.amount.sub(fine.paidAmount);
    const payment = new Prisma.Decimal(amount);
    if (payment.gt(remaining)) throw new BadRequestException('Fine payment exceeds outstanding amount');
    const paidAmount = fine.paidAmount.add(payment);
    const status = paidAmount.gte(fine.amount) ? FineStatus.PAID : FineStatus.PARTIALLY_PAID;
    const updated = await this.db.libraryFine.update({ where: { id: fineId }, data: { paidAmount, status } });
    await this.audit.log({ action: 'library.fine.payment', resource: 'LibraryFine', resourceId: fineId, actorId, organizationId });
    return updated;
  }

  async listReservations(organizationId: string, schoolId: string) {
    return this.db.libraryReservation.findMany({ where: { library: { schoolId, school: { organizationId } }, status: ReservationStatus.PENDING }, include: { book: true, member: { include: { user: { select: { firstName: true, lastName: true, email: true, phone: true } } } } }, orderBy: { reservationDate: 'asc' } });
  }

  async getDashboard(organizationId: string, schoolId: string) {
    if (!schoolId) throw new BadRequestException('schoolId is required');
    const scope = { library: { schoolId, school: { organizationId } } };
    const [books, copies, issues, overdue, members, reservations, unpaidFines] = await Promise.all([
      this.db.book.count({ where: scope }),
      this.db.bookCopy.count({ where: scope }),
      this.db.libraryIssue.count({ where: { ...scope, status: { in: [IssueStatus.ISSUED, IssueStatus.OVERDUE, IssueStatus.RENEWED] } } }),
      this.db.libraryIssue.count({ where: { ...scope, dueDate: { lt: new Date() }, status: { not: IssueStatus.RETURNED } } }),
      this.db.libraryMember.count({ where: { isActive: true, user: { organizationId } } }),
      this.db.libraryReservation.count({ where: { ...scope, status: ReservationStatus.PENDING } }),
      this.db.libraryFine.aggregate({ where: { issue: scope }, _sum: { amount: true, paidAmount: true } }),
    ]);
    const fineOutstanding = new Prisma.Decimal(unpaidFines._sum.amount || 0).sub(new Prisma.Decimal(unpaidFines._sum.paidAmount || 0));
    return { totalTitles: books, totalCopies: copies, issued: issues, overdue, activeMembers: members, pendingReservations: reservations, fineOutstanding };
  }

  async findAllBooks(organizationId: string, schoolId: string, search?: string) {
    return this.db.book.findMany({ where: { library: { schoolId, school: { organizationId } }, ...(search ? { OR: [{ title: { contains: search, mode: 'insensitive' } }, { author: { contains: search, mode: 'insensitive' } }, { isbn: { contains: search, mode: 'insensitive' } }] } : {}) }, include: { category: true, library: true, _count: { select: { copies: true } } }, orderBy: { title: 'asc' } });
  }

  async getMemberIssues(userId: string, organizationId: string) {
    return this.db.libraryIssue.findMany({ where: { member: { userId, user: { organizationId } }, status: { in: [IssueStatus.ISSUED, IssueStatus.OVERDUE, IssueStatus.RENEWED] } }, include: { copy: { include: { book: true } }, fine: true }, orderBy: { dueDate: 'asc' } });
  }

  async createMember(organizationId: string, data: any, actorId: string) {
    const user = await this.db.user.findFirst({ where: { id: data.userId, organizationId } });
    if (!user) throw new NotFoundException('User not found in organization');
    const existing = await this.db.libraryMember.findUnique({ where: { userId: data.userId } });
    if (existing) return existing;
    const member = await this.db.libraryMember.create({ data: { userId: user.id, libraryCard: data.libraryCard } });
    await this.audit.log({ action: 'library.member.create', resource: 'LibraryMember', resourceId: member.id, actorId, organizationId });
    return member;
  }

  async updatePolicy(organizationId: string, libraryId: string, data: any, actorId: string, schoolId: string) {
    await this.assertLibraryInSchool(libraryId, schoolId, organizationId);
    const policy = await this.db.libraryPolicy.upsert({ where: { libraryId }, create: { libraryId, maxBooks: data.maxBooks ?? 3, issueDuration: data.issueDuration ?? 14, renewalLimit: data.renewalLimit ?? 2, finePerDay: data.finePerDay ?? 1, gracePeriod: data.gracePeriod ?? 0 }, update: { maxBooks: data.maxBooks, issueDuration: data.issueDuration, renewalLimit: data.renewalLimit, finePerDay: data.finePerDay, gracePeriod: data.gracePeriod } });
    await this.audit.log({ action: 'library.policy.update', resource: 'LibraryPolicy', resourceId: policy.id, actorId, organizationId });
    return policy;
  }
}
