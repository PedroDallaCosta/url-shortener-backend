class UrlRepository {
  constructor(bcrypt, pool, axios) {
    this.bcrypt = bcrypt
    this.pool = pool
    this.axios = axios
  }

  async getDetailsUrl({ userId, url }) {
    const data = await this._getDataUrl({ userId, url })
    if (!data?.short || !data?.url) return false

    return await this._buildResponseData(data)
  }

  async getDetailsShort({ userId, short }) {
    const data = await this._getDataShort({ userId, short })
    if (!data?.url) throw new Error("URL is invalid or expire")

    const clicks = await this.getClicksShort({ short })
    const countrys = await this.getCountryShort({ short })
    return await this._buildResponseData(data, clicks, countrys)
  }

  async getProtectShort({ short }) {
    const data = await this._getProtectShort({ short })
    if (!data?.url) return false

    const { havePassword, expire, expire_date } = await this._buildResponseData(data)
    return { havePassword, expire, expire_date, urlDestination: data?.url, hash: data?.password }
  }

  async getAllLinksUser({ userId }) {
    const rows = await this._getLinksUser({ userId })

    const response = await Promise.all(
      rows.map(async ({ short, owner, url, password, created_at, expire, expires_at, unique_clicks }) => {
        const havePassword = password && password != "" ? true : false
        const urlDestination = havePassword ? "***********" : url

        const isExpire = expire && expires_at
          ? new Date(expires_at).getTime() <= Date.now()
          : false;

        const { totalClicks } = await this.getClicksShort({ short })
        return {
          havePassword,
          urlDestination,
          short,
          linkShort: `${process.env.BACK_END}/${short}`,
          linkDetails: `${process.env.FRONT_END}/details/${short}`,
          isExpire,
          created_at,
          totalClicks
        }
      })
    )

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

  async getClicksShort({ short }) {
    const graph = []
    const { rows } = await this.pool.query("SELECT * FROM clicks_per_day WHERE short = $1", [short])
    if (!rows[0]) return { totalClicks: 0, graph }

    let totalClicks = 0
    for (const { clicks, date } of rows) {
      graph.push({ clicks, date })
      totalClicks += clicks
    }

    return { totalClicks, graph }
  }

  async getCountryShort({ short }) {
    const { rows } = await this.pool.query("SELECT * FROM clicks_per_country WHERE short = $1", [short])
    if (!rows[0]) return []

    const countrys = []
    for (const { clicks, country } of rows) {
      countrys.push({ clicks, country: country.toLowerCase() })
    }

    return countrys
  }

  async getCountryUser({ ip }) {
    try {
      const response = await this.axios.get(`https://ipwho.is/${ip}`)
      const country_name = response?.data?.country || ""
      return country_name
    } catch (err) {
      throw err
    }
  }

  async incrementClick({ short }) {
    const query = `
      INSERT INTO clicks_per_day(short, date, clicks)
      VALUES ($1, CURRENT_DATE, 1)
      ON CONFLICT (short, date)
      DO UPDATE SET clicks = clicks_per_day.clicks + 1
    `
    await this.pool.query(query, [short])
  }

  async incrementCountry({ short, country }) {
    const query = `
      INSERT INTO clicks_per_country(short, country, clicks)
      VALUES ($1, $2, 1)
      ON CONFLICT (short, country)
      DO UPDATE SET clicks = clicks_per_country.clicks + 1
    `

    await this.pool.query(query, [short, country])
  }

  async _buildResponseData(data, clicks = {}, countrys = []) {
    const { short, owner, password, url, created_at, expire, expires_at, unique_clicks } = data
    const havePassword = password && password != "" ? true : false
    const urlDestination = havePassword ? "***********" : url

    const expire_date = expire ? expires_at : ""
    const { totalClicks = 0, graph = [] } = clicks

    return {
      success: true,
      short,
      owner,
      havePassword,
      created_at,
      expire,
      expire_date,
      unique_clicks: 0,
      graphClicks: [],
      urlDestination,
      urlDetails: `details/${short}`,
      urlShort: `${process.env.BACK_END}/${short}`,
      totalClicks,
      graph,
      countrys
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

    await this.pool.query('INSERT INTO urls(short, owner, url, password, expire, expires_at, unique_clicks) VALUES ($1, $2, $3, $4, $5, $6, $7)', [
      short, userId, url, password, canExpire, expiresAtValue, 0
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