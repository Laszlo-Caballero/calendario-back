import { IsArray, IsOptional, IsNumber } from 'class-validator';

export class ImportTasksToDocDto {
  @IsArray()
  @IsOptional()
  @IsNumber({}, { each: true })
  todoIds?: number[];
}
