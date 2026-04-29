import 'dotenv/config';
import { env } from './utils/env/util';

export const config = {
  server: {
    http: {
      url: env.requireEnv('SERVER_URL'),
      port: parseInt(process.env.PORT || process.env.HTTP_PORT || '8080'),
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
  firebase: {
    projectId: env.requireEnv('FIREBASE_PROJECT_ID'),
    privateKey: env.requireEnv('FIREBASE_PRIVATE_KEY'),
    clientEmail: env.requireEnv('FIREBASE_CLIENT_EMAIL'),
  },
  aws: {
    region: env.requireEnv('AWS_REGION'),
    bucketName: env.requireEnv('AWS_S3_BUCKET_NAME'),
    accessKeyId: env.requireEnv('AWS_ACCESS_KEY_ID'),
    secretAccessKey: env.requireEnv('AWS_SECRET_ACCESS_KEY'),
  },
  cors: {
    allowedOrigins: env.requireEnv('CORS_ALLOWED_ORIGINS').split(',') || [],
  },
  node_env: process.env.NODE_ENV || 'development',
};
