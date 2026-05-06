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
  },
  required: ['query', 'headers'],
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
    query: {
      type: 'object',
      properties: {
        page: { type: 'number', minimum: 1 },
        limit: { type: 'number', minimum: 1, maximum: 100 },
      },
      required: ['page', 'limit'],
    },
  },
  required: ['params', 'query'],
} as const;

export const pinMessage = {
  type: 'object',
  properties: {
    body: {
      type: 'object',
      properties: {
        chatId: { type: 'number' },
        messageId: { type: 'number' },
      },
      required: ['chatId', 'messageId'],
      additionalProperties: false,
    },
  },
  required: ['body', 'headers'],
} as const;

export const unpinMessage = {
  type: 'object',
  properties: {
    body: {
      type: 'object',
      properties: {
        chatId: { type: 'number' },
        messageId: { type: 'number' },
      },
      required: ['chatId', 'messageId'],
      additionalProperties: false,
    },
  },
  required: ['body', 'headers'],
} as const;

export const getAllPinnedMessages = {
  type: 'object',
  properties: {
    params: {
      type: 'object',
      properties: {
        chatId: { type: 'number' },
      },
      required: ['chatId'],
    },
    query: {
      type: 'object',
      properties: {
        page: { type: 'number', minimum: 1 },
        limit: { type: 'number', minimum: 1, maximum: 100 },
      },
      required: ['page', 'limit'],
    },
  },
  required: ['params', 'query'],
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
  },
  required: ['params', 'headers'],
} as const;
