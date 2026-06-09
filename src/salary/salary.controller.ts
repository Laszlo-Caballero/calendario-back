import { Body, Controller, Delete, Param, Post, Put } from '@nestjs/common';
import { SalaryService } from './salary.service';
import { Auth } from '../common/decorator/auth/auth.decorator';
import { SalaryDto, UpdateSalaryDto } from './dto/salary.dto';
import { User } from '../common/decorator/user/user.decorator';

@Controller('salary')
export class SalaryController {
  constructor(private readonly salaryService: SalaryService) {}

  @Auth()
  @Post()
  async create(
    @Body() createSalaryDto: SalaryDto,
    @User('idUser') idUser: number,
  ) {
    return this.salaryService.create(createSalaryDto, idUser);
  }

  @Auth()
  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateSalaryDto: UpdateSalaryDto,
    @User('idUser') idUser: number,
  ) {
    return this.salaryService.update(id, updateSalaryDto, idUser);
  }

  @Auth()
  @Delete(':id')
  async pay(@Param('id') id: number, @User('idUser') idUser: number) {
    return this.salaryService.delete(id, idUser);
  }
}
