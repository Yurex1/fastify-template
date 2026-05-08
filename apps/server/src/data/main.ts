import { init as postRepoInit } from './post/repo';
import { init as chatRepoInit } from './chat/repo';
import { init as chatMemberRepoInit } from './chatMember/repo';
import { init as userRepoInit } from './user/repo';
import { init as sessionRepoInit } from './session/repo';
import { init as messageRepoInit } from './message/repo';
import { init as pinnedMessagesRepoInit } from './pinnedMessages/repo';

import { Repos } from './types';
import type { TypedPool } from '../infra/pg';

export const init = (pool: TypedPool): Repos => {
  const user = userRepoInit(pool);
  const post = postRepoInit(pool);
  const chat = chatRepoInit(pool);
  const chatMember = chatMemberRepoInit(pool);
  const message = messageRepoInit(pool);
  const sessions = sessionRepoInit(pool);
  const pinnedMessages = pinnedMessagesRepoInit(pool);

  return {
    user,
    post,
    chat,
    chatMember,
    message,
    sessions,
    pinnedMessages,
  };
};
