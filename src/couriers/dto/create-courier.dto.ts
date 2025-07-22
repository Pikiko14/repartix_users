import { Type } from 'class-transformer';
import { SignUpDto } from 'src/auth/dto/sign-up.dto';
import { CourierInfoDto } from './couriers-info.dto';
import { TypeUser } from 'src/auth/entities/auth.entity';
import { IsEnum, IsMongoId, IsOptional, ValidateNested } from 'class-validator';

export class CreateCourierDto extends SignUpDto {
  @IsOptional()
  @IsMongoId()
  parent_id?: string;

  @IsOptional()
  @IsEnum(TypeUser)
  type_user: TypeUser;

  @IsOptional()
  @ValidateNested()
  @Type(() => CourierInfoDto)
  courier_info?: CourierInfoDto;
}
