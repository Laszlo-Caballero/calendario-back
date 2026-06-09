import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class ExpenseCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  icon: string;
}

export class UpdateExpenseCategoryDto extends ExpenseCategoryDto {
  @IsBoolean()
  @IsNotEmpty()
  status: boolean;
}
