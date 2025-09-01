import { Repos } from '../data/types';
import { WsServer } from '../server/types';
import { init as serviceInit } from './service/service';
import { init as userServiceInit } from './user/service';
import { init as authServiceInit } from './auth/service';
import { init as notificationServiceInit } from '../firebase/notification/service';
import { Services } from './types';

export const init = (repos: Repos, _wsServer: WsServer): Services => {
  const service = serviceInit();
  const user = userServiceInit({ userRepo: repos.user });
  const auth = authServiceInit({ userRepo: repos.user });
  const notification = notificationServiceInit();

  return {
    service,
    user,
    auth,
    notification,
  };
};
