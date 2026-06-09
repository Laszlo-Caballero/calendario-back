import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { DiscountService } from './discount.service';
import { DiscountDto, UpdateDiscountDto } from './dto/create-discount.dto';
import { User } from '../common/decorator/user/user.decorator';
import { Auth } from '../common/decorator/auth/auth.decorator';

@Controller('discount')
export class DiscountController {
  constructor(private readonly discountService: DiscountService) {}

  @Auth()
  @Post()
  create(
    @Body() createDiscountDto: DiscountDto,
    @User('idUser') idUser: number,
  ) {
    return this.discountService.create(createDiscountDto, idUser);
  }

  @Auth()
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateDiscountDto: UpdateDiscountDto,
    @User('idUser') idUser: number,
  ) {
    return this.discountService.update(+id, updateDiscountDto, idUser);
  }

  @Auth()
  @Delete(':id')
  remove(@Param('id') id: string, @User('idUser') idUser: number) {
    return this.discountService.remove(+id, idUser);
  }
}
