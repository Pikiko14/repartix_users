import {
  IsEmail,
  IsNotEmpty,
  IsObject,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { SignInDto } from './sign-in.dto';
import { Type } from 'class-transformer';
import { ProfileDto } from './profile.dto';
import { PartialType } from '@nestjs/mapped-types';

export class SignUpDto extends PartialType(SignInDto) {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsOptional()
  scopes: string[];

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ProfileDto)
  profile?: ProfileDto;
}