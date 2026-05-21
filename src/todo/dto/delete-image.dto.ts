import { IsNotEmpty, IsNumber } from 'class-validator';

export class DeleteImagenDto {
  @IsNumber()
  @IsNotEmpty()
  todoId: number;
  @IsNumber()
  @IsNotEmpty()
  imageId: number;
}
