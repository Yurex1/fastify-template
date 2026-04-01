export const deletePhoto = {
  type: 'object',
  properties: {
    query: {
      type: 'object',
      properties: {
        fileName: { type: 'string', minLength: 1 },
      },
      required: ['fileName'],
    },
  },
  required: ['query'],
} as const;

export const getUploadUrl = {
  type: 'object',
  properties: {
    body: {
      type: 'object',
      properties: {
        mediaType: { type: 'string', minLength: 1 },
        expiresIn: { type: 'number', minimum: 300, maximum: 3600 },
      },
      required: ['mediaType'],
      additionalProperties: false,
    },
  },
  required: ['body'],
} as const;
