import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { CreateScheduleManyDto } from './dto/create-schedule-many.dto';
import { QueryScheduleDto } from './dto/query.dto';
import { QueryPatchScheduleDto } from './dto/query/query-patch.dto';
import { UpdateHourDto } from './dto/query/update-hour.dto';
import { User } from '../common/decorator/user/user.decorator';
import type { JwtPayload } from '../common/interface/type';

@Controller('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Post()
  create(
    @Body() createScheduleDto: CreateScheduleDto,
    @User() user: JwtPayload,
  ) {
    return this.scheduleService.create(createScheduleDto);
  }

  @Post('many')
  createMany(@Body() createScheduleDto: CreateScheduleManyDto) {
    return this.scheduleService.createMany(createScheduleDto);
  }

  @Get()
  findAll(@Query() query: QueryScheduleDto) {
    return this.scheduleService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.scheduleService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateScheduleDto: UpdateScheduleDto,
  ) {
    return this.scheduleService.update(+id, updateScheduleDto);
  }

  @Patch()
  updateMany(
    @Query() query: QueryPatchScheduleDto,
    @Body() updateHourDto: UpdateHourDto,
  ) {
    return this.scheduleService.updateHour(query, updateHourDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.scheduleService.remove(+id);
  }
}
