import { envs } from './configuration';
import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    MongooseModule.forRoot(
      envs.app_env === 'production' ?  envs.atlas_url : envs.db_url,
    ),
    AuthModule,
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
  controllers: [],
  providers: [],
})
export class AppModule {}
