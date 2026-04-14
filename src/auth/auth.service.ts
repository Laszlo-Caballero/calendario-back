import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';
import { JwtPayload } from '../common/interface/type';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await compare(password, user.password);

    if (!isPasswordValid) {
      throw new NotFoundException('Invalid credentials');
    }

    const token: JwtPayload = {
      idUser: user.userId,
      role: user.role,
    };

    const jwtToken = this.jwtService.sign(token);

    return {
      data: user,
      token: jwtToken,
    };
  }

  async register(registerDto: RegisterDto) {
    const { email, password, ...rest } = registerDto;
    const findUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (findUser) {
      throw new ConflictException('User already exists');
    }

    const hastPassword = await hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        email,
        password: hastPassword,
        ...rest,
      },
    });

    const token: JwtPayload = {
      idUser: user.userId,
      role: user.role,
    };

    const jwtToken = this.jwtService.sign(token);

    return {
      data: user,
      token: jwtToken,
    };
  }
}
