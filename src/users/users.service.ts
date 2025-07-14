import { Inject, Injectable } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { RpcException } from '@nestjs/microservices';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserBrandDto } from './dto/update-user-brand.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { AuthRepository } from 'src/auth/repository/auth.repository';
import { UserBrandConfigurationDto } from './dto/update-map-brand.dto';
import { UpdateUserCredentialDto } from './dto/update-user-credential.dto';

@Injectable()
export class UsersService {
  constructor(
    @Inject() private readonly authService: AuthService,
    @Inject() private readonly userRepository: AuthRepository
  ) {}

  async create(createUserDto: CreateUserDto) {
    return await this.authService.signUp(createUserDto);
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
    let user = await this.userRepository.find({
      key: '_id',
      value: updateUserProfileDto.user_id,
    });
    try {
      user.profile = updateUserProfileDto;
      user = await this.userRepository.update(user._id, user);
      return {
        success: true,
        user,
        message: 'Profile Update Success',
      };
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  /**
   * Update user brand
   * @param { UpdateUserBrandDto } updateUserBrandDto
   */
  async updateUserBrand(updateUserBrandDto: UpdateUserBrandDto) {
    let user = await this.userRepository.find({
      key: '_id',
      value: updateUserBrandDto.user_id,
    });
    try {
      user.brand = updateUserBrandDto as any;
      user = await this.userRepository.update(user._id, user);
      return {
        success: true,
        user,
        message: 'Profile Update Success',
      };
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  /**
   * Update user brand configuration
   * @param { UpdateUserBrandDto } updateUserBrandDto
   */
  async updateUserBrandConfiguration(
    updateUserBrandConfigurationDto: UserBrandConfigurationDto,
  ) {
    let user = await this.userRepository.find({
      key: '_id',
      value: updateUserBrandConfigurationDto.user_id,
    });
    try {
      user.brand.configuration = updateUserBrandConfigurationDto;
      user = await this.userRepository.update(user._id, user);
      return {
        success: true,
        user,
        message: 'Map Configuration Update Success',
      };
    } catch (error) {
      throw new RpcException(error.message);
    };
  }
}
