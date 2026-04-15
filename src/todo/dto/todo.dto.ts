import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { TodoStatus } from '../../generated/prisma/enums';

export class TodoDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(TodoStatus)
  @IsNotEmpty()
  status: TodoStatus;

  @IsNumber()
  @IsNotEmpty()
  todosId: number;
}
