import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { BonusDto, UpdateBonusDto } from './dto/bonus.dto';
import { PrismaService } from '../prisma/prisma.service';
import { QueryBonusDto } from './dto/query-bonus.dto';
import { ResponseApiPaginated } from '../common/interface/type';

@Injectable()
export class BonusService {
  constructor(private readonly prisma: PrismaService) {}

  async get(query: QueryBonusDto, idUser: number) {
    const count = this.prisma.bonus.count({
      where: {
        userId: idUser,
        date: {
          gte: query.initDate,
          lte: query.endDate,
        },
      },
    });

    const bonuses = this.prisma.bonus.findMany({
      where: {
        userId: idUser,
        date: {
          gte: query.initDate,
          lte: query.endDate,
        },
      },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    });

    const [total, data] = await this.prisma.$transaction([count, bonuses]);

    const queryPaginate: ResponseApiPaginated = {
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit),
    };

    return { data, pagination: queryPaginate };
  }

  create(createBonusDto: BonusDto, idUser: number) {
    return this.prisma.bonus.create({
      data: {
        ...createBonusDto,
        userId: idUser,
      },
    });
  }

  async update(id: number, updateBonusDto: UpdateBonusDto, idUser: number) {
    const bonus = await this.prisma.bonus.findUnique({
      where: { bonusId: id },
    });

    if (!bonus) {
      throw new NotFoundException('Bonus not found');
    }

    if (bonus.userId !== idUser) {
      throw new UnauthorizedException('Unauthorized');
    }

    return this.prisma.bonus.update({
      where: { bonusId: id },
      data: {
        ...updateBonusDto,
      },
    });
  }

  async remove(id: number, idUser: number) {
    const bonus = await this.prisma.bonus.findUnique({
      where: { bonusId: id },
    });

    if (!bonus) {
      throw new NotFoundException('Bonus not found');
    }

    if (bonus.userId !== idUser) {
      throw new UnauthorizedException('Unauthorized');
    }

    return this.prisma.bonus.update({
      where: { bonusId: id },
      data: {
        status: false,
      },
    });
  }
}
