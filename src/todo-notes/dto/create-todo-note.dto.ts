import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateTodoNoteDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsBoolean()
  @IsNotEmpty()
  isPinned: boolean;

  @IsBoolean()
  @IsNotEmpty()
  isArchived: boolean;

  @IsNumber()
  @IsNotEmpty()
  todosId: number;
}
