import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { AuditService } from '../../audit/audit.service';
import { ImportStatus, ExportStatus } from '@prisma/client';

export type ExchangeTemplate = {
  key: string;
  name: string;
  description: string;
  requiredColumns: string[];
  optionalColumns: string[];
  uniqueKeys: string[];
};

const TEMPLATES: ExchangeTemplate[] = [
  {
    key: 'STUDENT', name: 'Student Master', description: 'Students and core enrollment identity data.',
    requiredColumns: ['admissionNumber', 'firstName', 'lastName', 'dateOfBirth'],
    optionalColumns: ['gender', 'email', 'phone', 'classId', 'sectionId', 'status'], uniqueKeys: ['admissionNumber'],
  },
  {
    key: 'EMPLOYEE', name: 'Employee Directory', description: 'Employee and staff master data.',
    requiredColumns: ['employeeCode', 'firstName', 'lastName'],
    optionalColumns: ['email', 'phone', 'designationId', 'departmentId', 'employmentType', 'employmentStatus'], uniqueKeys: ['employeeCode'],
  },
  {
    key: 'GUARDIAN', name: 'Guardian Master', description: 'Parent/guardian records for family linking.',
    requiredColumns: ['phone', 'firstName', 'lastName'],
    optionalColumns: ['email', 'relationshipType', 'occupation'], uniqueKeys: ['phone'],
  },
  {
    key: 'FEE_STRUCTURE', name: 'Fee Structure', description: 'Fee categories, components and installment definitions.',
    requiredColumns: ['name', 'amount'], optionalColumns: ['frequency', 'academicYearId', 'category'], uniqueKeys: ['name', 'academicYearId'],
  },
  {
    key: 'LIBRARY_BOOK', name: 'Library Catalog', description: 'Books and catalog metadata.',
    requiredColumns: ['isbn', 'title', 'author'], optionalColumns: ['publisher', 'category', 'language', 'edition', 'quantity'], uniqueKeys: ['isbn'],
  },
  {
    key: 'ATTENDANCE', name: 'Attendance Records', description: 'Bulk attendance corrections/imports.',
    requiredColumns: ['studentId', 'date', 'status'], optionalColumns: ['remarks'], uniqueKeys: ['studentId', 'date'],
  },
];

const EXPORT_ENTITIES = [
  'STUDENTS', 'EMPLOYEES', 'GUARDIANS', 'ENROLLMENTS', 'FEES', 'PAYMENTS',
  'ATTENDANCE', 'TIMETABLE', 'EXAM_RESULTS', 'REPORT_CARDS', 'LIBRARY',
  'HOSTEL', 'TRANSPORT', 'INVENTORY', 'ASSETS', 'DOCUMENTS', 'AUDIT_LOGS',
];
const EXPORT_FORMATS = ['CSV', 'XLSX', 'PDF', 'JSON'];

@Injectable()
export class DataExchangeService {
  constructor(private readonly db: DatabaseService, private readonly audit: AuditService) {}

  getTemplates() {
    return TEMPLATES;
  }

  getExportCatalog() {
    return EXPORT_ENTITIES.map((entity) => ({ entity, formats: entity === 'AUDIT_LOGS' ? ['CSV', 'JSON'] : EXPORT_FORMATS }));
  }

  validateRows(templateKey: string, rows: Array<Record<string, unknown>>) {
    const template = this.templateOrThrow(templateKey);
    if (!Array.isArray(rows)) throw new BadRequestException('rows must be an array');
    if (rows.length > 5000) throw new BadRequestException('Validation preview is limited to 5,000 rows');

    const errors: Array<{ row: number; code: string; message: string; field?: string }> = [];
    const seen = new Set<string>();
    rows.forEach((row, index) => {
      for (const field of template.requiredColumns) {
        if (row[field] === undefined || row[field] === null || String(row[field]).trim() === '') {
          errors.push({ row: index + 2, code: 'REQUIRED', field, message: `${field} is required` });
        }
      }
      for (const field of Object.keys(row)) {
        if (![...template.requiredColumns, ...template.optionalColumns].includes(field)) {
          errors.push({ row: index + 2, code: 'UNKNOWN_COLUMN', field, message: `${field} is not supported by ${template.key}` });
        }
      }
      const unique = template.uniqueKeys.map((key) => String(row[key] ?? '').trim()).join('|');
      if (unique && !unique.includes('undefined') && seen.has(unique)) {
        errors.push({ row: index + 2, code: 'DUPLICATE', message: `Duplicate record key: ${unique}` });
      }
      if (unique) seen.add(unique);

      if (row.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(row.email))) {
        errors.push({ row: index + 2, code: 'INVALID_EMAIL', field: 'email', message: 'Invalid email address' });
      }
      if (row.amount !== undefined && (Number.isNaN(Number(row.amount)) || Number(row.amount) < 0)) {
        errors.push({ row: index + 2, code: 'INVALID_AMOUNT', field: 'amount', message: 'Amount must be a non-negative number' });
      }
    });

