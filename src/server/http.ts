import { fastify } from 'fastify';
import { plugins } from './plugins';
import { config } from '../config';
import { Deps } from './types';

export const server = fastify();

async function registerPlugins() {
  for (const plugin of plugins) {
    await server.register(plugin.plugin, plugin.options);
  }
}

export const init = async ({ services: _, apis }: Deps): Promise<void> => {
  await registerPlugins();
  for (const [service, api] of Object.entries(apis)) {
    for (const [route, endpoint] of Object.entries(api)) {
      const { access, method, params, schema, handler } = endpoint;
      const urlParams = params?.length ? `/:${params.join(':/')}` : '';
      const path = `/${service}/${route}${urlParams}`;
      const opts = { schema: { tags: [service], ...schema.properties } };

      server[method](path, opts, async (request, reply) => {
        const user =
          access !== 'none'
            ? {} // await services.auth.verify(access, request.headers.authorization)
            : null;

        const result = await handler(user, request);
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
