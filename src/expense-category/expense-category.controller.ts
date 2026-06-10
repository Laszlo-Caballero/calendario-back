import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ExpenseCategoryService } from './expense-category.service';
import { Auth } from '../common/decorator/auth/auth.decorator';
import { Role } from '../generated/prisma/enums';
import { ExpenseCategoryDto } from './dto/expense-category.dto';

@Controller('expense-category')
export class ExpenseCategoryController {
  constructor(
    private readonly expenseCategoryService: ExpenseCategoryService,
  ) {}

  @Auth()
  @Get()
  findAll() {
    return this.expenseCategoryService.findAll();
  }

  @Auth({
    role: [Role.ADMIN],
  })
  @Post()
  create(@Body() expenseCategoryDto: ExpenseCategoryDto) {
    return this.expenseCategoryService.create(expenseCategoryDto);
  }

  @Auth({
    role: [Role.ADMIN],
  })
  @Put(':id')
  update(
    @Body() expenseCategoryDto: ExpenseCategoryDto,
    @Param('id') id: number,
  ) {
    return this.expenseCategoryService.update(expenseCategoryDto, id);
  }

  @Auth({
    role: [Role.ADMIN],
  })
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.expenseCategoryService.remove(id);
  }
}
