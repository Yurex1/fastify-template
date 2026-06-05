import { Repos } from '../data/types';
import { init as serviceInit } from './service/service';
import { init as chatServiceInit } from './chat/service';
import { init as livekitServiceInit } from './livekit/service';
import { init as userServiceInit } from './user/service';
import { init as authServiceInit } from './auth/service';
import { init as postServiceInit } from './post/service';
import { init as notificationServiceInit } from '../firebase/notification/service';
import { init as s3ServiceInit } from './s3/service';

export const init = (repos: Repos) => {
  const service = serviceInit();
  const user = userServiceInit({ userRepo: repos.user });
  const auth = authServiceInit({ userRepo: repos.user, sessionRepo: repos.sessions });
  const post = postServiceInit({ postRepo: repos.post });
  const chat = chatServiceInit({
    chatRepo: repos.chat,
    chatMemberRepo: repos.chatMember,
    userRepo: repos.user,
    messageRepo: repos.message,
    pinnedMessagesRepo: repos.pinnedMessages,
  });
  const livekit = livekitServiceInit();
  const notification = notificationServiceInit();
  const s3 = s3ServiceInit();

  return {
    service,
    chat,
    livekit,
    user,
    auth,
    post,
    notification,
    s3,
  };
};
