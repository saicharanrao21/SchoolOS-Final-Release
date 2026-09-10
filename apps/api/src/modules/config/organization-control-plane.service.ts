import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { AuditService } from '../../audit/audit.service';
import { AuditSeverity } from '@prisma/client';

@Injectable()
export class OrganizationControlPlaneService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
  ) {}

  async getOrganization(organizationId: string) {
    const org = await this.db.organization.findUnique({
      where: { id: organizationId },
      include: {
        schools: {
          include: {
            campuses: true,
            academicYears: { where: { isCurrent: true } },
          },
        },
      },
    });
    if (!org) throw new NotFoundException('Organization not found');
    return org;
  }

  async updateOrganization(organizationId: string, actorId: string, data: any) {
    const previous = await this.getOrganization(organizationId);

    const updated = await this.db.organization.update({
      where: { id: organizationId },
      data: {
        name: data.name,
        displayName: data.displayName,
        address: data.address,
        phone: data.phone,
        email: data.email,
        website: data.website,
        timezone: data.timezone,
        currency: data.currency,
        locale: data.locale,
      },
    });

    await this.audit.log({
      action: 'organization.updated',
      resource: 'Organization',
      resourceId: organizationId,
      actorId,
      organizationId,
      severity: AuditSeverity.HIGH,
      metadata: { previous, updated },
    });

    return updated;
  }

  // --- School Management ---

  async createSchool(organizationId: string, actorId: string, data: any) {
    if (data.code) {
      const existing = await this.db.school.findFirst({
        where: { organizationId, code: data.code },
      });
      if (existing) {
        throw new BadRequestException(`School with code '${data.code}' already exists in organization`);
      }
    }

    const school = await this.db.school.create({
      data: {
        organizationId,
        name: data.name,
        displayName: data.displayName || data.name,
        code: data.code,
        legalName: data.legalName,
        affiliation: data.affiliation,
        logo: data.logo,
        address: data.address,
        city: data.city,
        state: data.state,
        country: data.country,
        postalCode: data.postalCode,
        phone: data.phone,
        email: data.email,
        website: data.website,
        timezone: data.timezone || 'UTC',
        currency: data.currency || 'USD',
        locale: data.locale || 'en-US',
        isActive: true,
      },
    });

    await this.audit.log({
      action: 'school.created',
      resource: 'School',
      resourceId: school.id,
      actorId,
      organizationId,
      schoolId: school.id,
      severity: AuditSeverity.HIGH,
    });

    return school;
  }

  async getSchools(organizationId: string) {
    return this.db.school.findMany({
      where: { organizationId },
      include: {
        campuses: true,
        academicYears: { orderBy: { createdAt: 'desc' }, take: 3 },
      },
      orderBy: { name: 'asc' },
    });
  }

  // --- Campus Management ---

  async createCampus(organizationId: string, schoolId: string, actorId: string, data: any) {
    const school = await this.db.school.findFirst({
      where: { id: schoolId, organizationId },
    });
    if (!school) throw new NotFoundException('School not found under organization');

    if (data.code) {
      const existing = await this.db.campus.findFirst({
        where: { schoolId, code: data.code },
      });
      if (existing) {
        throw new BadRequestException(`Campus with code '${data.code}' already exists in school`);
      }
    }

    const campus = await this.db.campus.create({
      data: {
        schoolId,
        name: data.name,
        code: data.code,
        address: data.address,
        phone: data.phone,
        email: data.email,
        capacity: data.capacity,
        isActive: true,
      },
    });

    await this.audit.log({
      action: 'campus.created',
      resource: 'Campus',
      resourceId: campus.id,
      actorId,
      organizationId,
      schoolId,
      severity: AuditSeverity.MEDIUM,
    });

    return campus;
  }

  async getCampuses(organizationId: string, schoolId: string) {
    return this.db.campus.findMany({
      where: { schoolId, school: { organizationId } },
      orderBy: { name: 'asc' },
    });
  }
}
