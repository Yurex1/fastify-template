export const uploadPhoto = {
  type: 'object',
  properties: {
    body: {
      type: 'object',
      properties: {
        file: { type: 'string' },
        fileName: { type: 'string', minLength: 1 },
        contentType: { type: 'string', minLength: 1 },
      },
      required: ['file', 'fileName', 'contentType'],
      additionalProperties: false,
    },
  },
  required: ['body'],
} as const;

export const deletePhoto = {
  type: 'object',
  properties: {
    body: {
      type: 'object',
      properties: {
        fileName: { type: 'string', minLength: 1 },
      },
      required: ['fileName'],
      additionalProperties: false,
    },
  },
  required: ['body'],
} as const;

export const getPhotoUrl = {
  type: 'object',
  properties: {
    query: {
      type: 'object',
      properties: {
        fileName: { type: 'string', minLength: 1 },
        signed: { type: 'string', enum: ['true', 'false'] },
      },
      required: ['fileName'],
      additionalProperties: false,
    },
  },
  required: ['query'],
} as const;


