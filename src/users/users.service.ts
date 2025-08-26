import * as bcrypt from 'bcrypt';
import { AuthService } from 'src/auth/auth.service';
import { RpcException } from '@nestjs/microservices';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DeleteUsersDto } from './dto/delete-user.dto';
import { TypeUser } from 'src/auth/entities/auth.entity';
import { CacheService } from 'src/commons/cache/cache.service';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { QueryParamDto } from 'src/commons/dto/query-param.dto';
import { UpdateUserBrandDto } from './dto/update-user-brand.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { AuthRepository } from 'src/auth/repository/auth.repository';
import { UserBrandConfigurationDto } from './dto/update-map-brand.dto';
import { UpdateUserCredentialDto } from './dto/update-user-credential.dto';
import { ResponseRequestInterface } from 'src/commons/interfaces/response.interface';

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
    await this.cacheService.removeByPrefix(
      `keyv:${createUserDto.parent_id}:users:list`,
    );
    return await this.authService.signUp(createUserDto);
  }

  /**
   * List users (employees)
   * @param queryParams
   */
  async get(
    queryParams: QueryParamDto,
  ): Promise<ResponseRequestInterface | any> {
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

      // Construimos condiciones en $and
      const andConditions: any[] = [
        { parent_id: queryParams.parent_id },
        { type_user: TypeUser.employe },
      ];

      // validamos la búsqueda
      if (queryParams.search) {
        const searchRegex = new RegExp(queryParams.search as string, 'i');
        andConditions.push({
          $or: [
            { email: searchRegex },
            { username: searchRegex },
            { 'profile.full_name': searchRegex },
            { 'profile.phone': searchRegex },
          ],
        });
      }

      // query final
      const query: Record<string, any> = { $and: andConditions };

      // paginación
      const page = Number(queryParams.page) || 1;
      const perPage = Number(queryParams.perPage) || 7;
      const skip = (page - 1) * perPage;

      users = await this.userRepository.paginate(query, skip, perPage);

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
   * Update users
   * @param { UpdateUserDto }
   */
  async update(updateUserDto: UpdateUserDto) {
    await this.cacheService.removeByPrefix(
      `keyv:${updateUserDto.parent_id}:users:list`,
    );
    try {
      let user = await this.userRepository.find({
        key: '_id',
        value: updateUserDto.id,
      });

      // validate if user exist with this email
      const issetUserWithEmail = await this.userRepository.find({
        key: 'email',
        value: updateUserDto.email,
      });
      if (
        issetUserWithEmail &&
        issetUserWithEmail._id.toString() !== updateUserDto.id
      )
        throw new RpcException({
          message: `Exist one user with this email: ${updateUserDto.email}.`,
          status: HttpStatus.CONFLICT,
        });

      // validate if yser exist with this username
      const issetUserWithUsername = await this.userRepository.find({
        key: 'username',
        value: updateUserDto.username,
      });
      if (
        issetUserWithUsername &&
        issetUserWithUsername._id.toString() !== updateUserDto.id
      )
        throw new RpcException({
          message: `Exist one user with this username: ${updateUserDto.username}.`,
          status: HttpStatus.CONFLICT,
        });

      if (updateUserDto.password) {
        updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
      }

      user = await this.userRepository.update(user._id, updateUserDto);

      // return data
      return {
        success: true,
        data: user,
        message: 'User Update Success',
      };
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  /**
   * Delete users
   * @param { DeleteUsersDto } deleteUserDto
   */
  async deleteUsers(deleteUserDto: DeleteUsersDto) {
    await this.cacheService.removeByPrefix(
      `keyv:${deleteUserDto.parent_id}:users:list`,
    );

    try {
      const user = await this.userRepository.delete(
        deleteUserDto.id,
        deleteUserDto.parent_id,
      );

      // return data
      return {
        success: true,
        data: user,
        message: 'User delete success',
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
   * Get users configuration
   * @param { string } id
   */
  async findConfiguration(id: string): Promise<any> {
    // Generamos un key única para la cache basada en los queryParams
    const cacheKey = `${id}:users:list:configuration`;
    let config = await this.cacheService.getItem(cacheKey);
    if (config) {
      return {
        configuration: config || {}
      };
    }

    try {
      const user = await this.userRepository.find({
        key: '_id',
        value: id,
      });

      await this.cacheService.setItem(cacheKey, user?.brand?.configuration || {});

      // return data
      return {
        configuration: user?.brand?.configuration || {}
      };
    } catch (error) {
      throw new RpcException(error.message);
    }
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
