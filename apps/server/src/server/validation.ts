import Ajv, { ValidateFunction } from 'ajv';
import { CHAT_ACTIONS } from '../services/chat/consts';
import { CALL_ACTIONS } from '../services/livekit/consts';

export const MAX_TEXT_LENGTH = 4096;
export const MAX_NAME_LENGTH = 128;

export interface SendMessagePayload {
  chatId: number;
  text: string;
  reply_id?: number | null;
}

export interface UpdateMessagePayload {
  messageId: number;
  definition: { content: string; type: 'text' };
}

export interface TypingPayload {
  chatId: number;
}

export interface UpdateReactionPayload {
  id: number;
  reaction: string;
  chatId: number;
}

export interface DeleteMessagePayload {
  messageId: number;
}

export interface CreateRoomPayload {
  chatId: number;
  roomName: string;
  chatName: string;
}

const ajv = new Ajv({ allErrors: true, coerceTypes: false });

const schemas: Record<string, object> = {
  [CHAT_ACTIONS.sendMessage]: {
    type: 'object',
    properties: {
      chatId: { type: 'integer' },
      text: { type: 'string', minLength: 1, maxLength: MAX_TEXT_LENGTH },
      reply_id: { type: 'integer', nullable: true },
    },
    required: ['chatId', 'text'],
    additionalProperties: false,
  },
  [CHAT_ACTIONS.updateMessage]: {
    type: 'object',
    properties: {
      messageId: { type: 'integer' },
      definition: {
        type: 'object',
        properties: {
          content: { type: 'string', minLength: 1, maxLength: MAX_TEXT_LENGTH },
          type: { type: 'string', enum: ['text'] },
        },
        required: ['content', 'type'],
        additionalProperties: false,
      },
    },
    required: ['messageId', 'definition'],
    additionalProperties: false,
  },
  [CHAT_ACTIONS.typing]: {
    type: 'object',
    properties: { chatId: { type: 'integer' } },
    required: ['chatId'],
    additionalProperties: false,
  },
  [CHAT_ACTIONS.updateReaction]: {
    type: 'object',
    properties: {
      id: { type: 'integer' },
      reaction: { type: 'string', minLength: 1, maxLength: 16 },
      chatId: { type: 'integer' },
    },
    required: ['id', 'reaction', 'chatId'],
    additionalProperties: false,
  },
  [CHAT_ACTIONS.deleteMesage]: {
    type: 'object',
    properties: { messageId: { type: 'integer' } },
    required: ['messageId'],
    additionalProperties: false,
  },
  [CALL_ACTIONS.outgoing]: {
    type: 'object',
    properties: {
      chatId: { type: 'integer' },
      roomName: { type: 'string', minLength: 1, maxLength: MAX_NAME_LENGTH },
      chatName: { type: 'string', minLength: 1, maxLength: MAX_NAME_LENGTH },
    },
    required: ['chatId', 'roomName', 'chatName'],
    additionalProperties: false,
  },
};

const compiled = new Map<string, ValidateFunction>();

export const getValidator = (action: string): ValidateFunction | undefined => {
  if (!schemas[action]) return undefined;
  if (!compiled.has(action)) compiled.set(action, ajv.compile(schemas[action]));
  return compiled.get(action);
};
