const bcrypt = require('bcrypt');
const pool = require('../../config/database');

const UrlRepository = require('./UrlRepository')
const ValidationService = require('../auth/ValidationService');

const urlRepository = new UrlRepository(bcrypt, pool)
const validationService = new ValidationService()

class UrlService {
  async short({ userId, url, password = "", expireTime = false }) {
    if (!userId) throw new Error("You need to be logged in")
    if (!url) throw new Error("Parameters is invalid")

    const exist = await urlRepository.getLinkExist({ userId, url })
    if (exist?.short && exist?.urlDetails) return { success: true, short: exist?.short, urlDetails: exist?.urlDetails }

    const response = await urlRepository.createShortUrl({ userId, url, password, expireTime })
    if (response?.short && response?.urlDetails) return { success: true, short: response?.short, urlDetails: response?.urlDetails }

    throw new Error("Failed to create url short")
  }

  async details({ short, userId }) {
    if (!userId) throw new Error("You need to be logged in")
    if (!short) throw new Error("Parameters is invalid")

    const urlData = await urlRepository.getDetailsShort({ userId, short })
    return { urlData }
  }

  async acessShort({ short }) {
    if (!short) throw new Error("ShortId is required")

    const { havePassword, expire, expire_date, urlDestination } = await urlRepository.getProtectShort({short})

    if (expire && expire_date - new Date() <= 0) {
      const redirect = await urlRepository.deleteLinkExist({ short })
      return redirect
    } 

    if (havePassword) return `${process.env.FRONT_END}/unlock/${short}`
    return urlDestination
  }

  async getLinksUser({ userId }){
    if (!userId) throw new Error("UserId is not find")
      
    const links = await urlRepository.getAllLinksUser({ userId })
    return { links }
  }

  async unlock({short, password}){
    if (!short) throw new Error("ShortId is required")
    if (!password) throw new Error("Password is required")
    
    const { hash, urlDestination } = await urlRepository.getProtectShort({ short })
    const valid = await validationService.validPassword(password, hash)
    
    if (!valid) throw new Error("Invalid credentials")
    return { urlDestination }
  }
}

module.exports = UrlService