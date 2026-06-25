import { config } from './config';
import { init as pgPoolInit } from './infra/pg';
import { init as reposInit } from './data/main';
import { init as servicesInit } from './services/main';
import { init as apisInit } from './api/main';
import { init as serverInit } from './server/http';
import { createWsHolder } from './utils/ws/holder';

export const start = async () => {
  const pool = await pgPoolInit(config.pg);
  const repos = reposInit(pool);
  const wsHolder = createWsHolder();
  const services = servicesInit(repos, wsHolder.proxy);
  const apis = apisInit(services);

  const server = await serverInit({ services, apis });
  wsHolder.set(server.ws);

  return {
    repos,
    services,
    cleanup: async () => {
      await server?.close();
      
      await pool.end();
    },
  };
};

if (import.meta.url === `file://${process.argv[1]}`) {
  start();
}
