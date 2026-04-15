import { IsEnum, IsNotEmpty } from 'class-validator';
import { TodoStatus } from '../../generated/prisma/enums';

export class ChangeStatusDto {
  @IsEnum(TodoStatus)
  @IsNotEmpty()
  status: TodoStatus;
}
