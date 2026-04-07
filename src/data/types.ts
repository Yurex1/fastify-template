import { UserRepo } from './user/types';
import { PostRepo } from './post/types';
import { SessionRepo } from './session/types';

export interface Repos {
  user: UserRepo;
  post: PostRepo;
  sessions: SessionRepo;
}
