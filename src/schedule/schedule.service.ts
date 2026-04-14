import { HttpException, Injectable } from '@nestjs/common';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateScheduleManyDto, DaysDto } from './dto/create-schedule-many.dto';
import { QueryScheduleDto } from './dto/query.dto';
import { UpdateHourDto } from './dto/query/update-hour.dto';
import { QueryPatchScheduleDto } from './dto/query/query-patch.dto';

@Injectable()
export class ScheduleService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly dayMap: Array<keyof DaysDto> = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ];

  async create(createScheduleDto: CreateScheduleDto) {
    const findCalendar = await this.prisma.calendar.findUnique({
      where: {
        calendarId: createScheduleDto.calendarId,
        status: true,
      },
    });

    if (!findCalendar) {
      throw new HttpException(
        `Calendar with id ${createScheduleDto.calendarId} not found`,
        404,
      );
    }

    return this.prisma.schedule.create({
      data: {
        ...createScheduleDto,
        calendarId: createScheduleDto.calendarId,
      },
    });
  }

  async createMany(createScheduleManyDto: CreateScheduleManyDto) {
    const {
      title,
      description,
      startDate,
      endDate,
      startTime,
      endTime,
      color,
      days,
      calendarId,
    } = createScheduleManyDto;

    if (startDate > endDate) {
      throw new HttpException(
        'startDate must be less than or equal to endDate',
        400,
      );
    }

    const hasSelectedDays = Object.values(days).some(Boolean);
    if (!hasSelectedDays) {
      throw new HttpException('At least one day must be selected', 400);
    }

    const findCalendar = await this.prisma.calendar.findUnique({
      where: {
        calendarId,
        status: true,
      },
    });

    if (!findCalendar) {
      throw new HttpException(`Calendar with id ${calendarId} not found`, 404);
    }

    const schedules = this.getDatesInRange(startDate, endDate)
      .filter((date) => days[this.dayMap[date.getDay()]])
      .map((date) => ({
        title,
        description,
        date: this.buildDateAtMidnight(date),
        startTime: this.combineDateAndTime(date, startTime),
        endTime: this.combineDateAndTime(date, endTime),
        color,
        calendarId,
      }));

    if (schedules.length === 0) {
      throw new HttpException(
        'No dates match the selected days in the provided range',
        400,
      );
    }

    const result = await this.prisma.schedule.createMany({
      data: schedules,
    });

    return {
      insertedCount: result.count,
      schedules,
    };
  }

  private getDatesInRange(startDate: Date, endDate: Date) {
    const dates: Date[] = [];
    const currentDate = this.buildDateAtMidnight(startDate);
    const lastDate = this.buildDateAtMidnight(endDate);

    while (currentDate <= lastDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  }

  private buildDateAtMidnight(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  private combineDateAndTime(date: Date, time: Date) {
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      time.getHours(),
      time.getMinutes(),
      time.getSeconds(),
      time.getMilliseconds(),
    );
  }

  findAll(query: QueryScheduleDto) {
    return this.prisma.schedule.findMany({
      where: {
        date: {
          gte: this.buildDateAtMidnight(query.startDate),
          lte: this.buildDateAtMidnight(query.endDate),
        },
        calendarId: query.calendarId,
      },
    });
  }

  async findOne(id: number) {
    const findedSchedule = await this.prisma.schedule.findUnique({
      where: { scheduleId: id },
    });
    if (!findedSchedule) {
      throw new HttpException(`Schedule with id ${id} not found`, 404);
    }

    return findedSchedule;
  }

  async update(id: number, updateScheduleDto: UpdateScheduleDto) {
    const findedSchedule = await this.prisma.schedule.findUnique({
      where: { scheduleId: id },
    });
    if (!findedSchedule) {
      throw new HttpException(`Schedule with id ${id} not found`, 404);
    }

    return this.prisma.schedule.update({
      where: { scheduleId: id },
      data: updateScheduleDto,
    });
  }

  async remove(id: number) {
    const findedSchedule = await this.prisma.schedule.findUnique({
      where: { scheduleId: id },
    });
    if (!findedSchedule) {
      throw new HttpException(`Schedule with id ${id} not found`, 404);
    }

    return this.prisma.schedule.delete({
      where: { scheduleId: id },
    });
  }

  async updateHour(query: QueryPatchScheduleDto, updateHourDto: UpdateHourDto) {
    const { id, startDate, endDate } = query;

    const findedSchedule = await this.prisma.schedule.findUnique({
      where: { scheduleId: id },
    });

    if (!findedSchedule) {
      throw new HttpException(`Schedule with id ${id} not found`, 404);
    }

    const updatedSchedules = await this.prisma.schedule.update({
      where: { scheduleId: id },
      data: {
        startTime: updateHourDto.startTime,
        endTime: updateHourDto.endTime,
      },
    });

    return updatedSchedules;
  }
}
