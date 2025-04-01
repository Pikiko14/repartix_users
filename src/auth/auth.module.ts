import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { envs } from 'src/configuration';
import { AuthService } from './auth.service';
import { Utils } from 'src/commons/utils/utils';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthController } from './auth.controller';
import { NatsModule } from 'src/transports/nats.module';
import { User, UsersSchema } from './schemas/users.schema';
import { AuthRepository } from './repository/auth.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UsersSchema,
      }
    ]),
    JwtModule.register({
      global: true,
      secret: envs.jwt_secret,
      signOptions: { expiresIn: '1d' },
    }),
    NatsModule
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthRepository, Utils],
})
export class AuthModule {}
