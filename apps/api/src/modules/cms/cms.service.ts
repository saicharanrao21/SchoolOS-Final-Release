import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { AuditService } from '../../audit/audit.service';
import { AdmissionStatus } from '@prisma/client';

@Injectable()
export class CmsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
  ) {}

  // --- Admin Page Management ---

  async createPage(organizationId: string, schoolId: string, data: any, actorId: string) {
    const slug = data.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const existing = await this.db.websitePage.findFirst({
      where: { schoolId, slug },
    });
    if (existing) {
      throw new BadRequestException(`Page with slug '${slug}' already exists`);
    }

    const page = await this.db.websitePage.create({
      data: {
        organizationId,
        schoolId,
        title: data.title,
        slug,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        isPublished: data.isPublished ?? true,
        publishedAt: data.isPublished ? new Date() : null,
      },
    });

    if (Array.isArray(data.sections)) {
      for (let i = 0; i < data.sections.length; i++) {
        const sec = data.sections[i];
        await this.db.websiteSection.create({
          data: {
            pageId: page.id,
            type: sec.type || 'HERO',
            title: sec.title,
            subtitle: sec.subtitle,
            content: sec.content || {},
            sequence: i,
          },
        });
      }
    }

    await this.audit.log({
      action: 'cms.page.create',
      resource: 'WebsitePage',
      resourceId: page.id,
      actorId,
      organizationId,
      schoolId,
    });

    return page;
  }

  async getPages(organizationId: string, schoolId: string) {
    return this.db.websitePage.findMany({
      where: { schoolId, school: { organizationId } },
      include: { sections: { orderBy: { sequence: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  // --- Public Website API ---

  async getPublicWebsite(schoolIdentifier: string) {
    const school = await this.db.school.findFirst({
      where: { OR: [{ slug: schoolIdentifier }, { code: schoolIdentifier }, { id: schoolIdentifier }] },
      select: { id: true, name: true, code: true, slug: true, website: true },
    });
    if (!school) throw new NotFoundException('School not found');

    const pages = await this.db.websitePage.findMany({
      where: { schoolId: school.id, isPublished: true },
      include: { sections: { orderBy: { sequence: 'asc' } } },
    });

    return {
      school,
      pages,
    };
  }

  async submitPublicEnquiry(schoolIdentifier: string, data: any) {
    const school = await this.db.school.findFirst({
      where: { OR: [{ slug: schoolIdentifier }, { code: schoolIdentifier }, { id: schoolIdentifier }] },
    });
    if (!school) throw new NotFoundException('School not found');

    const nameParts = (data.name || 'Anonymous Inquiry').trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || 'N/A';

    const enquiry = await this.db.admissionEnquiry.create({
      data: {
        schoolId: school.id,
        enquiryNumber: `ENQ-WEB-${Date.now().toString(36).toUpperCase()}`,
        firstName,
        lastName,
        email: data.email,
        phone: data.phone || '0000000000',
        status: AdmissionStatus.ENQUIRY,
      },
    });

    return {
      success: true,
      enquiryNumber: enquiry.enquiryNumber,
      message: 'Thank you for your enquiry. Our admissions team will get in touch with you shortly.',
    };
  }
}
