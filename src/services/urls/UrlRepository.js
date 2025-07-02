class UrlRepository {
  constructor(bcrypt, pool) {
    this.bcrypt = bcrypt
    this.pool = pool
  }

  async getDetailsUrl({ userId, url }) {
    const data = await this._getDataUrl({ userId, url })
    if (!data?.short || !data?.url) return false

    return await this._buildResponseData(data)
  }

  async getDetailsShort({ userId, short }) {
    const data = await this._getDataShort({ userId, short })
    if (!data?.url) return false

    return await this._buildResponseData(data)
  }

  async getProtectShort({ short }) {
    const data = await this._getProtectShort({ short })
    if (!data?.url) return false

    const { havePassword, expire, expire_date } = await this._buildResponseData(data)
    return { havePassword, expire, expire_date, urlDestination: data?.url, hash: data?.password }
  }

  async getAllLinksUser({ userId }) {
    const rows = await this._getLinksUser({ userId })
    const response = rows.map(({ short, owner, url, password, created_at, expire, expires_at, clicks, unique_clicks }) => {
      const havePassword = password && password != "" ? true : false
      const urlDestination = havePassword ? "***********" : url

      const isExpire = expire && expires_at
        ? new Date(expires_at).getTime() <= Date.now()
        : false;

      return {
        havePassword,
        urlDestination,
        short: `${process.env.HOST}/${short}`,
        clicks,
        isExpire,
        created_at
      }
    })

    return response
  }

  async createShortUrl({ userId, url, password, expireTime }) {
    try {
      let hash = ""
      if (password && password !== "") {
        hash = await this.bcrypt.hash(password, 10)
      }

      const { short } = await this._createShortUrl({ userId, url, password: hash, expireTime })
      const urlDetails = `details/${short}`

      return { short, urlDetails }
    } catch (err) {
      throw new Error(err)
    }
  }

  async getLinkExist({ userId, url }) {
    const { short, urlDetails } = await this.getDetailsUrl({ userId, url })
    if (short && urlDetails) return { short, urlDetails }
    return false
  }

  async deleteLinkExist({ short }) {
    await this._deleteShort({ short })
    return `${process.env.FRONT_END}/`
  }

  async _buildResponseData(data) {
    const { short, owner, password, url, created_at, expire, expires_at, clicks, unique_clicks } = data
    const havePassword = password && password != "" ? true : false
    const urlDestination = havePassword ? "***********" : url

    const expire_date = expire ? expires_at : ""

    return {
      success: true,
      short,
      owner,
      havePassword,
      created_at,
      expire,
      expire_date,
      clicks: 0,
      unique_clicks: 0,
      graphClicks: [],
      urlDestination,
      urlDetails: `details/${short}`,
      urlShort: `${process.env.HOST}/${short}`
    }
  }

  async _getDataUrl({ userId, url }) {
    const { rows } = await this.pool.query("SELECT * FROM urls WHERE owner = $1 AND url = $2", [userId, url])
    if (!rows[0]) return false
    return rows[0]
  }

  async _getDataShort({ userId, short }) {
    const { rows } = await this.pool.query("SELECT * FROM urls WHERE owner = $1 AND short = $2", [userId, short])
    if (!rows[0]) return false
    return rows[0]
  }

  async _getLinksUser({ userId }) {
    const { rows } = await this.pool.query("SELECT * FROM urls WHERE owner = $1", [userId])
    return rows
  }

  async _getProtectShort({ short }) {
    const { rows } = await this.pool.query('SELECT * FROM urls WHERE short = $1', [short])
    if (!rows[0]) return false
    return rows[0]
  }

  async _deleteShort({ short }) {
    await this.pool.query("DELETE FROM urls WHERE short = $1", [short])
  }

  async _createShortUrl({ userId, url, password, expireTime }) {
    const short = await this._generateShortId()

    const canExpire = expireTime ? true : false;
    const expiresAtValue = canExpire ? expireTime : null;

    await this.pool.query('INSERT INTO urls(short, owner, url, password, expire, expires_at, clicks, unique_clicks) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)', [
      short, userId, url, password, canExpire, expiresAtValue, 0, 0
    ])

    return { short }
  }

  async _generateShortId(length = 6) {
    const BASE62 = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

    const generateCode = () => {
      let result = '';
      for (let i = 0; i < length; i++) {
        const randIndex = Math.floor(Math.random() * BASE62.length);
        result += BASE62[randIndex];
      }
      return result;
    };

    let id;
    let exists = true;

    while (exists) {
      id = generateCode();
      const result = await this.pool.query('SELECT * FROM urls WHERE short = $1', [id]);
      exists = result.rowCount > 0;
    }

    return id
  }
}

module.exports = UrlRepository