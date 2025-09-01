import { config } from './config';
import { init as pgPoolInit } from './infra/pg';
import { init as reposInit } from './data/main';
import { init as wsServerInit } from './server/ws';
import { init as servicesInit } from './services/main';
import { init as apisInit } from './api/main';
import { init as serverInit } from './server/http';

export const start = async () => {
  const pool = await pgPoolInit(config.pg);
  const repos = reposInit(pool);
  const wsServer = wsServerInit(repos);
  const services = servicesInit(repos, wsServer);
  const apis = apisInit(services);

  const server = await serverInit({ services, apis });

  return {
    repos,
    services,
    cleanup: async () => {
      await server.close();
      await pool.end();
      if (wsServer.server) {
        wsServer.server.close();
      }
    },
  };
};

if (import.meta.url === `file://${process.argv[1]}`) {
  start();
}
