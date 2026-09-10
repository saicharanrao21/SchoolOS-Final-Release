import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { Prisma, FeeFrequency } from '@prisma/client';
import { AuditService } from '../../../audit/audit.service';

@Injectable()
export class FeeStructuresService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
  ) {}

  async create(organizationId: string, data: any, actorId: string) {
    const school = await this.db.school.findFirst({
      where: { id: data.schoolId, organizationId },
    });
    if (!school) throw new NotFoundException('School not found');

    const totalAmount = data.components.reduce((sum: number, c: any) => sum + parseFloat(c.amount), 0);

    // Validate installments sum
    if (data.installments && data.installments.length > 0) {
      const installmentsTotal = data.installments.reduce((sum: number, i: any) => sum + parseFloat(i.amount), 0);
      if (Math.abs(installmentsTotal - totalAmount) > 0.01) {
        throw new BadRequestException('Total installments amount must equal total components amount');
      }
    }

    return this.db.$transaction(async (tx) => {
      const structure = await tx.feeStructure.create({
        data: {
          name: data.name,
          academicYearId: data.academicYearId,
          schoolId: data.schoolId,
          classId: data.classId,
          sectionId: data.sectionId,
          feeCategoryId: data.feeCategoryId,
          frequency: data.frequency || FeeFrequency.ANNUAL,
          totalAmount: new Prisma.Decimal(totalAmount),
          components: {
            create: data.components.map((c: any) => ({
              name: c.name,
              amount: new Prisma.Decimal(c.amount),
            })),
          },
          installments: {
            create: (data.installments || []).map((i: any, index: number) => ({
              name: i.name,
              amount: new Prisma.Decimal(i.amount),
              dueDate: new Date(i.dueDate),
              sequence: i.sequence || index + 1,
            })),
          },
        },
        include: { components: true, installments: true },
      });

      await this.audit.log({
        action: 'fee.structure.create',
        resource: 'FeeStructure',
        resourceId: structure.id,
        actorId,
        organizationId,
        schoolId: data.schoolId,
        metadata: { name: structure.name, total: totalAmount },
      });

      return structure;
    });
  }

  async findAll(organizationId: string, filters: any) {
    return this.db.feeStructure.findMany({
      where: {
        schoolId: filters.schoolId,
        academicYearId: filters.academicYearId,
        school: { organizationId },
        isActive: true,
      },
      include: { feeCategory: true, components: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(organizationId: string, id: string) {
    const structure = await this.db.feeStructure.findFirst({
      where: { id, school: { organizationId } },
      include: {
        feeCategory: true,
        components: true,
        installments: { orderBy: { sequence: 'asc' } },
        class: true,
        section: true
      },
    });
    if (!structure) throw new NotFoundException('Fee structure not found');
    return structure;
  }
}
