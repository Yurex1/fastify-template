export const register = {
  type: 'object',
  properties: {
    body: {
      type: 'object',
      properties: {
        token: { type: 'string', minLength: 1 },
      },
      required: ['token'],
      additionalProperties: false,
    },
  },
  required: ['body', 'headers'],
} as const;

export const unregister = {
  type: 'object',
  properties: {},
  required: ['headers'],
} as const;

export const firebaseConfigs = {
  type: 'object',
  properties: {},
  required: ['headers'],
} as const;
