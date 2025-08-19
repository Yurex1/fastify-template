import { config } from './config.js';
import { init as pgPoolInit } from './infra/pg';
import { init as reposInit } from './data/main';
import { init as wsServerInit } from './server/ws';
import { init as servicesInit } from './services/main';
import { init as apisInit } from './api/main';
import { init as serverInit } from './server/http';

const pool = await pgPoolInit(config.pg);
const repos = reposInit(pool);
const wsServer = wsServerInit(repos);
const services = servicesInit(repos, wsServer);
const apis = apisInit(services);

await serverInit({ services, apis });
