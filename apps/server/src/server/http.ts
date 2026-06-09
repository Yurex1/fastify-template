import { fastify } from 'fastify';
import { plugins, googleOAuth } from './plugins';
import { config } from '../config';
import type { Deps, SessionProvider } from './types';
import { exception } from '../utils/exception/util';
import { wsPlugin } from './ws';
import { DEFAULT_DEVICE_ID } from '../data/session/constants';

export const server = fastify({
  logger: true,
  trustProxy: config.node_env === 'production',

  ajv: {
    customOptions: {
      removeAdditional: true,
      coerceTypes: true,
    },
  },
});

server.decorateRequest('lang', 'en');
server.decorateRequest('deviceId', DEFAULT_DEVICE_ID);

server.addHook('preHandler', (request, _reply, done) => {
  const acceptLang = request.headers['accept-language'];

  const parsed = acceptLang?.split(',')[0]?.split('-')[0]?.toLowerCase();
  const supported = ['en', 'uk'];

  request.lang = supported.includes(parsed ?? '') ? parsed! : 'en';
  request.deviceId = (request.headers['x-device-id'] as string) || DEFAULT_DEVICE_ID;
  done();
});

async function registerPlugins() {
  for (const plugin of plugins) {
    await server.register(plugin.plugin, plugin.options);
  }
  await server.register(googleOAuth);
}

export const init = async ({ services, apis }: Deps) => {
  await registerPlugins();
  await server.register(wsPlugin, { services });

  for (const [service, api] of Object.entries(apis)) {
    for (const [route, endpoint] of Object.entries(api)) {
      const { access, method, params, schema, handler } = endpoint;

      const urlParams = params?.length ? `/${params.map((param) => `:${param}`).join('/')}` : '';
      const path = `/${service}/${route}${urlParams}`;
      const security: Array<Record<string, string[]>> = [];
      if (access === 'access') {
        security.push({ ApiToken: [] });
      } else if (access === 'refresh') {
        security.push({ CookieAuth: [] });
      }
      const opts = {
        schema: {
          tags: [service],
          security,
          ...schema.properties,
        },
      };

      server[method](path, opts, async (request, reply) => {
        const sessionProviders: SessionProvider = {
          none: () => null,

          access: async () => {
            const authHeader = request.headers.authorization;
            if (!authHeader) throw exception.unauthorized('NO_ACCESS_TOKEN');

            const [bearer, token] = authHeader.split(' ');
            if (bearer !== 'Bearer' || !token) throw exception.unauthorized('INVALID_OAUTH_FORMAT');

            return services.auth.verify('access', token);
          },
          refresh: async () => {
            const token = request.cookies.refreshToken;
            if (!token) throw exception.unauthorized('NO_REFRESH_TOKEN');
            return services.auth.verify('refresh', token);
          },
        };
        const sessionProvider = await sessionProviders[access]();

        const result = await handler(sessionProvider, request, reply);

        if (!reply.sent) {
          return reply.send(result);
        }
      });
    }
  }
  if (config.node_env !== 'test') {
    server.listen(config.server.http, (err) => {
      if (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
      }
      console.log(`HTTP + WS server listening on ${config.server.http.port}...`);
    });
  }

  return server;
};
