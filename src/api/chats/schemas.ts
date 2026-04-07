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
