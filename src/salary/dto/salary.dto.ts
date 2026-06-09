import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
} from 'class-validator';
import { SalaryParameter } from '../../generated/prisma/enums';
import { Type } from 'class-transformer';

export class SalaryDto {
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsEnum(SalaryParameter)
  @IsNotEmpty()
  parameter: SalaryParameter;

  @IsNumber()
  @IsNotEmpty()
  dayPayment: number;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  datebegin: Date;
}

export class UpdateSalaryDto extends SalaryDto {
  @IsBoolean()
  @IsNotEmpty()
  status: boolean;
}
