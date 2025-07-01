module.exports = function (fastify) {
  return async function (request, reply) {
    try {
      const { token } = request.cookies;
      if (!token) throw new Error('Token ausente');

      const decoded = await fastify.jwt.verify(token);
      request.user = decoded;
    } catch (err) {
      return reply
        .status(401)
        .send({
          message: `Não autorizado: ${err.message}`,
          errors: [
            { message: 'You need to be logged in' },
            { message: `Não autorizado: ${err.message}` }
          ]
        })
    }
  }
}