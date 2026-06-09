import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

export class DiscountDto {
  @IsNumber()
  @IsNotEmpty()
  amount: number;
  @IsString()
  @IsNotEmpty()
  note: string;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  date: Date;
}

export class UpdateDiscountDto extends DiscountDto {
  @IsNotEmpty()
  @IsBoolean()
  status: boolean;
}
