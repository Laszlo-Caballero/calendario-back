import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsString } from 'class-validator';

export class CreateScheduleDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  date: Date;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  startTime: Date;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  endTime: Date;

  @IsString()
  @IsNotEmpty()
  color: string;
}
