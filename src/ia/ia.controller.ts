import { Body, Controller, Get, Post } from '@nestjs/common';
import { IaService } from './ia.service';
import { Auth } from '../common/decorator/auth/auth.decorator';
import { Role } from '../generated/prisma/enums';
import { MessageDto } from './dto/message.dto';

@Controller('ia')
export class IaController {
  constructor(private readonly iaService: IaService) {}

  @Auth([Role.ADMIN])
  @Post()
  async generateResponse(@Body() messageDto: MessageDto) {
    return this.iaService.generateResponse(messageDto);
  }
}
