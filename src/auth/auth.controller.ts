import { Body, Controller, Get, Post, Put } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Auth } from '../common/decorator/auth/auth.decorator';
import { Role } from '../generated/prisma/enums';
import { RegisterDto } from './dto/register.dto';
import { User } from '../common/decorator/user/user.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Auth([Role.ADMIN])
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Auth()
  @Get('profile')
  async getProfile(@User('idUser') idUser: number) {
    return this.authService.getProfile(idUser);
  }

  @Auth()
  @Put('profile')
  async updateProfile(
    @User('idUser') idUser: number,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.authService.updateProfile(idUser, updateProfileDto);
  }
}
