import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthModule } from 'src/auth/auth.module';
import { UsersController } from './users.controller';
import { NatsModule } from 'src/transports/nats.module';

@Module({
  imports: [
    AuthModule,
    NatsModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
