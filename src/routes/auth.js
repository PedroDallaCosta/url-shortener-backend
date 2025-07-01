const { userAuthSchema } = require('../schemas/authSchema');
const AuthController = require('../services/auth/AuthController');

const Auth = new AuthController()

async function authRoutes(fastify, opts) {
  fastify.post('/register', {
    schema: userAuthSchema,
    preHandler: fastify.csrfProtection,
    handler: Auth.register.bind(Auth)
  });

  fastify.post('/login', {
    schema: userAuthSchema,
    preHandler: fastify.csrfProtection,
    handler: Auth.login.bind(Auth)
  });

  fastify.get('/getToken', { 
    preHandler: [fastify.authenticate],
    handler: Auth.getToken
   });

  fastify.post('/logout', {
    preHandler: [fastify.authenticate],
    handler: Auth.logout
  });

}

module.exports = authRoutes;