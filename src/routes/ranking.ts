// Trash bash – src/routes/ranking.ts
// Ranglisten: Global, Period-basiert, Eigene Platzierung

import { FastifyInstance } from 'fastify'
import { prisma } from '../server.js'

export async function rankingRouter(app: FastifyInstance) {
  // GET /api/ranking?period=week|month|all
  // Globale Rangliste
  app.get('/', async (req, reply) => {
    const { period } = req.query as { period?: 'week' | 'month' | 'all' }

    let dateFilter = {}
    const now = new Date()

    if (period === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      dateFilter = { createdAt: { gte: weekAgo } }
    } else if (period === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      dateFilter = { createdAt: { gte: monthAgo } }
    }

    const ranking = await prisma.user.findMany({
      where: {
        sessions: {
          some: {
            ...dateFilter,
          },
        },
      },
      select: {
        id: true,
        username: true,
        level: true,
        totalPoints: true,
        avatarUrl: true,
        _count: { select: { sessions: true } },
      },
      orderBy: { totalPoints: 'desc' },
      take: 100,
    })

    return {
      period: period || 'all',
      ranking: ranking.map((u, i) => ({
        rank: i + 1,
        userId: u.id,
        username: u.username,
        level: u.level,
        points: u.totalPoints,
        avatarUrl: u.avatarUrl,
        sessions: u._count.sessions,
      })),
    }
  })

  // GET /api/ranking/me
  // Eigene Platzierung
  app.get('/me', { onRequest: [app.authenticate] }, async (req, reply) => {
    const userId = (req.user as any).id

    const user = await prisma.user.findUniqueOrThrow({
      where: { id: userId },
    })

    // Alle User zählen, die mehr Punkte haben
    const betterUsers = await prisma.user.count({
      where: {
        totalPoints: {
          gt: user.totalPoints,
        },
      },
    })

    const rank = betterUsers + 1

    return {
      rank,
      totalUsers: await prisma.user.count(),
      user: {
        username: user.username,
        level: user.level,
        totalPoints: user.totalPoints,
        totalKg: user.totalKg,
      },
    }
  })
}
