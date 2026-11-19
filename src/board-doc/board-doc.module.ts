import { Module } from '@nestjs/common';
import { BoardDocController } from './board-doc.controller';
import { BoardDocService } from './board-doc.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BoardDocController],
  providers: [BoardDocService],
  exports: [BoardDocService],
})
export class BoardDocModule {}
