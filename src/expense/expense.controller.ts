import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ExpenseService } from './expense.service';
import { Auth } from '../common/decorator/auth/auth.decorator';
import { QueryExpenseDto } from './dto/query-expense.dto';
import { User } from '../common/decorator/user/user.decorator';
import { ExpenseDto, UpdateExpenseDto } from './dto/expense.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('expense')
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Auth()
  @Get()
  getExpenses(@Query() query: QueryExpenseDto, @User('idUser') userId: number) {
    return this.expenseService.getExpenses(query, userId);
  }

  @Auth()
  @Post()
  createExpense(@Body() data: ExpenseDto, @User('idUser') userId: number) {
    return this.expenseService.createExpense(data, userId);
  }

  @Auth()
  @Post('sync/yape')
  @UseInterceptors(FileInterceptor('file'))
  syncYape(
    @UploadedFile() file: Express.Multer.File,
    @User('idUser') userId: number,
  ) {
    return this.expenseService.syncYape(file, userId);
  }

  @Auth()
  @Put(':id')
  updateExpense(
    @Param('id') id: number,
    @Body() data: UpdateExpenseDto,
    @User('idUser') userId: number,
  ) {
    return this.expenseService.updateExpense(id, data, userId);
  }

  @Auth()
  @Delete(':id')
  deleteExpense(@Param('id') id: number, @User('idUser') userId: number) {
    return this.expenseService.deleteExpense(id, userId);
  }
}
