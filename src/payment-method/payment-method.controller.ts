import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { PaymentMethodService } from './payment-method.service';
import { Auth } from '../common/decorator/auth/auth.decorator';
import { Role } from '../generated/prisma/enums';
import { PaymentMethodDto } from './dto/payment-method.dto';

@Controller('payment-method')
export class PaymentMethodController {
  constructor(private readonly paymentMethodService: PaymentMethodService) {}

  @Auth()
  @Get()
  findAll() {
    return this.paymentMethodService.findAll();
  }

  @Auth([Role.ADMIN])
  @Post()
  create(@Body() paymentMethodDto: PaymentMethodDto) {
    return this.paymentMethodService.create(paymentMethodDto);
  }

  @Auth([Role.ADMIN])
  @Put(':id')
  update(@Body() paymentMethodDto: PaymentMethodDto, @Param('id') id: number) {
    return this.paymentMethodService.update(paymentMethodDto, id);
  }

  @Auth([Role.ADMIN])
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.paymentMethodService.remove(id);
  }
}
