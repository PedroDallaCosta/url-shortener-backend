module.exports = (error, request, reply) => {
  const message = error instanceof Error ? error.message : "Erro interno.";
  return reply.status(500).send({
    message,
    errors: [{ message }]
  });
}