import { Service } from './service/types';
import { ChatService } from './chat/types';
import { UserService } from './user/types';
import { AuthService } from './auth/types';
import { PostService } from './post/types';
import { NotificationService } from '../firebase/notification/service';
import { S3Service } from './s3/types';
import { LiveKitService } from './livekit/types';
import { DeviceTokenService } from './deviceToken/types';

export interface Services {
  chat: ChatService;
  service: Service;
  user: UserService;
  auth: AuthService;
  post: PostService;
  notification: NotificationService;
  s3: S3Service;
  livekit: LiveKitService;
  deviceToken: DeviceTokenService;
}
