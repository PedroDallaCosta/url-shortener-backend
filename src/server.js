const Fastify = require('fastify');
require('dotenv').config();

const fastify = Fastify({ logger: true })

// Register security plugins
fastify.register(require('@fastify/helmet'));
fastify.register(require('@fastify/cookie'));

fastify.register(require('@fastify/cors'), {
  origin: [process.env.FRONT_END],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
});

fastify.register(require('@fastify/session'), {
  secret: process.env.FASTIFY_SECRET,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true
  }
});

const authenticate = require('./plugins/authenticate')
fastify.decorate("authenticate", authenticate(fastify));

fastify.register(require('@fastify/csrf'), { sessionPlugin: '@fastify/session' });
fastify.register(require('@fastify/jwt'), { secret: process.env.JWT_SECRET });

fastify.register(require('./plugins/ratelimit'));
fastify.setErrorHandler(require('./plugins/errors'))

fastify.decorate('db', require('./config/database'));

const { swaggerRegister, swaggerRegisterUi } = require('./plugins/swagger');
fastify.register(require('@fastify/swagger'), swaggerRegister)
fastify.register(require('@fastify/swagger-ui'), swaggerRegisterUi)

fastify.register(require('./routes/auth'), { prefix: '/api/auth' });
fastify.register(require('./routes/urls'), { prefix: '/api/urls' });
fastify.register(require('./routes/default'));

const start = async () => {
  try {
    await fastify.listen({ port: process.env.FASTIFY_PORT })

    const addresses = fastify.addresses()
    for (const { address, port } of addresses) console.log(`Server listen in ${address}:${port}`)

    fastify.log.info(`Server running`)
  } catch (erro) {
    fastify.log.error(`Erro: ${erro}`)
    process.exit(1)
  }
}

start()