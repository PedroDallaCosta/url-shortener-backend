const UrlsController = require('../services/urls/UrlController')
const Url = new UrlsController()

async function defaultRoutes(fastify, opts) {
  fastify.get('/:shortId', {
    preHandler: fastify.csrfProtection, 
    handler: Url.acessShort,
   })
}

module.exports = defaultRoutes