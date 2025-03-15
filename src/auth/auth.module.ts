import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { envs } from 'src/configuration';
import { AuthService } from './auth.service';
import { Utils } from 'src/commons/utils/utils';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthController } from './auth.controller';
import { User, UsersSchema } from './schemas/users.schema';
import { AuthRepository } from './repository/auth.repository';
import { ClientsModule, Transport } from '@nestjs/microservices';

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
    ClientsModule.register([
      {
        name: envs.notification_services_name,
        transport: Transport.TCP,
        options: {
          host: envs.auth_service_host,
          port: parseInt(envs.auth_service_port),
        }
      },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthRepository, Utils],
})
export class AuthModule {}
