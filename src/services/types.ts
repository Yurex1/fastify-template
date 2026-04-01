import { Service } from './service/types';
import { UserService } from './user/types';
import { AuthService } from './auth/types';
import { NotificationService } from '../firebase/notification/service';
import { S3Service } from './s3/types';

export interface Services {
  service: Service;
  user: UserService;
  auth: AuthService;
  notification: NotificationService;
  s3: S3Service;
}
