import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { DebtsService } from './debts.service';
import { Auth } from '../common/decorator/auth/auth.decorator';
import { User } from '../common/decorator/user/user.decorator';
import { QueryDto } from '../common/dto/QueryDto';
import { AddPaymentDto, DebtsDto } from './dto/debts.dto';

@Controller('debts')
export class DebtsController {
  constructor(private readonly debtsService: DebtsService) {}

  @Get()
  @Auth()
  getAllDebts(@Query() query: QueryDto, @User('idUser') user: number) {
    return this.debtsService.getAllDebts(query, user);
  }

  @Post()
  @Auth()
  createDebt(@Body() createDebtDto: DebtsDto, @User('idUser') user: number) {
    return this.debtsService.createDebt(createDebtDto, user);
  }

  @Put(':id')
  @Auth()
  updateDebt(
    @Query('id') id: number,
    @Body() updateDebtDto: DebtsDto,
    @User('idUser') user: number,
  ) {
    return this.debtsService.update(id, user, updateDebtDto);
  }

  @Delete(':id')
  @Auth()
  deleteDebt(@Query('id') id: number, @User('idUser') user: number) {
    return this.debtsService.delete(id, user);
  }

  @Post(':id/payment')
  @Auth()
  addPayment(
    @Query('id') debtId: number,
    @Body() addPaymentDto: AddPaymentDto,
    @User('idUser') user: number,
  ) {
    return this.debtsService.addPayment(debtId, user, addPaymentDto);
  }
}
