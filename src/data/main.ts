import { Repos } from './types';
import type { TypedPool } from '../infra/pg';
import { init as userRepoInit } from './user/repo';
import { init as postRepoInit } from './post/repo';

export const init = (pool: TypedPool): Repos => {
  const user = userRepoInit(pool);
  const post = postRepoInit(pool);

  return {
    user,
    post,
  };
};
