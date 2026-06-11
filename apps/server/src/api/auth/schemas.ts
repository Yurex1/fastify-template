export const signIn = {
  type: 'object',
  properties: {
    headers: {
      type: 'object',
      properties: {
        'x-device-id': { type: 'string' },
      },
    },
    body: {
      type: 'object',
      properties: {
        usernameOrEmail: { type: 'string', minLength: 1, maxLength: 100 },
        password: { type: 'string', minLength: 1, maxLength: 64 },
      },
      required: ['usernameOrEmail', 'password'],
      additionalProperties: false,
    },
  },
  required: ['body'],
} as const;

export const signUp = {
  type: 'object',
  properties: {
    headers: {
      type: 'object',
      properties: {
        'x-device-id': { type: 'string' },
      },
    },
    body: {
      type: 'object',
      properties: {
        email: { type: 'string', format: 'email' },
        username: { type: 'string', minLength: 1, maxLength: 30 },
        password: {
          type: 'string',
          minLength: 12,
          maxLength: 64,
          pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).+$',
        },
      },
      required: ['email', 'username', 'password'],
      additionalProperties: false,
    },
  },
  required: ['body'],
} as const;

export const signOut = {
  type: 'object',
  properties: {
    headers: {
      type: 'object',
      properties: {
        'x-device-id': { type: 'string' },
      },
    },
    body: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
  },
} as const;

export const refresh = {
  type: 'object',
  properties: {
    headers: {
      type: 'object',
      properties: {
        'x-device-id': { type: 'string' },
      },
    },
    cookies: {
      type: 'object',
      properties: {
        refreshToken: { type: 'string' },
      },
      required: ['refreshToken'],
    },
  },
  required: ['headers'],
} as const;

export const changePassword = {
  type: 'object',
  properties: {
    body: {
      type: 'object',
      properties: {
        oldPassword: { type: 'string', minLength: 1, maxLength: 64 },
        newPassword: { type: 'string', minLength: 1, maxLength: 64 },
      },
      required: ['oldPassword', 'newPassword'],
      additionalProperties: false,
    },
  },
  required: ['body'],
} as const;

export const googleCallback = {
  type: 'object',
  properties: {
    headers: {
      type: 'object',
      properties: {
        'x-device-id': { type: 'string' },
      },
    },

    querystring: {
      type: 'object',
      properties: {
        code: { type: 'string' },
        state: { type: 'string' },
        error: { type: 'string' },
      },
    },
  },
} as const;
