import * as bcrypt from 'bcrypt';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { RpcException } from '@nestjs/microservices';
import { TypeUser } from 'src/auth/entities/auth.entity';
import { CreateSenderDto } from './dto/create-sender.dto';
import { UpdateSenderDto } from './dto/update-sender.dto';
import { CacheService } from 'src/commons/cache/cache.service';
import { DeleteUsersDto } from 'src/users/dto/delete-user.dto';
import { QueryParamDto } from 'src/commons/dto/query-param.dto';
import { AuthRepository } from 'src/auth/repository/auth.repository';
import { ResponseRequestInterface } from 'src/commons/interfaces/response.interface';

@Injectable()
export class SendersService {
  scopes = [
    'list-order',
    'create-order',
    'update-order',
    'update-user',
    'delete-order',
    'update-user',
    'list-client',
    'create-client',
    'update-sender',
  ];

  constructor(
    @Inject() private readonly authService: AuthService,
    @Inject() private readonly cacheService: CacheService,
    @Inject() private readonly userRepository: AuthRepository,
  ) {}

  async create(createSenderDto: CreateSenderDto) {
    await this.cacheService.removeByPrefix(
      `keyv:${createSenderDto.parent_id}:senders:list`,
    );
    createSenderDto.scopes = this.scopes;
    return await this.authService.signUp(createSenderDto);
  }

  /**
   * List senders
   * @param { QueryParamDto } queryParams
   * @returns
   */
  async findAll(
    queryParams: QueryParamDto,
  ): Promise<ResponseRequestInterface | any> {
    // Generamos un key única para la cache basada en los queryParams
    const cacheKey = `${queryParams.parent_id}:senders:list:${JSON.stringify(queryParams)}`;
    let senders = await this.cacheService.getItem(cacheKey);
    if (senders) {
      return {
        success: true,
        senders,
        message: 'Senders list (from cache)',
      };
    }

    try {
      // construimos condiciones con $and
      const andConditions: any[] = [
        { parent_id: queryParams.parent_id },
        { type_user: TypeUser.sender },
      ];

      // validamos la búsqueda
      if (queryParams.search) {
        const searchRegex = new RegExp(queryParams.search as string, 'i');
        andConditions.push({
          $or: [
            { email: searchRegex },
            { username: searchRegex },
            { 'profile.dni': searchRegex },
            { 'profile.phone': searchRegex },
            { 'profile.full_name': searchRegex },
            { 'sender_info.brand_name': searchRegex },
            { 'sender_info.manager': searchRegex },
            { 'sender_info.rut': searchRegex },
          ],
        });
      }

      // query final
      const query: Record<string, any> = { $and: andConditions };

      // paginación
      const page = Number(queryParams.page) || 1;
      const perPage = Number(queryParams.perPage) || 7;
      const skip = (page - 1) * perPage;

      senders = await this.userRepository.paginate(query, skip, perPage, [
        '_id',
        'username',
        'email',
        'profile',
        'type_user',
        'scopes',
        'sender_info.rut',
        'sender_info.brand_name',
        'sender_info.manager',
        'sender_info.address',
        'sender_info.brand_phone',
        'sender_info.discount_porcent',
      ]);

      // Guardamos el resultado en cache por 10 minutos
      await this.cacheService.setItem(cacheKey, senders);

      return {
        success: true,
        senders,
        message: 'Senders list',
      };
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  async update(updateSenderDto: UpdateSenderDto) {
    await this.cacheService.removeByPrefix(
      `keyv:${updateSenderDto.parent_id}:couriers:list`,
    );

    try {
      let sender = await this.userRepository.find({
        key: '_id',
        value: updateSenderDto.id,
      });

      // validate if sender exist with this email
      const issetUserWithEmail = await this.userRepository.find({
        key: 'email',
        value: updateSenderDto.email,
      });
      if (
        issetUserWithEmail &&
        issetUserWithEmail._id.toString() !== updateSenderDto.id
      )
        throw new RpcException({
          message: `Exist one sender with this email: ${updateSenderDto.email}.`,
          status: HttpStatus.CONFLICT,
        });

      // validate if sender exist with this username
      const issetUserWithUsername = await this.userRepository.find({
        key: 'username',
        value: updateSenderDto.username,
      });
      if (
        issetUserWithUsername &&
        issetUserWithUsername._id.toString() !== updateSenderDto.id
      )
        throw new RpcException({
          message: `Exist one user with this username: ${updateSenderDto.username}.`,
          status: HttpStatus.CONFLICT,
        });

      if (updateSenderDto.password) {
        updateSenderDto.password = await bcrypt.hash(
          updateSenderDto.password,
          10,
        );
      }

      sender = await this.userRepository.update(sender._id, updateSenderDto);

      // return data
      return {
        success: true,
        data: sender,
        message: 'Sender Update Success',
      };
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  /**
   * Delete couriers
   * @param { DeleteUsersDto } deleteUserDto
   */
  async remove(deleteUserDto: DeleteUsersDto) {
    let sender: any = await this.userRepository.find({
      key: '_id',
      value: deleteUserDto.id,
    });

    if (!sender) {
      throw new RpcException({
        message: `Sender with this id: ${deleteUserDto.id} not found`,
        status: HttpStatus.NOT_FOUND,
        error: false,
      });
    }

    await this.cacheService.removeByPrefix(
      `keyv:${deleteUserDto.parent_id}:senders:list`,
    );

    try {
      sender = await this.userRepository.delete(
        deleteUserDto.id,
        deleteUserDto.parent_id,
      );

      // return data
      return {
        success: true,
        data: sender,
        message: 'Sender delete success',
      };
    } catch (error) {
      throw new RpcException(error.message);
    }
  }
}
