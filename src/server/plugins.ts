import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { config } from '../config.js';
import { Plugin } from './types.js';

const corsPlugin: Plugin = { plugin: cors, options: {} };

const swaggerPlugin: Plugin = {
  plugin: swagger,
  options: {
    swagger: {
      info: { title: 'EQuestrain API', version: '1.0.0' },
      host: config.server.http.url,
      schemes: ['http', 'https'],
      securityDefinitions: {
        ApiToken: {
          description:
            'Authorization header token, sample: {Bearer ACCESS_TOKEN REFRESH_TOKEN}',
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

export const plugins = [corsPlugin, swaggerPlugin, swaggerUiPlugin];
