import { Module } from '@nestjs/common';
import { BoardDocController } from './board-doc.controller';
import { BoardDocService } from './board-doc.service';
import { PrismaModule } from '../prisma/prisma.module';
import { CloudinaryModule } from '../common/cloudinary/cloudinary.module';

@Module({
  imports: [PrismaModule, CloudinaryModule],
  controllers: [BoardDocController],
  providers: [BoardDocService],
  exports: [BoardDocService],
})
export class BoardDocModule {}
