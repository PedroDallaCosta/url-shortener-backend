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
        maxAge: 60 * 60 * 24 * 7
      })
      .send({ accessToken, refreshToken, userId });
  }
}

module.exports = AuthController