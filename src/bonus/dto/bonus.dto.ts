import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

export class BonusDto {
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

export class UpdateBonusDto extends BonusDto {
  @IsNotEmpty()
  @IsBoolean()
  status: boolean;
}
