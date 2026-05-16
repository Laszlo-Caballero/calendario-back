import { ArrayMinSize, IsArray, IsNotEmpty, IsNumber } from 'class-validator';

export class ImportsTodoDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsNumber({}, { each: true })
  todoIds: number[];

  @IsNumber()
  @IsNotEmpty()
  todosId: number;
}
