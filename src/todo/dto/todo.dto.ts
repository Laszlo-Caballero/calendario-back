import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { TodoStatus } from '../../generated/prisma/enums';
import { Type } from 'class-transformer';

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

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  hourNotification?: Date;
}
