import { IsOptional, IsString } from 'class-validator';

export class FindByNameDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  parent_id?: string;
}
