import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpsertBoardDocDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  subtitle?: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}
