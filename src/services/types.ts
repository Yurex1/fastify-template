import { Service } from './service/types';
import { UserService } from './user/types';
import { AuthService } from './auth/types';

export interface Services {
  service: Service;
  user: UserService;
  auth: AuthService;
}
