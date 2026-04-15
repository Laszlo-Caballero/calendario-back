import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class TodoQueryDto {
  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty()
  todosId: number;
}
