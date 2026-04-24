import { UserRepo } from './user/types';
import { PostRepo } from './post/types';
import { ChatRepo } from './chat/types';
import { ChatMemberRepo } from './chatMember/types';
import { MessageRepo } from './message/types';
import { SessionRepo } from './session/types';

export interface Repos {
  user: UserRepo;
  post: PostRepo;
  chat: ChatRepo;
  chatMember: ChatMemberRepo;
  message: MessageRepo;
  sessions: SessionRepo;
}
