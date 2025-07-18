import { Inject, Injectable } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { RpcException } from '@nestjs/microservices';
import { CreateUserDto } from './dto/create-user.dto';
import { TypeUser } from 'src/auth/entities/auth.entity';
import { CacheService } from 'src/commons/cache/cache.service';
import { QueryParamDto } from 'src/commons/dto/query-param.dto';
import { UpdateUserBrandDto } from './dto/update-user-brand.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { AuthRepository } from 'src/auth/repository/auth.repository';
import { UserBrandConfigurationDto } from './dto/update-map-brand.dto';
import { UpdateUserCredentialDto } from './dto/update-user-credential.dto';

@Injectable()
export class UsersService {
  constructor(
    @Inject() private readonly authService: AuthService,
    @Inject() private readonly cacheService: CacheService,
    @Inject() private readonly userRepository: AuthRepository,
  ) {}

  /**
   * Create user
   * @param { CreateUserDto } createUserDto
   * @returns
   */
  async create(createUserDto: CreateUserDto) {
    await this.cacheService.removeByPrefix(`keyv:${createUserDto.parent_id}:users:list`);
    return await this.authService.signUp(createUserDto);
  }

  /**
   * List users
   * @param queryParams
   */
  async get(queryParams: QueryParamDto) {
    try {
      // Generamos un key única para la cache basada en los queryParams
      const cacheKey = `${queryParams.parent_id}:users:list:${JSON.stringify(queryParams)}`;
      let users = await this.cacheService.getItem(cacheKey);
      if (users) {
        return {
          success: true,
          users,
          message: 'Users list (from cache)',
        };
      }

      // prepare query data
      let query: Record<string, any> = {
        parent_id: queryParams.parent_id,
        type_user: TypeUser.employe,
      };

      // validamos la busqueda
      if (queryParams.search) {
        const searchRegex = new RegExp(queryParams.search as string, 'i');
        query = {
          $or: [
            { email: searchRegex },
            { username: searchRegex },
            { 'profile.full_name': searchRegex },
            { 'profile.phone': searchRegex },
          ],
        };
      }

      // validamos la data de la paginacion
      const page = queryParams.page || 1;
      const perPage = queryParams.perPage || 7;
      const skip = (parseInt(page as string) - 1) * parseInt(perPage as string);

      users = await this.userRepository.paginate(
        query,
        skip,
        perPage as number,
      );

      // Guardamos el resultado en cache por 10 minutos
      await this.cacheService.setItem(cacheKey, users);

      return {
        success: true,
        users,
        message: 'Users list',
      };
    } catch (error) {
      throw new RpcException(error.message);
    }
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
    }
  }
}
