import { Inject, Injectable } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { RpcException } from '@nestjs/microservices';
import { TypeUser } from 'src/auth/entities/auth.entity';
import { CreateSenderDto } from './dto/create-sender.dto';
import { UpdateSenderDto } from './dto/update-sender.dto';
import { CacheService } from 'src/commons/cache/cache.service';
import { QueryParamDto } from 'src/commons/dto/query-param.dto';
import { AuthRepository } from 'src/auth/repository/auth.repository';
import { ResponseRequestInterface } from 'src/commons/interfaces/response.interface';

@Injectable()
export class SendersService {
  scopes = ['list-order', 'update-order', 'update-user', 'delete-order', 'update-user'];

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
      // prepare query data
      let query: Record<string, any> = {
        parent_id: queryParams.parent_id,
        type_user: TypeUser.sender,
      };

      if (queryParams.search) {
        const searchRegex = new RegExp(queryParams.search as string, 'i');
        query = {
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
        };
      }

      // validamos la data de la paginacion
      const page = queryParams.page || 1;
      const perPage = queryParams.perPage || 7;
      const skip = (parseInt(page as string) - 1) * parseInt(perPage as string);
      senders = await this.userRepository.paginate(
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
          'sender_info.rut',
          'sender_info.brand_name',
          'sender_info.manager',
          'sender_info.address',
        ],
      );

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

  update(id: number, updateSenderDto: UpdateSenderDto) {
    return `This action updates a #${id} sender`;
  }

  remove(id: number) {
    return `This action removes a #${id} sender`;
  }
}
