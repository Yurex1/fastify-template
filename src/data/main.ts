import { Repos } from './types';
import type { TypedPool } from '../infra/pg';
import { init as userRepoInit } from './user/repo';

export const init = (pool: TypedPool): Repos => {
  const user = userRepoInit(pool);

  return {
    user,
  };
};
