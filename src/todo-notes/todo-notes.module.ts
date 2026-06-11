import { Module } from '@nestjs/common';
import { TodoNotesService } from './todo-notes.service';
import { TodoNotesController } from './todo-notes.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TodoNotesController],
  providers: [TodoNotesService],
})
export class TodoNotesModule {}
