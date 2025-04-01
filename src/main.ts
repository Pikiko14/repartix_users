import { envs } from './configuration';
import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';

const logger = new Logger();

async function bootstrap() {
  // create app
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.NATS,
      options: {
        servers: [envs.nats_server],
      }
    },
  );

  // enable corst

  // use global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // running app
  await app.listen();
  logger.log(`Auth microservice running on port: ${envs.port}`);
}
bootstrap();
