import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class CalendarDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsBoolean()
  @IsNotEmpty()
  isPublic: boolean;
}
