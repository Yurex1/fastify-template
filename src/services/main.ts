import { Repos } from '../data/types.js';
import { WsServer } from '../server/types.js';
import { init as serviceInit } from './service/service.js';
import { init as userServiceInit } from './user/service.js';
import { init as authServiceInit } from './auth/service.js';
import { Services } from './types.js';

export const init = (repos: Repos, _wsServer: WsServer): Services => {
  const service = serviceInit();
  const user = userServiceInit({ userRepo: repos.user });
  const auth = authServiceInit({ userRepo: repos.user });

  return {
    service,
    user,
    auth,
  };
};
