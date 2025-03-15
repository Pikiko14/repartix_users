import { ValidateIf, IsEmail, IsNotEmpty, IsStrongPassword, IsUUID } from 'class-validator';

export class ChangePasswordDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @IsStrongPassword()
  password;

  @IsNotEmpty()
  @ValidateIf((o) => o.password !== o.confirmation_password, { message: 'Confirmation password must match password' })
  confirmation_password: string;

  @IsNotEmpty()
  @IsUUID()
  token: string;
}
