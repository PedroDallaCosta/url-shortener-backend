const UrlService = require('./UrlService')
const urlService = new UrlService()

class UrlController {
  async shorten(request, reply) {
    const { url, password, expireTime = false } = request.body

    const { userId } = request.user
    const response = await urlService.short({ userId, url, password, expireTime })
    return reply.status(200).send(response)
  }

  async details(request, reply) {
    const { shortId } = request.params;
    const { userId } = request.user

    const response = await urlService.details({ short: shortId, userId })
    return reply.status(200).send(response)
  }

  async acessShort(request, reply) {
    const { shortId } = request.params;
    console.log(`TROCAR IP REEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE AL `)
    
    // const ip = request.ip;
    const ip = "151.243.219.17"

    const urlDestination = await urlService.acessShort({ short: shortId, ip })
    return reply.redirect(urlDestination)
  }

  async users(request, reply){
    const { userId } = request?.user
    const links = await urlService.getLinksUser({ userId })
    return reply.status(200).send(links)
  }

  async unlock(request, reply) {
    const { shortId } = request?.params
    const { password } = request?.body
    const response = await urlService.unlock({ short: shortId, password })
    return reply.status(200).send(response)
  }
}

module.exports = UrlController