import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty } from 'class-validator';

export class QueryScheduleDto {
  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  startDate: Date;
  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  endDate: Date;
}