    return {
      template: template.key,
      rowCount: rows.length,
      valid: errors.length === 0,
      errorCount: errors.length,
      errors: errors.slice(0, 1000),
    };
  }

  async createImportJob(organizationId: string, data: any, actorId: string) {
    await this.assertSchool(organizationId, data.schoolId);
    const template = this.templateOrThrow(data.template);
    if (!data.filePath || typeof data.filePath !== 'string') throw new BadRequestException('filePath is required');

    const validation = Array.isArray(data.rows) ? this.validateRows(template.key, data.rows) : null;
    const status = validation && !validation.valid ? ImportStatus.FAILED : ImportStatus.UPLOADED;
    const job = await this.db.importJob.create({
      data: {
        template: template.key,
        filePath: data.filePath,
        organizationId,
        schoolId: data.schoolId,
        createdById: actorId,
        status,
        rowCount: validation?.rowCount ?? 0,
        errorCount: validation?.errorCount ?? 0,
        errors: validation?.errors ?? undefined,
      },
    });

    await this.audit.log({ action: 'import.job.create', resource: 'ImportJob', resourceId: job.id, actorId, organizationId, schoolId: data.schoolId, metadata: { template: template.key, validation: validation ? { valid: validation.valid, errorCount: validation.errorCount } : null } });
    return { ...job, validation };
  }

  async createExportJob(organizationId: string, data: any, actorId: string) {
    await this.assertSchool(organizationId, data.schoolId);
    if (!EXPORT_ENTITIES.includes(String(data.entity).toUpperCase())) throw new BadRequestException('Unsupported export entity');
    const format = String(data.format || '').toUpperCase();
    if (!EXPORT_FORMATS.includes(format)) throw new BadRequestException('Unsupported export format');
    const filters = data.filters && typeof data.filters === 'object' ? data.filters : undefined;

    const job = await this.db.exportJob.create({ data: { entity: String(data.entity).toUpperCase(), format, filters, organizationId, schoolId: data.schoolId, createdById: actorId, status: ExportStatus.QUEUED } });
    await this.audit.log({ action: 'export.job.create', resource: 'ExportJob', resourceId: job.id, actorId, organizationId, schoolId: data.schoolId, metadata: { entity: job.entity, format: job.format } });
    return job;
  }

  async getImportStatus(organizationId: string, schoolId: string, id: string) {
    const job = await this.db.importJob.findFirst({ where: { id, organizationId, schoolId } });
    if (!job) throw new NotFoundException('Import job not found');
    return job;
  }

  async getExportStatus(organizationId: string, schoolId: string, id: string) {
    const job = await this.db.exportJob.findFirst({ where: { id, organizationId, schoolId } });
    if (!job) throw new NotFoundException('Export job not found');
    return job;
  }

  async listJobs(organizationId: string, schoolId: string) {
    await this.assertSchool(organizationId, schoolId);
    const [imports, exports] = await Promise.all([
      this.db.importJob.findMany({ where: { organizationId, schoolId }, orderBy: { createdAt: 'desc' }, take: 50 }),
      this.db.exportJob.findMany({ where: { organizationId, schoolId }, orderBy: { createdAt: 'desc' }, take: 50 }),
    ]);
    return { imports, exports };
  }

  private templateOrThrow(key: string) {
    const template = TEMPLATES.find((item) => item.key === String(key || '').toUpperCase());
    if (!template) throw new BadRequestException(`Unsupported import template: ${key}`);
    return template;
  }

  private async assertSchool(organizationId: string, schoolId: string) {
    if (!schoolId) throw new BadRequestException('schoolId is required');
    const school = await this.db.school.findFirst({ where: { id: schoolId, organizationId }, select: { id: true } });
    if (!school) throw new NotFoundException('School not found in the current organization');
  }
}
