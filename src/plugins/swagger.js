const swaggerRegister = {
  openapi: {
    openapi: '3.0.3',
    info: {
      title: 'Login API',
      description: 'Docs auth API',
      version: '1.0.0',
    },
  },
  exposeRoute: true,
};

const swaggerRegisterUi = {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'full',
    deepLinking: false,
  },
  staticCSP: true,
  transformSpecification: (swaggerObject, request, reply) => swaggerObject,
  transformSpecificationClone: true,
};

module.exports = { swaggerRegister, swaggerRegisterUi };