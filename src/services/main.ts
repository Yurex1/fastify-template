import { Repos } from '../data/types.js';
import { WsServer } from '../server/types.js';
import { init as serviceInit } from './service/service.js';
import { Services } from './types.js';

export const init = (_repos: Repos, _wsServer: WsServer): Services => {
  const service = serviceInit();

  return {
    service,
  };
};
