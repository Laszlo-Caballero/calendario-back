import { IsDate, IsOptional } from 'class-validator';
import { QueryDto } from '../../common/dto/QueryDto';
import { Type } from 'class-transformer';

export class QueryBonusDto extends QueryDto {
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  initDate: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  endDate: Date;
}
