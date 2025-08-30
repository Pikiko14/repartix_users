import { IsOptional, IsString, IsBoolean, IsNumber } from 'class-validator';

export class UserBrandConfigurationDto {
  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  gmap_api__key?: string;

  @IsOptional()
  @IsBoolean()
  route_price_by_km?: boolean;

  @IsOptional()
  @IsBoolean()
  enable_google_map?: boolean;

  @IsOptional()
  @IsNumber()
  price_by_km?: number;

  @IsOptional()
  @IsString()
  user_id?: number;

  @IsOptional()
  @IsString()
  statuses?: string;
}
