import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';

export class DaysDto {
  @IsBoolean()
  @IsNotEmpty()
  monday: boolean;

  @IsBoolean()
  @IsNotEmpty()
  tuesday: boolean;

  @IsBoolean()
  @IsNotEmpty()
  wednesday: boolean;

  @IsBoolean()
  @IsNotEmpty()
  thursday: boolean;

  @IsBoolean()
  @IsNotEmpty()
  friday: boolean;

  @IsBoolean()
  @IsNotEmpty()
  saturday: boolean;

  @IsBoolean()
  @IsNotEmpty()
  sunday: boolean;
}

export class CreateScheduleManyDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  startDate: Date;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  endDate: Date;

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

  @ValidateNested()
  @IsNotEmpty()
  @Type(() => DaysDto)
  days: DaysDto;
}
