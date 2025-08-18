import { Services } from '../services/types';
import { init as apiInit } from './api/api';
import { APIs } from './types';

export const init = (services: Services): APIs => {
  const api = apiInit({ service: services.service });

  return {
    api,
  };
};
