import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { AuditService } from '../../../audit/audit.service';
import { AdmissionStatus } from '@prisma/client';

@Injectable()
export class OffersService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
  ) {}

  async createOffer(organizationId: string, data: any, actorId: string) {
    const application = await this.db.admissionApplication.findFirst({
      where: { id: data.applicationId, school: { organizationId } },
    });
    if (!application) throw new NotFoundException('Application not found');

    return this.db.$transaction(async (tx) => {
      const offer = await tx.admissionOffer.upsert({
        where: { applicationId: data.applicationId },
        update: {
          offeredDate: new Date(),
          expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
          conditions: data.conditions,
          status: 'PENDING',
        },
        create: {
          applicationId: data.applicationId,
          expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
          conditions: data.conditions,
        },
      });

      await tx.admissionApplication.update({
        where: { id: data.applicationId },
        data: { status: AdmissionStatus.OFFER_EXTENDED },
      });

      await this.audit.log({
        action: 'admission.offer.extended',
        resource: 'AdmissionApplication',
        resourceId: data.applicationId,
        actorId,
        organizationId,
        schoolId: application.schoolId,
      });

      return offer;
    });
  }

  async updateOfferStatus(organizationId: string, id: string, status: string, actorId: string) {
    const offer = await this.db.admissionOffer.findUnique({
      where: { id },
      include: { application: true },
    });
    if (!offer) throw new NotFoundException('Offer not found');

    return this.db.$transaction(async (tx) => {
      const updated = await tx.admissionOffer.update({
        where: { id },
        data: {
          status,
          acceptedDate: status === 'ACCEPTED' ? new Date() : null
        },
      });

      let appStatus: AdmissionStatus = AdmissionStatus.OFFER_EXTENDED;
      if (status === 'ACCEPTED') appStatus = AdmissionStatus.OFFER_ACCEPTED;
      if (status === 'DECLINED') appStatus = AdmissionStatus.OFFER_DECLINED;

      await tx.admissionApplication.update({
        where: { id: offer.applicationId },
        data: { status: appStatus },
      });

      await this.audit.log({
        action: `admission.offer.${status.toLowerCase()}`,
        resource: 'AdmissionApplication',
        resourceId: offer.applicationId,
        actorId,
        organizationId,
        schoolId: offer.application.schoolId,
      });

      return updated;
    });
  }
}
