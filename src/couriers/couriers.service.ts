import { Inject, Injectable } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { CreateCourierDto } from './dto/create-courier.dto';
import { CacheService } from 'src/commons/cache/cache.service';

@Injectable()
export class CouriersService {
  scopes = [
    'list-order',
    'update-order',
    'update-user',
  ];

  constructor(
    @Inject() private readonly authService: AuthService,
    @Inject() private readonly cacheService: CacheService,
  ) {}

  async create(createCourierDto: CreateCourierDto) {
    await this.cacheService.removeByPrefix(
      `keyv:${createCourierDto.parent_id}:couriers:list`,
    );
    createCourierDto.scopes = this.scopes;
    return await this.authService.signUp(createCourierDto);
  }
}
