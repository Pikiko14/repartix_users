import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { SendersService } from './senders.service';
import { UsersModule } from 'src/users/users.module';
import { NatsModule } from 'src/transports/nats.module';
import { SendersController } from './senders.controller';
import { CacheServiceModule } from 'src/commons/cache/cache.module';

@Module({
  imports: [NatsModule, CacheServiceModule, UsersModule, AuthModule],
  controllers: [SendersController],
  providers: [SendersService],
})
export class SendersModule {}
