import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class SchoolCalendarService {
  constructor(private readonly db: DatabaseService) {}

  async createCalendarEvent(data: {
    academicYearId: string;
    name: string;
    type: string; // "Holiday", "Event", "Exam", "Vacation"
    startDate: Date;
    endDate: Date;
    isHoliday?: boolean;
    schoolId?: string;
    campusId?: string;
  }) {
    if (new Date(data.endDate) < new Date(data.startDate)) {
      throw new BadRequestException('Event end date must be on or after start date');
    }

    return this.db.calendarEvent.create({
      data: {
        academicYearId: data.academicYearId,
        name: data.name,
        type: data.type,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        isHoliday: data.isHoliday ?? false,
        schoolId: data.schoolId,
        campusId: data.campusId,
      },
    });
  }

  async getCalendarEvents(academicYearId: string, schoolId?: string, campusId?: string) {
    return this.db.calendarEvent.findMany({
      where: {
        academicYearId,
        OR: [
          { schoolId: null, campusId: null }, // Org-wide default
          { schoolId, campusId: null },      // School override
          { schoolId, campusId },            // Campus override
        ],
      },
      orderBy: { startDate: 'asc' },
    });
  }
}
