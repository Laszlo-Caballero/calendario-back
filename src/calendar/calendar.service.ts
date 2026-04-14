import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CalendarDto } from './dto/calendar.dto';
import { Role } from '../generated/prisma/enums';
import { JwtPayload } from '../common/interface/type';

@Injectable()
export class CalendarService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllCalendars(user?: JwtPayload) {
    if (user?.role === Role.ADMIN) {
      return this.prisma.calendar.findMany();
    }
    return this.prisma.calendar.findMany({
      where: {
        status: true,
        isPublic: true,
      },
    });
  }

  async createCalendar(createData: CalendarDto) {
    return this.prisma.calendar.create({ data: createData });
  }

  async updateCalendar(id: number, updateData: CalendarDto) {
    const calendar = await this.prisma.calendar.findUnique({
      where: { calendarId: id },
    });
    if (!calendar) {
      throw new NotFoundException('Calendar not found');
    }

    return this.prisma.calendar.update({
      where: { calendarId: id },
      data: updateData,
    });
  }

  async deleteCalendar(id: number) {
    const calendar = await this.prisma.calendar.findUnique({
      where: { calendarId: id },
    });
    if (!calendar) {
      throw new NotFoundException('Calendar not found');
    }

    return this.prisma.calendar.update({
      where: { calendarId: id },
      data: { status: false },
    });
  }
}
