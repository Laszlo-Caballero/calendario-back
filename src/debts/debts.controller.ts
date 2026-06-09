import { Controller, Get } from '@nestjs/common';
import { DebtsService } from './debts.service';
import { Auth } from '../common/decorator/auth/auth.decorator';

@Controller('debts')
export class DebtsController {
  constructor(private readonly debtsService: DebtsService) {}

  // @Auth()
  // @Get()
  // async getAllDebts() {
  //   return this.debtsService.getAllDebts();
  // }
}
