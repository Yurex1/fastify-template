import * as SchemaType from 'json-schema-to-ts';
import * as schemas from './schemas';
import { API, ProtectedEndpoint } from '../types';
import { Chat, ChatPreview } from '../../entities/chat';
import type { ChatService } from '../../services/chat/types';
import { ListResult } from '../../data/chatMember/types';

type CreateParam = SchemaType.FromSchema<typeof schemas.create>;
type ListParam = SchemaType.FromSchema<typeof schemas.list>;
type RemoveChatParam = SchemaType.FromSchema<typeof schemas.removeChat>;

export interface ChatApi extends API {
  create: ProtectedEndpoint<CreateParam, ChatPreview>;
  list: ProtectedEndpoint<ListParam, ListResult>;
  removeChat: ProtectedEndpoint<RemoveChatParam, { removed: boolean }>;
}

export interface Deps {
  chatService: ChatService;
}
