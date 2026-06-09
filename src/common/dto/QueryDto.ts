import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class QueryDto {
  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty()
  page: number;

  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty()
  limit: number;
}
