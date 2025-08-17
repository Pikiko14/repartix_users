import { Type } from 'class-transformer';
import { SignUpDto } from 'src/auth/dto/sign-up.dto';
import { CreateSenderInfoDto } from './sender-info.dto';
import { TypeUser } from 'src/auth/entities/auth.entity';
import { IsOptional, IsMongoId, IsEnum, ValidateNested } from 'class-validator';

export class CreateSenderDto extends SignUpDto {
  @IsOptional()
  @IsMongoId()
  parent_id?: string;

  @IsOptional()
  @IsEnum(TypeUser)
  type_user: TypeUser;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateSenderInfoDto)
  sender_info?: CreateSenderInfoDto;
}
