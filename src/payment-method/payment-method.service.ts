import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentMethodDto } from './dto/payment-method.dto';

@Injectable()
export class PaymentMethodService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.paymentMethod.findMany();
  }

  create(paymentMethodDto: PaymentMethodDto) {
    return this.prisma.paymentMethod.create({
      data: paymentMethodDto,
    });
  }

  async update(paymentMethodDto: PaymentMethodDto, id: number) {
    const paymentMethod = await this.prisma.paymentMethod.findUnique({
      where: { paymentMethodId: id },
    });

    if (!paymentMethod) {
      throw new NotFoundException('Payment method not found');
    }

    return this.prisma.paymentMethod.update({
      where: { paymentMethodId: id },
      data: paymentMethodDto,
    });
  }

  async remove(id: number) {
    const paymentMethod = await this.prisma.paymentMethod.findUnique({
      where: { paymentMethodId: id },
    });

    if (!paymentMethod) {
      throw new NotFoundException('Payment method not found');
    }

    return this.prisma.paymentMethod.update({
      where: { paymentMethodId: id },
      data: { status: false },
    });
  }
}
