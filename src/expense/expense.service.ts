import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ExpenseDto, UpdateExpenseDto } from './dto/expense.dto';
import { QueryExpenseDto } from './dto/query-expense.dto';
import { ResponseApiPaginated } from '../common/interface/type';
import * as XLSX from 'xlsx';
import { YapeSyncData } from './interface/yape.interface';
import { parse } from 'date-fns';
import { ExpenseFrom } from '../generated/prisma/enums';

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
        from: 'MANUAL',
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
      orderBy: {
        date: 'desc',
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

  private allRowsAreEmpty(rows: any[]) {
    return rows.every((row) => {
      return Object.values(row).every((cell) => cell === null || cell === '');
    });
  }

  async syncYape(file: Express.Multer.File, userId: number) {
    if (!file) {
      throw new NotFoundException('File not found');
    }

    const workbook = XLSX.read(file.buffer, { type: 'buffer' });

    const sheetName = workbook.SheetNames[0];

    const sheet = workbook.Sheets[sheetName];

    const data: YapeSyncData[] = XLSX.utils.sheet_to_json(sheet, { range: 4 });

    const cleandata = data
      .map((item) => {
        delete item[''];
        return item;
      })
      .filter((item) => !this.allRowsAreEmpty(Object.values(item)));

    return this.prisma.$transaction(async (prisma) => {
      const datos: Array<{
        title: string;
        amount: number;
        quantity: number;
        date: Date;
        expenseCategoryExpenseCategoryId: number;
        paymentMethodPaymentMethodId: number;
        userId: number;
        from: ExpenseFrom;
      }> = [];

      for (const item of cleandata) {
        const {
          'Tipo de Transacción': type,
          Origen: from,
          Destino: to,
          Monto: amount,
          'Fecha de operación': date,
        } = item;
        const isExpense = type === 'PAGASTE';

        const title = isExpense ? `Pago a ${to}` : `Ingreso de ${from}`;

        const parseDate = parse(date, 'dd/MM/yyyy HH:mm:ss', new Date());

        const parsedAmount = parseFloat(amount.replace(/[^0-9.-]+/g, ''));

        const amoutExpense = isExpense ? -parsedAmount : parsedAmount;

        const data = {
          title,
          amount: amoutExpense,
          quantity: 1,
          date: parseDate,
          expenseCategoryExpenseCategoryId: 2,
          paymentMethodPaymentMethodId: 2,
          userId,
          from: 'YAPE' as ExpenseFrom,
        };
        datos.push(data);
      }

      await prisma.expense.createMany({
        data: datos,
      });

      return { message: 'Sync completed' };
    });
  }
}
