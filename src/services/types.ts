import { Service } from './service/types';
import { UserService } from './user/types';
import { AuthService } from './auth/types';
import { NotificationService } from '../firebase/notification/service';

export interface Services {
  service: Service;
  user: UserService;
  auth: AuthService;
  notification: NotificationService;
}
