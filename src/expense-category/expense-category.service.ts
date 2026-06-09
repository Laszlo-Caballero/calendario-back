import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ExpenseCategoryDto } from './dto/expense-category.dto';

@Injectable()
export class ExpenseCategoryService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.expenseCategory.findMany();
  }

  create(expenseCategoryDto: ExpenseCategoryDto) {
    return this.prisma.expenseCategory.create({
      data: expenseCategoryDto,
    });
  }

  async update(expenseCategoryDto: ExpenseCategoryDto, id: number) {
    const expenseCategory = await this.prisma.expenseCategory.findUnique({
      where: { expenseCategoryId: id },
    });

    if (!expenseCategory) {
      throw new NotFoundException('Expense category not found');
    }

    return this.prisma.expenseCategory.update({
      where: { expenseCategoryId: id },
      data: expenseCategoryDto,
    });
  }

  async remove(id: number) {
    const expenseCategory = await this.prisma.expenseCategory.findUnique({
      where: { expenseCategoryId: id },
    });

    if (!expenseCategory) {
      throw new NotFoundException('Expense category not found');
    }

    return this.prisma.expenseCategory.update({
      where: { expenseCategoryId: id },
      data: { status: false },
    });
  }
}
