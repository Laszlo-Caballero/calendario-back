import { IsDate, IsNumber, IsOptional } from 'class-validator';
import { QueryDto } from '../../common/dto/QueryDto';
import { Type } from 'class-transformer';

export class QueryExpenseDto extends QueryDto {
  @IsNumber()
  @IsOptional()
  expenseCategoryId?: number;

  @IsNumber()
  @IsOptional()
  paymentMethodId?: number;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  startDate?: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  endDate?: Date;
}
