import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class WorkingDaysService {
  constructor(private readonly db: DatabaseService) {}

  async isWorkingDay(schoolId: string, date: Date): Promise<boolean> {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);

    // 1. Check School Calendar for Holidays
    const holiday = await this.db.calendarEvent.findFirst({
      where: {
        schoolId,
        startDate: { lte: d },
        endDate: { gte: d },
        isHoliday: true,
      },
    });

    if (holiday) return false;

    // 2. Check Weekends (Assume Saturday/Sunday for now, should be in settings)
    const day = d.getDay();
    if (day === 0 || day === 6) return false; // Sunday or Saturday

    return true;
  }

  async getWorkingDays(schoolId: string, startDate: Date, endDate: Date): Promise<Date[]> {
    const workingDays: Date[] = [];
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      if (await this.isWorkingDay(schoolId, new Date(d))) {
        workingDays.push(new Date(d));
      }
    }
    return workingDays;
  }
}
