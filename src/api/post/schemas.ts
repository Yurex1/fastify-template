import { authHeaders } from '../schemaParts';

export const create = {
  type: 'object',
  properties: {
    body: {
      type: 'object',
      properties: {
        title: { type: 'string', minLength: 1, maxLength: 255 },
        body: { type: 'string', minLength: 1 },
        category: { type: 'string', minLength: 1, maxLength: 100 },
        photo: { type: 'string', minLength: 1 },
      },
      additionalProperties: false,
      required: ['title', 'body', 'category', 'photo'],
    },
    headers: authHeaders,
  },
  required: ['body', 'headers'],
} as const;

export const getById = {
  type: 'object',
  properties: {
    params: {
      type: 'object',
      properties: {
        id: { type: 'number' },
      },
      required: ['id'],
    },
    headers: authHeaders,
  },
  required: ['params', 'headers'],
} as const;

export const getAll = {
  type: 'object',
  properties: {
    headers: authHeaders,
  },
  required: ['headers'],
} as const;

export const getByCategory = {
  type: 'object',
  properties: {
    query: {
      type: 'object',
      properties: {
        category: { type: 'string', minLength: 1 },
      },
      required: ['category'],
    },
    headers: authHeaders,
  },
  required: ['query', 'headers'],
} as const;

export const getByUser = {
  type: 'object',
  properties: {
    query: {
      type: 'object',
      properties: {
        userId: { type: 'number' },
      },
      required: ['userId'],
    },
    headers: authHeaders,
  },
  required: ['query', 'headers'],
} as const;

export const update = {
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
        title: { type: 'string', minLength: 1, maxLength: 255 },
        body: { type: 'string', minLength: 1 },
        category: { type: 'string', minLength: 1, maxLength: 100 },
        photo: { type: 'string', minLength: 1 },
      },
    },

    headers: authHeaders,
  },
  required: ['params', 'body', 'headers'],
} as const;

export const remove = {
  type: 'object',
  properties: {
    params: {
      type: 'object',
      properties: {
        id: { type: 'number' },
      },
      required: ['id'],
    },
    headers: authHeaders,
  },
  required: ['params', 'headers'],
} as const;
