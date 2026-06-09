import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SalaryDto } from './dto/salary.dto';

@Injectable()
export class SalaryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createSalaryDto: SalaryDto, idUser: number) {
    return this.prisma.salary.create({
      data: {
        ...createSalaryDto,
        userId: idUser,
      },
    });
  }

  async update(id: number, updateSalaryDto: SalaryDto, idUser: number) {
    const salary = await this.prisma.salary.findUnique({
      where: { salaryId: id },
    });

    if (!salary) {
      throw new NotFoundException('Salary not found');
    }

    if (salary.userId !== idUser) {
      throw new UnauthorizedException('Unauthorized');
    }

    return this.prisma.salary.update({
      where: { salaryId: id },
      data: {
        ...updateSalaryDto,
      },
    });
  }

  async delete(id: number, idUser: number) {
    const salary = await this.prisma.salary.findUnique({
      where: { salaryId: id },
    });

    if (!salary) {
      throw new NotFoundException('Salary not found');
    }

    if (salary.userId !== idUser) {
      throw new UnauthorizedException('Unauthorized');
    }

    return this.prisma.salary.update({
      data: {
        status: false,
      },
      where: { salaryId: id },
    });
  }
}
