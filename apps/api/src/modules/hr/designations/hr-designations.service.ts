import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';

@Injectable()
export class HrDesignationsService {
  constructor(private readonly db: DatabaseService) {}

  async create(organizationId: string, data: any) {
    return this.db.designation.create({
      data: {
        name: data.name,
        code: data.code,
        level: data.level || 1,
        schoolId: data.schoolId,
      },
    });
  }

  async findAll(organizationId: string, schoolId: string) {
    return this.db.designation.findMany({
      where: { schoolId, school: { organizationId } },
      orderBy: { level: 'asc' },
    });
  }
}
