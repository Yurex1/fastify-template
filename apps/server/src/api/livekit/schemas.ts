export const token = {
  type: 'object',
  properties: {
    body: {
      type: 'object',
      properties: {
        roomName: { type: 'string', minLength: 1 },
      },
      required: ['roomName'],
      additionalProperties: false,
    },
  },
  required: ['body'],
} as const;

export const room = {
  type: 'object',
  properties: {
    body: {
      type: 'object',
      properties: {
        roomName: { type: 'string', minLength: 1 },
      },
      required: ['roomName'],
      additionalProperties: false,
    },
  },
  required: ['body'],
} as const;
