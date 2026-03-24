import { Type } from 'class-transformer';
import { IsDate } from 'class-validator';

export class UpdateHourDto {
  @IsDate()
  @Type(() => Date)
  startTime: Date;

  @IsDate()
  @Type(() => Date)
  endTime: Date;
}
