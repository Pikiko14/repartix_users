import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  ValidateNested,
  MaxLength,
  Matches,
} from 'class-validator';

export class UpdateUserBrandDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  rut: string;

  @IsOptional()
  @IsString()
  @Matches(/^\+\d{1,3} ?\d{7,12}$/, {
    message: 'Invalid phone number format',
  })
  phone?: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(90)
  address: string;

  @IsOptional()
  @IsString()
  image_brand?: string;

  @IsOptional()
  user_id?: string;
}
