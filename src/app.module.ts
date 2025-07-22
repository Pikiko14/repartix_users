import { envs } from './configuration';
import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { CacheServiceModule } from './commons/cache/cache.module';
import { CouriersModule } from './couriers/couriers.module';

@Module({
  imports: [
    MongooseModule.forRoot(
      envs.app_env === 'production' ?  envs.atlas_url : envs.db_url,
    ),
    AuthModule,
    UsersModule,
    CacheServiceModule,
    CouriersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
