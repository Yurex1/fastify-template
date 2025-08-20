import 'dotenv/config';
import { env } from './utils/env/util';

export const config = {
  server: {
    http: {
      url: env.requireEnv('SERVER_URL'),
      port: parseInt(process.env.HTTP_PORT || '8080'),
      host: process.env.HOST || '0.0.0.0',
    },
    ws: {
      port: parseInt(process.env.WS_PORT || '9090'),
      host: process.env.HOST || '0.0.0.0',
    },
  },
  pg: {
    host: env.requireEnv('PG_HOST'),
    port: parseInt(env.requireEnv('PG_PORT')),
    user: env.requireEnv('PG_USER'),
    database: env.requireEnv('PG_DATABASE'),
    password: env.requireEnv('PG_PASSWORD'),
  },
  jwt: {
    secret: env.requireEnv('JWT_SECRET'),
    expiration: {
      access: env.requireEnv('JWT_ACCESS_TOKEN_EXPIRATION'),
      refresh: env.requireEnv('JWT_REFRESH_TOKEN_EXPIRATION'),
    },
  },
};
