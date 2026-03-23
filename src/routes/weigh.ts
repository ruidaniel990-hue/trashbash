// Trash bash – src/routes/weigh.ts
// Wiegestationen: Checkin, Punkte-Vergabe

import { FastifyInstance } from 'fastify'
import { prisma } from '../server.js'
import { PointsService } from '../services/points.js'

export async function weighRouter(app: FastifyInstance) {
  // GET /api/weigh/stations
  // Alle Wiegestationen
  app.get('/stations', async (req, reply) => {
    const stations = await prisma.weighStation.findMany({
      include: {
        _count: { select: { checkins: true } },
      },
    })

    return {
      stations: stations.map((s) => ({
        id: s.id,
        name: s.name,
        lat: s.lat,
        lng: s.lng,
        address: s.address,
        hours: `${s.openHour}:00-${s.closeHour}:00`,
        checkinCount: s._count.checkins,
      })),
    }
  })

  // POST /api/weigh/checkin
  // An Wiegestation einchecken
  app.post('/checkin', { onRequest: [app.authenticate] }, async (req, reply) => {
    const userId = (req.user as any).id
    const { stationId, weightKg } = req.body as {
      stationId: string
      weightKg: number
    }

    const points = PointsService.weighBonus(weightKg)

    const [checkin, _] = await prisma.$transaction([
      prisma.weighCheckin.create({
        data: {
          userId,
          stationId,
          weightKg,
          points,
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          totalPoints: { increment: points },
          totalKg: { increment: weightKg },
        },
      }),
    ])

    return reply.code(201).send({
      checkin,
      pointsEarned: points,
      message: `${weightKg}kg gewogen! +${points} Punkte!`,
    })
  })

  // GET /api/weigh/stations/:id/checkins
  // Letzten Checkins einer Station
  app.get(
    '/stations/:id/checkins',
    async (req, reply) => {
      const { id } = req.params as { id: string }

      const checkins = await prisma.weighCheckin.findMany({
        where: { stationId: id },
        include: {
          user: { select: { id: true, username: true, avatarUrl: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      })

      return { checkins }
    }
  )
}
