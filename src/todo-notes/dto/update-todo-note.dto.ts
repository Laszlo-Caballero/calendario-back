import { PartialType } from '@nestjs/mapped-types';
import { CreateTodoNoteDto } from './create-todo-note.dto';

export class UpdateTodoNoteDto extends PartialType(CreateTodoNoteDto) {}
