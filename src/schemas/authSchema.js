const userAuthSchema = {
  body: {
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email: { type: 'string', format: 'email' },
      password: { type: 'string', minLength: 6 }
    },
    additionalProperties: false
  },
  response: {
    201: {
      description: 'User registered successfully',
      type: 'object',
      properties: {
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' },
        userId: { type: 'integer' }
      }
    },
    200: {
        description: 'User logged in successfully',
        type: 'object',
        properties: {
          accessToken: { type: 'string' },
          refreshToken: { type: 'string' },
          userId: { type: 'integer' }
        }
      },
    400: {
      description: 'Invalid request body',
      type: 'object',
      properties: {
        message: { type: 'string' },
        errors: { type: 'array' }
      }
    },
    401: {
        description: 'Invalid credentials',
        type: 'object',
        properties: {
          message: { type: 'string' },
          errors: { type: 'array' }
        }
    },
    409: {
      description: 'Conflict',
      type: 'object',
      properties: {
        message: { type: 'string' },
        errors: { type: 'array' }
      }
    }
  }
};

module.exports = { userAuthSchema };