import * as bcrypt from 'bcrypt';
import { AuthService } from 'src/auth/auth.service';
import { RpcException } from '@nestjs/microservices';
import { TypeUser } from 'src/auth/entities/auth.entity';
import { CreateCourierDto } from './dto/create-courier.dto';
import { UpdateCourierDto } from './dto/update-courier.dto';
import { DeleteUsersDto } from 'src/users/dto/delete-user.dto';
import { CacheService } from 'src/commons/cache/cache.service';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { QueryParamDto } from 'src/commons/dto/query-param.dto';
import { AuthRepository } from 'src/auth/repository/auth.repository';
import { ResponseRequestInterface } from 'src/commons/interfaces/response.interface';

@Injectable()
export class CouriersService {
  scopes = ['list-order', 'update-order', 'update-user'];

  constructor(
    @Inject() private readonly authService: AuthService,
    @Inject() private readonly cacheService: CacheService,
    @Inject() private readonly userRepository: AuthRepository,
  ) {}

  async create(createCourierDto: CreateCourierDto) {
    await this.cacheService.removeByPrefix(
      `keyv:${createCourierDto.parent_id}:couriers:list`,
    );
    createCourierDto.scopes = this.scopes;
    return await this.authService.signUp(createCourierDto);
  }

  /**
   * List users
   * @param queryParams
   */
  async get(
    queryParams: QueryParamDto,
  ): Promise<ResponseRequestInterface | any> {
    try {
      // Generamos un key única para la cache basada en los queryParams
      const cacheKey = `${queryParams.parent_id}:couriers:list:${JSON.stringify(queryParams)}`;
      let users = await this.cacheService.getItem(cacheKey);
      if (users) {
        return {
          success: true,
          users,
          message: 'Couriers list (from cache)',
        };
      }

      // prepare query data
      let query: Record<string, any> = {
        parent_id: queryParams.parent_id,
        type_user: TypeUser.delivery,
      };

      // validamos la busqueda
      if (queryParams.search) {
        const searchRegex = new RegExp(queryParams.search as string, 'i');
        query = {
          $or: [
            { email: searchRegex },
            { username: searchRegex },
            { 'profile.dni': searchRegex },
            { 'profile.phone': searchRegex },
            { 'profile.full_name': searchRegex },
            { 'courier_info.vehicle_type': searchRegex },
            { 'courier_info.contract_type': searchRegex },
            { 'courier_info.license_plate': searchRegex },
            { 'courier_info.driving_license_number': searchRegex },
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
        [
          '_id',
          'username',
          'email',
          'profile',
          'type_user',
          'scopes',
          'courier_info',
        ],
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
   * Delete couriers
   * @param { DeleteUsersDto } deleteUserDto
   */
  async deleteCouriers(deleteUserDto: DeleteUsersDto) {
    await this.cacheService.removeByPrefix(
      `keyv:${deleteUserDto.parent_id}:couriers:list`,
    );

    try {
      const courier = await this.userRepository.delete(
        deleteUserDto.id,
        deleteUserDto.parent_id,
      );

      // return data
      return {
        success: true,
        data: courier,
        message: 'Courier delete success',
      };
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  /**
   * Update couriers
   * @param { UpdateCourierDto } updateCourierDto
   */
  async updateCouriers(updateCourierDto: UpdateCourierDto) {
    await this.cacheService.removeByPrefix(
      `keyv:${updateCourierDto.parent_id}:couriers:list`,
    );

    try {
      let user = await this.userRepository.find({
        key: '_id',
        value: updateCourierDto.id,
      });

      // validate if user exist with this email
      const issetUserWithEmail = await this.userRepository.find({
        key: 'email',
        value: updateCourierDto.email,
      });
      if (
        issetUserWithEmail &&
        issetUserWithEmail._id.toString() !== updateCourierDto.id
      )
        throw new RpcException({
          message: `Exist one user with this email: ${updateCourierDto.email}.`,
          status: HttpStatus.CONFLICT,
        });

      // validate if yser exist with this username
      const issetUserWithUsername = await this.userRepository.find({
        key: 'username',
        value: updateCourierDto.username,
      });
      if (
        issetUserWithUsername &&
        issetUserWithUsername._id.toString() !== updateCourierDto.id
      )
        throw new RpcException({
          message: `Exist one user with this username: ${updateCourierDto.username}.`,
          status: HttpStatus.CONFLICT,
        });

      if (updateCourierDto.password) {
        updateCourierDto.password = await bcrypt.hash(
          updateCourierDto.password,
          10,
        );
      }

      user = await this.userRepository.update(user._id, updateCourierDto);

      // return data
      return {
        success: true,
        data: user,
        message: 'Courier Update Success',
      };
    } catch (error) {
      throw new RpcException(error.message);
    }
  }
}
