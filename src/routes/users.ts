// Trash bash – src/routes/users.ts
// User Registration, Login, Profile

import { FastifyInstance } from 'fastify'
import { prisma } from '../server.js'
import bcrypt from 'bcryptjs'

function generateFriendCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code.substring(0, 4) + '-' + code.substring(4)
}

export async function userRouter(app: FastifyInstance) {
  // POST /api/users/register
  app.post('/register', async (req, reply) => {
    const { email, username, password } = req.body as {
      email: string
      username: string
      password: string
    }

    if (!email || !username || !password) {
      return reply.code(400).send({ error: 'Email, Username und Passwort erforderlich' })
    }
    if (password.length < 4) {
      return reply.code(400).send({ error: 'Passwort muss mindestens 4 Zeichen haben' })
    }

    try {
      const passwordHash = await bcrypt.hash(password, 10)
      const friendCode = generateFriendCode()

      const user = await prisma.user.create({
        data: {
          email,
          username,
          passwordHash,
          friendCode,
        },
      })

      const token = app.jwt.sign({ id: user.id, email: user.email })

      return reply.code(201).send({
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          friendCode: user.friendCode,
          level: user.level,
          totalPoints: user.totalPoints,
        },
        token,
      })
    } catch (err: any) {
      if (err.code === 'P2002') {
        return reply.code(400).send({ error: 'Email oder Benutzername schon vergeben' })
      }
      throw err
    }
  })

  // POST /api/users/login
  app.post('/login', async (req, reply) => {
    const { email, password } = req.body as { email: string; password: string }

    try {
      const user = await prisma.user.findUnique({ where: { email } })
      if (!user) {
        return reply.code(401).send({ error: 'Benutzer nicht gefunden' })
      }

      const valid = await bcrypt.compare(password, user.passwordHash)
      if (!valid) {
        return reply.code(401).send({ error: 'Falsches Passwort' })
      }

      const token = app.jwt.sign({ id: user.id, email: user.email })

      return {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          friendCode: user.friendCode,
          level: user.level,
          totalPoints: user.totalPoints,
        },
        token,
      }
    } catch (err) {
      return reply.code(401).send({ error: 'Login fehlgeschlagen' })
    }
  })

  // GET /api/users/me
  app.get('/me', { onRequest: [app.authenticate] }, async (req, reply) => {
    const userId = (req.user as any).id

    const user = await prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: {
        badges: { include: { badge: true } },
        _count: { select: { sessions: true, trashPhotos: true, hotspots: true } },
      },
    })

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        friendCode: user.friendCode,
        avatarUrl: user.avatarUrl,
        level: user.level,
        totalPoints: user.totalPoints,
        totalKg: user.totalKg,
        sessionCount: user.sessionCount,
        badges: user.badges.map((b) => b.badge.name),
        stats: {
          sessions: user._count.sessions,
          photos: user._count.trashPhotos,
          hotspots: user._count.hotspots,
        },
      },
    }
  })
}
