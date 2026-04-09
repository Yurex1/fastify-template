import { authHeaders } from '../schemaParts';

export const create = {
  type: 'object',
  properties: {
    params: {
      type: 'object',
      properties: {
        memberId: { type: 'number' },
      },
      required: ['memberId'],
    },
    headers: authHeaders,
  },
  required: ['params', 'headers'],
} as const;

export const list = {
  type: 'object',
  properties: {
    query: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['pending', 'approved', 'rejected'] },
        page: { type: 'number' },
        limit: { type: 'number' },
      },
      required: ['page', 'limit'],
    },
    headers: authHeaders,
  },
  required: ['query', 'headers'],
} as const;

export const sendMessage = {
  type: 'object',
  properties: {
    params: {
      type: 'object',
      properties: {
        chatId: { type: 'number' },
      },
      required: ['chatId'],
    },
    body: {
      type: 'object',
      properties: {
        text: { type: 'string', minLength: 1 },
      },
      required: ['text'],
    },
    headers: authHeaders,
  },
  required: ['params', 'body', 'headers'],
} as const;

export const getMessagesByChatId = {
  type: 'object',
  properties: {
    params: {
      type: 'object',
      properties: {
        chatId: { type: 'number' },
      },
      required: ['chatId'],
    },
    headers: authHeaders,
  },
  required: ['params', 'headers'],
} as const;

export const updateMessage = {
  type: 'object',
  properties: {
    params: {
      type: 'object',
      properties: {
        id: { type: 'number' },
      },
      required: ['id'],
    },
    body: {
      type: 'object',
      properties: {
        text: { type: 'string', minLength: 1, maxLength: 255 },
      },
    },

    headers: authHeaders,
  },
  required: ['params', 'body', 'headers'],
} as const;
export const removeChat = {
  type: 'object',
  properties: {
    params: {
      type: 'object',
      properties: {
        chatId: { type: 'number' },
      },
      required: ['chatId'],
    },
    headers: authHeaders,
  },
  required: ['params', 'headers'],
} as const;
