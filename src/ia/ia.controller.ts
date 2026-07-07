import { Body, Controller, Get, Post } from '@nestjs/common';
import { IaService } from './ia.service';
import { Auth } from '../common/decorator/auth/auth.decorator';
import { Role } from '../generated/prisma/enums';
import { MessageDto } from './dto/message.dto';

@Controller('ia')
export class IaController {
  constructor(private readonly iaService: IaService) {}

  @Auth({
    role: [Role.ADMIN],
  })
  @Post()
  async generateResponse(@Body() messageDto: MessageDto) {
    return this.iaService.generateResponse(messageDto);
  }

  @Auth({
    role: [Role.ADMIN],
  })
  @Post('/sub-task')
  async generateSubTaskResponse(@Body() messageDto: MessageDto) {
    return this.iaService.generateSubtask(messageDto);
  }

  @Auth({
    role: [Role.ADMIN],
  })
  @Post('/generate-tasks')
  async generateTasks(@Body('message') messageDto: string) {
    return this.iaService.generateTasks(messageDto);
  }
}
