import { IsString, IsOptional, IsNumber, IsInt, Min, Max } from "class-validator";

export class UpdateUserProfileDto {
  @IsString()
  @IsOptional()
  full_name: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsNumber()
  phone?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  age?: number;

  @IsOptional()
  @IsString()
  user_id?: string;
}
