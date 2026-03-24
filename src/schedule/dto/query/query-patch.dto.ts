import { Type } from 'class-transformer';
import { IsDate, IsNumber } from 'class-validator';

export class QueryPatchScheduleDto {
  @IsNumber()
  @Type(() => Number)
  id: number;

  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @IsDate()
  @Type(() => Date)
  endDate: Date;
}
