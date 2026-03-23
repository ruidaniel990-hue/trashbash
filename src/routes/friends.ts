// Trash bash – src/routes/friends.ts
// Friend system: add by code, list, remove

import { FastifyInstance } from 'fastify'
import { prisma } from '../server.js'

export async function friendRouter(app: FastifyInstance) {
  // GET /api/friends – eigene Freundesliste
  app.get('/', { onRequest: [app.authenticate] }, async (req) => {
    const userId = (req.user as any).id

    const friendships = await prisma.friendship.findMany({
      where: { userId },
      include: {
        friend: {
          select: {
            id: true,
            username: true,
            friendCode: true,
            avatarUrl: true,
            level: true,
            totalPoints: true,
            totalKg: true,
            sessionCount: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return {
      friends: friendships.map((f) => ({
        id: f.id,
        friendId: f.friendId,
        username: f.friend.username,
        friendCode: f.friend.friendCode,
        avatarUrl: f.friend.avatarUrl,
        level: f.friend.level,
        totalPoints: f.friend.totalPoints,
        totalKg: f.friend.totalKg,
        sessionCount: f.friend.sessionCount,
        addedAt: f.createdAt,
      })),
    }
  })

  // GET /api/friends/code – eigenen Freundescode abrufen
  app.get('/code', { onRequest: [app.authenticate] }, async (req) => {
    const userId = (req.user as any).id
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { friendCode: true, username: true },
    })
    return { friendCode: user.friendCode, username: user.username }
  })

  // POST /api/friends/add – Freund per Code hinzufügen
  app.post('/add', { onRequest: [app.authenticate] }, async (req, reply) => {
    const userId = (req.user as any).id
    const { code } = req.body as { code: string }

    if (!code) {
      return reply.code(400).send({ error: 'Freundescode erforderlich' })
    }

    // Find user by friend code
    const friend = await prisma.user.findUnique({
      where: { friendCode: code },
      select: { id: true, username: true, level: true, totalPoints: true },
    })

    if (!friend) {
      return reply.code(404).send({ error: 'Kein Spieler mit diesem Code gefunden' })
    }

    if (friend.id === userId) {
      return reply.code(400).send({ error: 'Du kannst dich nicht selbst hinzufügen' })
    }

    // Check if already friends
    const existing = await prisma.friendship.findUnique({
      where: { userId_friendId: { userId, friendId: friend.id } },
    })

    if (existing) {
      return reply.code(400).send({ error: 'Ihr seid bereits Freunde' })
    }

    // Create bidirectional friendship
    await prisma.$transaction([
      prisma.friendship.create({
        data: { userId, friendId: friend.id },
      }),
      prisma.friendship.create({
        data: { userId: friend.id, friendId: userId },
      }),
    ])

    return reply.code(201).send({
      message: `${friend.username} als Freund hinzugefügt!`,
      friend: {
        friendId: friend.id,
        username: friend.username,
        level: friend.level,
        totalPoints: friend.totalPoints,
      },
    })
  })

  // DELETE /api/friends/:friendId – Freund entfernen
  app.delete('/:friendId', { onRequest: [app.authenticate] }, async (req, reply) => {
    const userId = (req.user as any).id
    const { friendId } = req.params as { friendId: string }

    // Remove both directions
    await prisma.friendship.deleteMany({
      where: {
        OR: [
          { userId, friendId },
          { userId: friendId, friendId: userId },
        ],
      },
    })

    return { message: 'Freund entfernt' }
  })
}
