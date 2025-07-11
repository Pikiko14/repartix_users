import { Inject, Injectable } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserBrandDto } from './dto/update-user-brand.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
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

  /**
   * Update user profile
   * @param { UpdateUserCredentialDto } updateDredentialsDto
   */
  async updateUserProfile(updateUserProfileDto: UpdateUserProfileDto) {
    return await this.authService.updateUserProfile(updateUserProfileDto);
  }

  /**
   * Update user brand
   * @param { UpdateUserBrandDto } updateUserBrandDto
   */
  async updateUserBrand(updateUserBrandDto: UpdateUserBrandDto) {
    return await this.authService.updateUserBrand(updateUserBrandDto);
  }
}
