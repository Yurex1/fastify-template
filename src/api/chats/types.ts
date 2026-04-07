import * as SchemaType from 'json-schema-to-ts';
import * as schemas from './schemas';
import { API, ProtectedEndpoint } from '../types';
import { Chat } from '../../entities/chat';
import type { ChatService } from '../../services/chat/types';

type CreateParam = SchemaType.FromSchema<typeof schemas.create>;
type ListParam = SchemaType.FromSchema<typeof schemas.list>;
type RemoveChatParam = SchemaType.FromSchema<typeof schemas.removeChat>;

export interface ChatApi extends API {
  create: ProtectedEndpoint<CreateParam, Promise<Chat>>;
  list: ProtectedEndpoint<ListParam, Promise<Chat[]>>;
  removeChat: ProtectedEndpoint<RemoveChatParam, Promise<{ removed: boolean }>>;
}

export interface Deps {
  chatService: ChatService;
}
