import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class DebtsDto {
  @IsNumber()
  @IsNotEmpty()
  maxMonthlyPayment: number;

  @IsNumber()
  @IsNotEmpty()
  totalInstallments: number;

  @IsNumber()
  @IsNotEmpty()
  payment: number;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  startDate: Date;

  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  endDate: Date;
}
