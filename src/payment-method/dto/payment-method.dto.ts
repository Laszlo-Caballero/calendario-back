import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class PaymentMethodDto {
  @IsString()
  @IsNotEmpty()
  name: string;
  @IsString()
  @IsNotEmpty()
  description: string;
}

export class UpdatePaymentMethodDto extends PaymentMethodDto {
  @IsBoolean()
  @IsNotEmpty()
  status: boolean;
}
