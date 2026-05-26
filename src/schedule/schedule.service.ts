import { HttpException, Injectable } from '@nestjs/common';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateScheduleManyDto, DaysDto } from './dto/create-schedule-many.dto';
import { QueryScheduleDto } from './dto/query.dto';
import { UpdateHourDto } from './dto/query/update-hour.dto';
import { QueryPatchScheduleDto } from './dto/query/query-patch.dto';
import { JwtPayload } from '../common/interface/type';
import { ImageUploadDto } from './dto/image-upload.dto';
import { CloudinaryService } from '../common/cloudinary/cloudinary.service';
import { startOfDay, endOfDay } from 'date-fns';

@Injectable()
export class ScheduleService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  private readonly dayMap: Array<keyof DaysDto> = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ];

  async create(createScheduleDto: CreateScheduleDto, user: JwtPayload) {
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

    if (!findCalendar.isPublic && user.role != 'ADMIN') {
      throw new HttpException(
        `Calendar with id ${createScheduleDto.calendarId} is not public`,
        403,
      );
    }

    return this.prisma.schedule.create({
      data: {
        ...createScheduleDto,
        calendarId: createScheduleDto.calendarId,
      },
    });
  }

  async createMany(
    createScheduleManyDto: CreateScheduleManyDto,
    user: JwtPayload,
  ) {
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

    if (!findCalendar.isPublic && user.role != 'ADMIN') {
      throw new HttpException(
        `Calendar with id ${calendarId} is not public`,
        403,
      );
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

  findAllRaw(id: number) {
    return this.prisma.schedule.findMany({
      where: { calendarId: id },
      include: {
        image: true,
      },
    });
  }

  async findAll(query: QueryScheduleDto, user: JwtPayload) {
    const findCalendar = await this.prisma.calendar.findUnique({
      where: {
        calendarId: query.calendarId,
      },
    });

    if (!findCalendar?.isPublic && user.role != 'ADMIN') {
      throw new HttpException(
        `Calendar with id ${query.calendarId} is not public`,
        403,
      );
    }

    if (findCalendar?.status === false && user.role != 'ADMIN') {
      throw new HttpException(
        `Calendar with id ${query.calendarId} is not active`,
        403,
      );
    }

    return this.prisma.schedule.findMany({
      where: {
        date: {
          gte: startOfDay(query.startDate),
          lte: endOfDay(query.endDate),
        },
        calendarId: query.calendarId,
      },
      include: {
        image: true,
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

    delete updateScheduleDto.calendarId;

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

  async uploadImage(file: Express.Multer.File, body: ImageUploadDto) {
    const { scheduleId } = body;

    if (!file) {
      throw new HttpException('No file uploaded', 400);
    }

    const findedSchedule = await this.prisma.schedule.findUnique({
      where: { scheduleId },
    });

    if (!findedSchedule) {
      throw new HttpException(`Schedule with id ${scheduleId} not found`, 404);
    }

    const [error, res] = await this.cloudinaryService.uploadImage(file);

    if (error) {
      throw new HttpException(`Error uploading image: ${error.message}`, 500);
    }

    const { secure_url, public_id } = res;

    const newImage = await this.prisma.images.create({
      data: {
        url: secure_url,
        public_id,
      },
    });

    return this.prisma.schedule.update({
      where: { scheduleId },
      data: {
        image: {
          connect: {
            imageId: newImage.imageId,
          },
        },
      },
    });
  }

  async deleteImage(scheduleId: number) {
    const findedSchedule = await this.prisma.schedule.findUnique({
      where: { scheduleId },
      include: {
        image: true,
      },
    });

    if (!findedSchedule) {
      throw new HttpException(`Schedule with id ${scheduleId} not found`, 404);
    }

    if (!findedSchedule.image) {
      throw new HttpException(
        `Schedule with id ${scheduleId} has no image`,
        404,
      );
    }

    const { public_id } = findedSchedule.image;

    const [error, res] = await this.cloudinaryService.deleteImage(public_id);

    if (error) {
      throw new HttpException(`Error deleting image: ${error.message}`, 500);
    }

    return this.prisma.images.delete({
      where: {
        imageId: findedSchedule.image.imageId,
      },
    });
  }
}
