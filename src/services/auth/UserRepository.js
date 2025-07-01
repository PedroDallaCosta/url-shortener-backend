class UserRepository {
  constructor(pool) {
    this.pool = pool
  }

  async findByEmail(email) {
    try {
      const { rows } = await this.pool.query("SELECT * FROM users WHERE email = $1", [email])
      return rows[0]
    } catch (err) {
      throw err;
    }
  }

  async createUser(user) {
    try {
      const { email, passwordHash } = user
      const { rows } = await this.pool.query('INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id', [email, passwordHash]);
      return rows[0]
    } catch (err) {
      throw err;
    }
  }
}
module.exports = UserRepository