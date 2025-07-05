const AuthService = require("./AuthService");
const authService = new AuthService()

class AuthController {
  async register(request, reply) {
    const { email, password } = request.body;
    const tokens = await authService.register({ email, password });
    return this._generateResponse({ reply, tokens })
  }

  async login(request, reply) {
    const { email, password } = request.body
    const tokens = await authService.login({ email, password })
    return this._generateResponse({ reply, tokens })
  }

  async getToken(request, reply) {
    return reply.send({ user: request.user });
  }

  async refreshToken(request, reply) {
    const { refreshToken } = request.cookies;
    const tokens = await authService.refreshToken({ refreshToken })
    return this._generateResponse({ reply, tokens })
  }

  async logout(request, reply) {
    return reply
      .clearCookie('token', { path: '/' })
      .code(200)
      .send({ message: 'Logout realizado com sucesso' });
  }

  _generateResponse({ reply, tokens }) {
    const { accessToken, refreshToken, userId } = tokens

    return reply
      .status(200)
      .setCookie('token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      })
      .setCookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
      })
      .send({ accessToken, userId });
  }
}

module.exports = AuthController