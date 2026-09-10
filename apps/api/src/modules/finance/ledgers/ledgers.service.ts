import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';

@Injectable()
export class LedgersService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(organizationId: string, filters: any) {
    const { schoolId, studentId, type } = filters;
    return this.db.financialLedgerEntry.findMany({
      where: {
        organizationId,
        schoolId,
        studentId,
        type,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
