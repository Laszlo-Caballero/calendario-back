import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class ExpenseDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @IsNumber()
  @IsOptional()
  unitPrice?: number;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  date: Date;

  @IsNumber()
  @IsNotEmpty()
  expenseCategoryId: number;

  @IsNumber()
  @IsNotEmpty()
  paymentMethodId: number;
}

export class UpdateExpenseDto extends ExpenseDto {
  @IsBoolean()
  @IsNotEmpty()
  status: boolean;
}
