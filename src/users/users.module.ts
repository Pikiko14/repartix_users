import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthModule } from 'src/auth/auth.module';
import { UsersController } from './users.controller';
import { NatsModule } from 'src/transports/nats.module';
import { CacheServiceModule } from 'src/commons/cache/cache.module';

@Module({
  imports: [
    AuthModule,
    NatsModule,
    CacheServiceModule
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
