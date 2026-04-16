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
  },
  required: ['params', 'headers'],
} as const;

export const getAll = {
  type: 'object',
  properties: {},
  required: [],
} as const;

export const updateEmail = {
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
        email: { type: 'string', format: 'email' },
      },
      required: ['email'],
    },
  },
  required: ['params', 'body', 'headers'],
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
        email: { type: 'string', format: 'email' },
        username: { type: 'string' },
      },
    },
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
  },
  required: ['params', 'headers'],
} as const;
