import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { Auth } from '../common/decorator/auth/auth.decorator';
import { Role } from '../generated/prisma/enums';
import { CalendarDto } from './dto/calendar.dto';
import { User } from '../common/decorator/user/user.decorator';
import type { JwtPayload } from '../common/interface/type';

@Auth()
@Controller('calendar')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Get()
  async getAllCalendars(@User() user: JwtPayload) {
    return this.calendarService.getAllCalendars(user);
  }

  @Auth([Role.ADMIN])
  @Post()
  async createCalendar(@Body() calendarDto: CalendarDto) {
    return this.calendarService.createCalendar(calendarDto);
  }

  @Auth([Role.ADMIN])
  @Patch(':id')
  async updateCalendar(
    @Body() calendarDto: CalendarDto,
    @Param('id') id: string,
  ) {
    return this.calendarService.updateCalendar(+id, calendarDto);
  }

  @Auth([Role.ADMIN])
  @Delete(':id')
  async deleteCalendar(@Param('id') id: string) {
    return this.calendarService.deleteCalendar(+id);
  }
}
