const { shortenUrlSchema, urlDetailsSchema, unlockUrlSchema } = require('../schemas/urlSchema');
const UrlsController = require('../services/urls/UrlController')

const Url = new UrlsController()

async function urlsRoutes(fastify, opts) {
  fastify.post('/shorten', {
    schema: shortenUrlSchema,
    preHandler: [fastify.authenticate],
    handler: Url.shorten.bind(Url)
  });

  fastify.get('/details/:shortId', {
    schema: urlDetailsSchema,
    preHandler: [fastify.authenticate],
    handler: Url.details.bind(Url)
  });

  fastify.post('/unlock/:shortId', {
    schema: unlockUrlSchema,
    preHandler: fastify.csrfProtection,
    handler: Url.unlock.bind(Url)
  });
}

module.exports = urlsRoutes;