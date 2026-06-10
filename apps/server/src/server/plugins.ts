import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { config } from '../config';
import type { Plugin } from './types';
import oauth2 from '@fastify/oauth2';

const corsPlugin: Plugin = {
  plugin: cors,
  options: {
    origin: config.cors.allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-device-id', 'X-Requested-With'],
    exposedHeaders: ['Set-Cookie'],
    optionsSuccessStatus: 204,
  },
};

const cookiePlugin: Plugin = {
  plugin: cookie,
  options: {},
};

export const googleOAuth = {
  plugin: oauth2,
  options: {
    name: 'googleOAuth2',
    credentials: {
      client: {
        id: config.oauth.google.clientId,
        secret: config.oauth.google.clientSecret,
      },
      auth: oauth2.GOOGLE_CONFIGURATION,
    },
    scope: ['openid', 'profile', 'email'],
    startRedirectPath: '/auth/google',
    callbackUri: config.oauth.google.redirectUri,
  },
};
const swaggerPlugin: Plugin = {
  plugin: swagger,
  options: {
    swagger: {
      info: { title: 'fastify-template', version: '1.0.0' },
      host: config.server.http.host,
      schemes: ['http', 'https'],
      securityDefinitions: {
        ApiToken: {
          description: 'Bearer [ACCESS_TOKEN]',
          type: 'apiKey',
          name: 'Authorization',
          in: 'header',
        },
        CookieAuth: {
          description: 'Refresh token stored in httpOnly cookie',
          type: 'apiKey',
          name: 'refreshToken',
          in: 'cookie',
        },
      },
      consumes: ['application/json'],
      produces: ['application/json'],
      paths: {
        '/ws': {
          get: {
            tags: ['WebSocket'],
            parameters: [
              {
                name: 'accessToken',
                description: '[access token]',
                schema: { type: 'string' },
              },
            ],
          },
        },
      },
    },
  },
};

const swaggerUiPlugin: Plugin = {
  plugin: swaggerUi,
  options: { routePrefix: '/docs' },
};

export const plugins = [cookiePlugin, corsPlugin, swaggerPlugin, swaggerUiPlugin];
