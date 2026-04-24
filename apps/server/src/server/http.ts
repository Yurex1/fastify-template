import { fastify } from 'fastify';
import { plugins } from './plugins';
import { config } from '../config';
import type { Deps, SessionProvider } from './types';
import { exception } from '../utils/exception/util';

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

async function registerPlugins() {
  for (const plugin of plugins) {
    await server.register(plugin.plugin, plugin.options);
  }
}

export const init = async ({ services, apis }: Deps): Promise<typeof server> => {
  await registerPlugins();
  for (const [service, api] of Object.entries(apis)) {
    for (const [route, endpoint] of Object.entries(api)) {
      const { access, method, params, schema, handler } = endpoint;

      const urlParams = params?.length ? `/:${params.join(':/')}` : '';
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
        return reply.send(result);
      });
    }
  }
  if (config.node_env !== 'test')
    server.listen(config.server.http, (err) => {
      if (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
      }
      console.log(`HTTP server listening on ${config.server.http.port}...`);
    });

  return server;
};
