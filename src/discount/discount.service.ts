import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { DiscountDto, UpdateDiscountDto } from './dto/create-discount.dto';
import { PrismaService } from '../prisma/prisma.service';
import { BonusByMonth, MonthlyDto } from '../bonus/interface/types';

@Injectable()
export class DiscountService {
  constructor(private readonly prisma: PrismaService) {}

  create(createDiscountDto: DiscountDto, idUser: number) {
    return this.prisma.discount.create({
      data: {
        ...createDiscountDto,
        userId: idUser,
      },
    });
  }

  async update(
    id: number,
    updateDiscountDto: UpdateDiscountDto,
    idUser: number,
  ) {
    const discount = await this.prisma.discount.findUnique({
      where: { discountId: id },
    });

    if (!discount) {
      throw new NotFoundException('Discount not found');
    }

    if (discount.userId !== idUser) {
      throw new UnauthorizedException('Discount not found');
    }

    return this.prisma.discount.update({
      where: { discountId: id },
      data: updateDiscountDto,
    });
  }

  async remove(id: number, idUser: number) {
    const discount = await this.prisma.discount.findUnique({
      where: { discountId: id },
    });

    if (!discount) {
      throw new NotFoundException('Discount not found');
    }

    if (discount.userId !== idUser) {
      throw new UnauthorizedException('Discount not found');
    }

    return this.prisma.discount.update({
      where: { discountId: id },
      data: { status: false },
    });
  }

  async getDiscountByMonth({ endDate, startDate }: MonthlyDto, idUser: number) {
    return this.prisma.$queryRaw<BonusByMonth[]>`
      SELECT
      strftime('%Y', date) AS year,
      strftime('%m', date) AS month,
      SUM(amount) AS total
      FROM Discount
      WHERE userId = ${idUser}
        AND status = 1
        AND date BETWEEN ${startDate.toISOString()} AND ${endDate.toISOString()}
      GROUP BY
        strftime('%Y', date),
        strftime('%m', date)
      ORDER BY
        year,
        month
    `;
  }
}
