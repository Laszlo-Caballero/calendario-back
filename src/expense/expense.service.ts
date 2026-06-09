import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ExpenseDto, UpdateExpenseDto } from './dto/expense.dto';
import { QueryExpenseDto } from './dto/query-expense.dto';
import { ResponseApiPaginated } from '../common/interface/type';

@Injectable()
export class ExpenseService {
  constructor(private readonly prisma: PrismaService) {}

  async createExpense(data: ExpenseDto, userId: number) {
    const {
      title,
      amount,
      quantity,
      unitPrice,
      date,
      expenseCategoryId,
      paymentMethodId,
    } = data;

    return this.prisma.expense.create({
      data: {
        title,
        amount,
        quantity,
        unitPrice,
        date,
        expenseCategoryExpenseCategoryId: expenseCategoryId,
        userId,
        paymentMethodPaymentMethodId: paymentMethodId,
      },
    });
  }

  async getExpenses(query: QueryExpenseDto, userId: number) {
    const {
      expenseCategoryId,
      paymentMethodId,
      startDate,
      endDate,
      page,
      limit,
    } = query;

    const skip = (page - 1) * limit;

    const filters = {
      userId,
      ...(expenseCategoryId && {
        expenseCategoryExpenseCategoryId: expenseCategoryId,
      }),
      ...(paymentMethodId && {
        paymentMethodPaymentMethodId: paymentMethodId,
      }),
      ...(startDate &&
        endDate && {
          date: {
            gte: startDate,
            lte: endDate,
          },
        }),
    };

    const count = await this.prisma.expense.count({
      where: filters,
    });

    const expenses = await this.prisma.expense.findMany({
      where: filters,
      skip,
      take: limit,
      include: {
        expenseCategory: true,
        paymentMethod: true,
      },
    });

    const params: ResponseApiPaginated = {
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    };

    return { data: expenses, pagination: params };
  }

  async updateExpense(id: number, data: UpdateExpenseDto, userId: number) {
    const expense = await this.prisma.expense.findUnique({
      where: { expenseId: id, userId },
    });

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    if (expense.userId !== userId) {
      throw new NotFoundException('Expense not found');
    }

    const {
      title,
      amount,
      quantity,
      unitPrice,
      date,
      expenseCategoryId,
      paymentMethodId,
      status,
    } = data;

    return this.prisma.expense.update({
      where: { expenseId: id, userId },
      data: {
        title,
        amount,
        quantity,
        unitPrice,
        date,
        expenseCategoryExpenseCategoryId: expenseCategoryId,
        paymentMethodPaymentMethodId: paymentMethodId,
        status,
      },
    });
  }

  async deleteExpense(id: number, userId: number) {
    const expense = await this.prisma.expense.findUnique({
      where: { expenseId: id, userId },
    });

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    if (expense.userId !== userId) {
      throw new NotFoundException('Expense not found');
    }

    return this.prisma.expense.update({
      where: { expenseId: id, userId },
      data: {
        status: false,
      },
    });
  }
}
