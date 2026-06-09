import { IsDate, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { QueryDto } from '../../common/dto/QueryDto';

export class QueryDebtsDto extends QueryDto {
  @IsNumber()
  @IsOptional()
  paidInstallments?: number;

  @IsNumber()
  @IsOptional()
  remainingInstallments?: number;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  startDate?: Date;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  endDate?: Date;
}
