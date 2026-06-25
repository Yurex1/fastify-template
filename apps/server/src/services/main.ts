import { Repos } from '../data/types';
import { init as serviceInit } from './service/service';
import { init as chatServiceInit } from './chat/service';
import { init as livekitServiceInit } from './livekit/service';
import { init as userServiceInit } from './user/service';
import { init as authServiceInit } from './auth/service';
import { init as postServiceInit } from './post/service';
import { init as notificationServiceInit } from '../firebase/notification/service';
import { init as s3ServiceInit } from './s3/service';
import { init as deviceTokenServiceInit } from './deviceToken/service';
import { init as chatNotificationServiceInit } from './chatNotifications/service';
import type { WsAdapter } from '../utils/ws/types';

export const init = (repos: Repos, ws: WsAdapter) => {
  const service = serviceInit();
  const user = userServiceInit({ userRepo: repos.user });
  const auth = authServiceInit({ userRepo: repos.user, sessionRepo: repos.sessions });
  const post = postServiceInit({ postRepo: repos.post });

  const livekit = livekitServiceInit();

  const notification = notificationServiceInit();
  const deviceToken = deviceTokenServiceInit({ deviceTokenRepo: repos.deviceToken });

  const chatNotificationService = chatNotificationServiceInit({
    deviceTokenRepo: repos.deviceToken,
    notificationService: notification,
    ws,
  });
  const s3 = s3ServiceInit();
  const chat = chatServiceInit({
    chatRepo: repos.chat,
    chatMemberRepo: repos.chatMember,
    userRepo: repos.user,
    messageRepo: repos.message,
    pinnedMessagesRepo: repos.pinnedMessages,
    chatNotificationService,
    ws,
  });

  return {
    service,
    chat,
    livekit,
    user,
    auth,
    post,
    notification,
    s3,
    deviceToken,
  };
};
