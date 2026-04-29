import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { config } from '../config';
import type { Plugin } from './types';

const corsPlugin: Plugin = {
  plugin: cors,
  options: {
    origin: ['https://fastify-templateclient-production.up.railway.app', 'http://localhost:3000'],
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
        '/ws/{accessToken}': {
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

export const plugins = [corsPlugin, cookiePlugin, swaggerPlugin, swaggerUiPlugin];
