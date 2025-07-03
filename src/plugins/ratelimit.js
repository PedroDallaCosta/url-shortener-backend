const rateLimit = require('@fastify/rate-limit');

module.exports = async function (fastify) {
  await fastify.register(rateLimit, {
    max: 100,
    timeWindow: 60000,
    trustProxy: true
  });
};