import { UserRepo } from './user/types';
import { PostRepo } from './post/types';

export interface Repos {
  user: UserRepo;
  post: PostRepo;
}
