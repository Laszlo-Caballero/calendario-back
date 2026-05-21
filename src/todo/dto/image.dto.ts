import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class ImageUploadDto {
  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty()
  todoId: number;
}
