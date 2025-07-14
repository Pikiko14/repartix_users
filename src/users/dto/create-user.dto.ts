import { IsIn, IsMongoId, IsOptional } from 'class-validator';
import { SignUpDto } from 'src/auth/dto/sign-up.dto';
import { TypeUser } from 'src/auth/entities/auth.entity';

export class CreateUserDto extends SignUpDto {
  @IsOptional()
  @IsMongoId()
  parent_id?: string;

  @IsOptional()
  @IsIn(['delivery', 'sender', 'employe'])
  type_user: TypeUser;
}
