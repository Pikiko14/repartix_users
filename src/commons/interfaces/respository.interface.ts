import { SignUpDto } from "src/auth/dto/sign-up.dto";
import { UserEntity } from "src/auth/entities/auth.entity";

export interface IAuthRepository {
  create(signUpDto: SignUpDto): Promise<UserEntity | unknown>;
  
  find(params: { key: keyof UserEntity; value: any }): Promise<UserEntity | null>;
  
  update(id: string, user: UserEntity): Promise<UserEntity | null>;
  
  delete(id: string, parent_id: string): Promise<void>;
}
