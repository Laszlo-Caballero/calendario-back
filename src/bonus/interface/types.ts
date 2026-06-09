import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty } from 'class-validator';

export interface BonusByMonth {
  year: number;
  month: number;
  total: number;
}

export class MonthlyDto {
  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  startDate: Date;

  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  endDate: Date;
}
