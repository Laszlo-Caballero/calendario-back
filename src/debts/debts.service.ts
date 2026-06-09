import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddPaymentDto, DebtsDto } from './dto/debts.dto';
import { QueryDto } from '../common/dto/QueryDto';
import { ResponseApiPaginated } from '../common/interface/type';

@Injectable()
export class DebtsService {
  constructor(private readonly prisma: PrismaService) {}

  async createDebt(createDebtDto: DebtsDto, idUser: number) {
    return this.prisma.debts.create({
      data: {
        ...createDebtDto,
        userId: idUser,
      },
    });
  }

  async getAllDebts(query: QueryDto, userId: number) {
    const { page, limit } = query;
    const skip = (page - 1) * limit;
    const [debts, total] = await this.prisma.$transaction([
      this.prisma.debts.findMany({
        where: { userId },
        skip,
        take: limit,
        include: {
          payments: true,
        },
      }),
      this.prisma.debts.count({ where: { userId } }),
    ]);

    const params: ResponseApiPaginated = {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };

    return { data: debts, pagination: params };
  }

  async update(id: number, userId: number, updateDebtDto: DebtsDto) {
    const debt = await this.prisma.debts.findUnique({
      where: { debtId: id, userId },
    });

    if (!debt) {
      throw new NotFoundException('Debt not found');
    }

    return this.prisma.debts.update({
      where: { debtId: id, userId },
      data: updateDebtDto,
    });
  }

  async delete(id: number, userId: number) {
    const debt = await this.prisma.debts.findUnique({
      where: { debtId: id, userId },
    });

    if (!debt) {
      throw new NotFoundException('Debt not found');
    }

    return this.prisma.debts.delete({
      where: { debtId: id, userId },
    });
  }

  async addPayment(
    debtId: number,
    userId: number,
    addPaymentDto: AddPaymentDto,
  ) {
    const debt = await this.prisma.debts.findUnique({
      where: { debtId, userId },
    });

    if (!debt) {
      throw new NotFoundException('Debt not found');
    }

    const queryResult = await this.prisma.$transaction(async (prisma) => {
      const payment = await prisma.debtPayment.create({
        data: {
          amount: addPaymentDto.amount,
          date: addPaymentDto.date,
          debtId,
          subscriber: addPaymentDto.subscriber,
        },
      });

      await prisma.debts.update({
        where: { debtId },
        data: {
          paidInstallments: {
            increment: 1,
          },
        },
      });

      return payment;
    });

    return queryResult;
  }

  async updateSubscriber(
    paymentId: number,
    userId: number,
    subscriberDto: { subscriber: boolean },
  ) {
    const payment = await this.prisma.debtPayment.findUnique({
      where: { debtPaymentId: paymentId },
      include: {
        debt: true,
      },
    });

    if (!payment || payment.debt.userId !== userId) {
      throw new NotFoundException('Payment not found');
    }

    return this.prisma.debtPayment.update({
      where: { debtPaymentId: paymentId },
      data: {
        subscriber: subscriberDto.subscriber,
      },
    });
  }
}
