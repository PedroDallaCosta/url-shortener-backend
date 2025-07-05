const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const pool = require('../../config/database');

const UserRepository = require('./UserRepository');
const ValidationService = require('./ValidationService');

const ACCESS_TOKEN_EXPIRY = '0m';
const REFRESH_TOKEN_EXPIRY = '30d';

const userRepository = new UserRepository(pool)
const validationService = new ValidationService()

class AuthService {
  async login({ email, password }) {
    if (!email || !password) throw new Error("Email and password are required")

    const user = await userRepository.findByEmail(email)
    if (!user) throw new Error('Invalid credentials');

    const valid = await validationService.validPassword(password, user.password)
    if (!valid) throw new Error('Invalid credentials');

    return this._generateValidToken({ userId: user.id })
  }

  async register({ email, password }) {
    if (!email || !password) throw new Error("Email and password are required")

    const existEmail = await userRepository.findByEmail(email)
    if (existEmail) throw new Error('This email already registered')

    const passwordHash = await bcrypt.hash(password, 10)
    const user = await userRepository.createUser({ email, passwordHash })
    return this._generateValidToken({ userId: user.id })
  }

  async refreshToken({ refreshToken }) {
    try {
      const payload = jwt.verify(refreshToken, process.env.JWT_SECRET);
      const userId = payload.userId
      
      return this._generateValidToken({ userId })
    } catch (err) {
      throw new Error(`Refresh token is invalid, ${err}`)
    }
  }

  _generateValidToken({ userId }) {
    const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRY })
    const refreshToken = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRY })

    return { accessToken, refreshToken, userId }
  }
}

module.exports = AuthService