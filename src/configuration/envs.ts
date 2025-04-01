import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
  PORT: number;
  APP_ENV: string;
  ATLAS_URL: string;
  DB_URL: string;
  JWT_SECRET: string;
  NOTIFICATION_SERVICE_NAME: string;
  NOTIFICATION_SERVICE_HOST: string;
  NOTIFICATION_SERVICE_PORT: string;
  NATS_URL: string;
}

const envsSchema = joi.object({
  PORT: joi.number().required(),
  APP_ENV: joi.string().required(),
  ATLAS_URL: joi.string().required(),
  DB_URL: joi.string().required(),
  JWT_SECRET: joi.string().required(),
  NOTIFICATION_SERVICE_NAME: joi.string().required(),
  NOTIFICATION_SERVICE_HOST: joi.string().required(),
  NOTIFICATION_SERVICE_PORT: joi.string().required(),
  NATS_URL: joi.string().required(),
})
.unknown(true);

const { error, value } = envsSchema.validate({ 
  ...process.env,
});


if ( error ) {
  throw new Error(`Config validation error: ${ error.message }`);
}

const envVars:EnvVars = value;


export const envs = {
  port: envVars.PORT,
  app_env: envVars.APP_ENV,
  atlas_url: envVars.ATLAS_URL,
  db_url: envVars.DB_URL,
  jwt_secret: envVars.JWT_SECRET,
  auth_service_host: envVars.NOTIFICATION_SERVICE_HOST,
  auth_service_port: envVars.NOTIFICATION_SERVICE_PORT,
  notification_services_name: envVars.NOTIFICATION_SERVICE_NAME,
  nats_server: envVars.NATS_URL,
}