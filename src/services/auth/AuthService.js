const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const pool = require('../../config/database');

const UserRepository = require('./UserRepository');
const ValidationService = require('./ValidationService');

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

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

  _generateValidToken({ userId }) {
    const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY })
    const refreshToken = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY })

    return { accessToken, refreshToken, userId }
  }
}

module.exports = AuthService