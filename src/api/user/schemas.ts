export const create = {
  type: 'object',
  properties: {
    body: {
      type: 'object',
      properties: {
        email: { type: 'string', format: 'email' },
        username: { type: 'string', minLength: 1, maxLength: 30 },
        password: { type: 'string', minLength: 6 },
      },
      required: ['email', 'username', 'password'],
      additionalProperties: false,
    },
  },
  required: ['body'],
} as const;

export const findOne = {
  type: 'object',
  properties: {
    body: {
      type: 'object',
      properties: {
        definition: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            email: { type: 'string' },
            username: { type: 'string' },
          },
          additionalProperties: false,
        },
        includePassword: { type: 'boolean' },
      },
      required: ['definition'],
      additionalProperties: false,
    },
  },
  required: ['body'],
} as const;

export const findByUsernameOrEmail = {
  type: 'object',
  properties: {
    query: {
      type: 'object',
      properties: {
        value: { type: 'string', minLength: 1 },
        includePassword: { type: 'boolean' },
      },
      required: ['value'],
      additionalProperties: false,
    },
  },
  required: ['query'],
} as const;

export const findByIds = {
  type: 'object',
  properties: {
    body: {
      type: 'object',
      properties: {
        userIds: {
          type: 'array',
          items: { type: 'number' },
        },
      },
      required: ['userIds'],
      additionalProperties: false,
    },
  },
  required: ['body'],
} as const;

export const isExists = {
  type: 'object',
  properties: {
    body: {
      type: 'object',
      properties: {
        definition: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            email: { type: 'string' },
            username: { type: 'string' },
          },
          additionalProperties: false,
        },
      },
      required: ['definition'],
      additionalProperties: false,
    },
  },
  required: ['body'],
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
        username: { type: 'string', minLength: 1, maxLength: 30 },
      },
      additionalProperties: false,
    },
  },
  required: ['params', 'body'],
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
      additionalProperties: false,
    },
  },
  required: ['params', 'body'],
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
  required: ['params'],
} as const;
