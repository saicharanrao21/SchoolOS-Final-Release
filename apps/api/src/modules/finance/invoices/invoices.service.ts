import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';

@Injectable()
export class InvoicesService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(organizationId: string, filters: any) {
    const { schoolId, studentId, status } = filters;
    return this.db.feeDemand.findMany({
      where: {
        student: {
          schoolId,
          school: { organizationId }
        },
        studentId,
        status,
      },
      include: {
        student: true,
        components: true,
      },
      orderBy: { dueDate: 'desc' },
    });
  }

  async findOne(organizationId: string, id: string) {
    const invoice = await this.db.feeDemand.findFirst({
      where: {
        id,
        student: { school: { organizationId } },
      },
      include: {
        student: { include: { school: true } },
        components: true,
        payments: { include: { receipt: true } },
      },
    });
    if (!invoice) throw new NotFoundException('Invoice not found');
    return invoice;
  }
}
