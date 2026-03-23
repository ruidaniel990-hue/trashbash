// Trash bash – src/middleware/auth.ts
// JWT Authentication Middleware

import { FastifyRequest, FastifyReply } from 'fastify'

export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const token = request.headers.authorization?.replace('Bearer ', '')
    if (!token) {
      return reply.code(401).send({ error: 'No authorization token' })
    }

    const decoded = await request.jwtVerify()
    request.user = decoded
  } catch (err) {
    return reply.code(401).send({ error: 'Invalid token' })
  }
}
