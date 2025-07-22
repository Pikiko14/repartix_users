import { Module } from '@nestjs/common';
import { CouriersService } from './couriers.service';
import { UsersService } from 'src/users/users.service';
import { NatsModule } from 'src/transports/nats.module';
import { CouriersController } from './couriers.controller';
import { CacheServiceModule } from 'src/commons/cache/cache.module';
import { UsersModule } from 'src/users/users.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [NatsModule, CacheServiceModule, UsersModule, AuthModule],
  controllers: [CouriersController],
  providers: [CouriersService],
})
export class CouriersModule {}
