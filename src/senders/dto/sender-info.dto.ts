import {
  IsString,
  IsEmail,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNotEmpty,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSenderInfoDto {
  @IsOptional()
  @IsString()
  rut?: string;

  @IsString()
  @IsNotEmpty()
  brand_name: string;

  @IsString()
  @IsNotEmpty()
  manager: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddressDto)
  address: AddressDto[];
}

export class CoordsDto {
  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;
}

export class AddressDto {
  @IsString()
  @IsNotEmpty()
  address: string;

  @ValidateNested()
  @Type(() => CoordsDto)
  coords: CoordsDto;

  @IsString()
  @IsNotEmpty()
  complement: string;
}
