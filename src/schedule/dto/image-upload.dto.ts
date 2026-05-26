import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class ImageUploadDto {
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  scheduleId: number;
}
