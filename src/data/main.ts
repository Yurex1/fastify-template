import { Repos } from './types';
import type { TypedPool } from '../infra/pg';
import { init as userRepoInit } from './user/repo';
import { init as postRepoInit } from './post/repo';
import { init as sessionRepoInit } from './session/repo';

export const init = (pool: TypedPool): Repos => {
  const user = userRepoInit(pool);
  const post = postRepoInit(pool);
  const sessions = sessionRepoInit(pool);

  return {
    user,
    post,
    sessions,
  };
};
