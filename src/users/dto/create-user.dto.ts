import { IsMongoId, IsOptional } from 'class-validator';
import { SignUpDto } from 'src/auth/dto/sign-up.dto';

export class CreateUserDto extends SignUpDto {
  @IsOptional()
  @IsMongoId()
  parent_id?: string;
}
