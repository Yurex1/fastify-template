import { fastify } from 'fastify';
import { plugins } from './plugins';
import { config } from '../config';
import { Deps, SessionProvider, SessionProviderKeys } from './types';

export const server = fastify();

async function registerPlugins() {
  for (const plugin of plugins) {
    await server.register(plugin.plugin, plugin.options);
  }
}

export const init = async ({ services, apis }: Deps): Promise<void> => {
  await registerPlugins();
  for (const [service, api] of Object.entries(apis)) {
    for (const [route, endpoint] of Object.entries(api)) {
      const { access, method, params, schema, handler } = endpoint;
      const urlParams = params?.length ? `/:${params.join(':/')}` : '';
      const path = `/${service}/${route}${urlParams}`;
      const security = access === 'none' ? [] : [{ ApiToken: [] }];
      const opts = {
        schema: { tags: [service], security, ...schema.properties },
      };

      server[method](path, opts, async (request, reply) => {
        const sessionProviders: SessionProvider = {
          none: () => null,
          common: () =>
            services.auth.verify('common', request.headers.authorization),
          refresh: () =>
            services.auth.verify('refresh', request.headers.authorization),
        };
        const sessionProvider =
          await sessionProviders[access as SessionProviderKeys]();

        const result = await handler(sessionProvider, request);
        return reply.send(result);
      });
    }
  }

  server.listen(config.server.http, (err) => {
    if (err) {
      console.error('Failed to start server:', err);
      process.exit(1);
    }
    console.log(`HTTP server listening on ${config.server.http.port}...`);
  });
};
