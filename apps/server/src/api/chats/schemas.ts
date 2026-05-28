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
        updatedAt: { type: 'string' },
        limit: { type: 'number' },
      },
      required: ['status', 'limit'],
    },
  },
  required: ['query'],
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
        before: { type: 'number' },
        after: { type: 'number' },
        limit: { type: 'number', minimum: 1, maximum: 100 },
      },
      required: ['limit'],
    },
  },
  required: ['params', 'query'],
} as const;

export const searchMessagesByChatId = {
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
        text: { type: 'string', minLength: 1 },
      },
      required: ['text'],
    },
  },
  required: ['params', 'query'],
} as const;

export const getMessagePage = {
  type: 'object',
  properties: {
    params: {
      type: 'object',
      properties: {
        chatId: { type: 'number' },
        messageId: { type: 'number' },
      },
      required: ['chatId', 'messageId'],
    },
    query: {
      type: 'object',
      properties: {
        limit: { type: 'number', minimum: 1, maximum: 100 },
      },
      required: ['limit'],
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
        createdAt: { type: 'string', format: 'date-time' },
        id: { type: 'number' },
        limit: { type: 'number', minimum: 1, maximum: 100 },
      },
      required: ['limit'],
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
