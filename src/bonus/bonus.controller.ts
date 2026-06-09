import {
  Controller,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Get,
  Query,
} from '@nestjs/common';
import { BonusService } from './bonus.service';
import { BonusDto, UpdateBonusDto } from './dto/bonus.dto';
import { Auth } from '../common/decorator/auth/auth.decorator';
import { User } from '../common/decorator/user/user.decorator';
import { QueryBonusDto } from './dto/query-bonus.dto';
import { MonthlyDto } from './interface/types';

@Controller('bonus')
export class BonusController {
  constructor(private readonly bonusService: BonusService) {}

  @Auth()
  @Get()
  get(@Query() query: QueryBonusDto, @User('idUser') idUser: number) {
    return this.bonusService.get(query, idUser);
  }

  @Auth()
  @Post()
  create(@Body() createBonusDto: BonusDto, @User('idUser') idUser: number) {
    return this.bonusService.create(createBonusDto, idUser);
  }

  @Auth()
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateBonusDto: UpdateBonusDto,
    @User('idUser') idUser: number,
  ) {
    return this.bonusService.update(+id, updateBonusDto, idUser);
  }

  @Auth()
  @Delete(':id')
  remove(@Param('id') id: string, @User('idUser') idUser: number) {
    return this.bonusService.remove(+id, idUser);
  }

  @Auth()
  @Get('monthly')
  getBonusByMonth(@Query() query: MonthlyDto, @User('idUser') idUser: number) {
    return this.bonusService.getBonusByMonth(query, idUser);
  }
}
