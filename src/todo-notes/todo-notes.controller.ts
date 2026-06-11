import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TodoNotesService } from './todo-notes.service';
import { CreateTodoNoteDto } from './dto/create-todo-note.dto';
import { UpdateTodoNoteDto } from './dto/update-todo-note.dto';
import { Auth } from '../common/decorator/auth/auth.decorator';

@Auth()
@Controller('todo-notes')
export class TodoNotesController {
  constructor(private readonly todoNotesService: TodoNotesService) {}

  @Post()
  create(@Body() createTodoNoteDto: CreateTodoNoteDto) {
    return this.todoNotesService.create(createTodoNoteDto);
  }

  @Get(':idtodos')
  findOne(@Param('idtodos') id: string) {
    return this.todoNotesService.findAll(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTodoNoteDto: UpdateTodoNoteDto,
  ) {
    return this.todoNotesService.update(+id, updateTodoNoteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.todoNotesService.remove(+id);
  }
}
