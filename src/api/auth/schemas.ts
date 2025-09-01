export const signIn = {
  type: 'object',
  properties: {
    body: {
      type: 'object',
      properties: {
        usernameOrEmail: { type: 'string', minLength: 1 },
        password: { type: 'string', minLength: 6, maxLength: 64 },
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
    body: {
      type: 'object',
      properties: {
        email: { type: 'string', format: 'email' },
        username: { type: 'string', minLength: 1, maxLength: 30 },
        password: { type: 'string', minLength: 6, maxLength: 64 },
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
    body: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
  },
} as const;

export const changePassword = {
  type: 'object',
  properties: {
    body: {
      type: 'object',
      properties: {
        oldPassword: { type: 'string', minLength: 1 },
        newPassword: { type: 'string', minLength: 6, maxLength: 64 },
      },
      required: ['oldPassword', 'newPassword'],
      additionalProperties: false,
    },
  },
  required: ['body'],
} as const;
