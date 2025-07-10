import { Inject, Injectable } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserCredentialDto } from './dto/update-user-credential.dto';

@Injectable()
export class UsersService {
  constructor(
    @Inject() private readonly authService: AuthService
  ) {}

  async create(createUserDto: CreateUserDto) {
    return await this.authService.signUp(createUserDto)
  }

  /**
   * Count users by parent
   * @param parentId 
   * @returns { number }
   */
  async countUsers(parentId: string): Promise<number | void> {
    return await this.authService.countUsersByParent(parentId);
  }

  /**
   * Update user credential
   * @param { UpdateUserCredentialDto } updateDredentialsDto
   */
  async updateCredentials(updateUserCredentialDto: UpdateUserCredentialDto) {
    return await this.authService.updateCredentials(updateUserCredentialDto);
  }
}
