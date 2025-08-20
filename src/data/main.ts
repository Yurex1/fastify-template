import { Repos } from './types';
import type { Pool } from 'pg';
import { init as userRepoInit } from './user/repo';

export const init = (pool: Pool): Repos => {
  const user = userRepoInit(pool);

  return {
    user,
  };
};
