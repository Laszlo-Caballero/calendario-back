import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class FolderQueryDto {
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  id?: number;
}
