import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { config } from '../config';
import { Plugin } from './types';

const corsPlugin: Plugin = {
  plugin: cors,
  options: {
    origin: ['http://localhost:8080', 'http://localhost:9090'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
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
      host: config.server.http.url,
      schemes: ['http', 'https'],
      securityDefinitions: {
        ApiToken: {
          description: 'Authorization header token, sample: {Bearer ACCESS_TOKEN REFRESH_TOKEN}',
          type: 'apiKey',
          name: 'Authorization',
          in: 'header',
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
