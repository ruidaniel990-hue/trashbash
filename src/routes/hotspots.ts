// Trash bash – src/routes/hotspots.ts
// Müll-Hotspots: Melden, Bestätigen, Bereinigung

import { FastifyInstance } from 'fastify'
import { prisma } from '../server.js'
import { PointsService } from '../services/points.js'

export async function hotspotsRouter(app: FastifyInstance) {
  // GET /api/hotspots?lat=...&lng=...&radius=...
  // Hotspots in der Nähe
  app.get('/', async (req, reply) => {
    const { lat, lng, radius } = req.query as {
      lat?: string
      lng?: string
      radius?: string
    }

    let where = {}
    if (lat && lng) {
      const latNum = parseFloat(lat)
      const lngNum = parseFloat(lng)
      const radiusNum = parseFloat(radius || '5')

      where = {
        AND: [
          { lat: { gte: latNum - radiusNum, lte: latNum + radiusNum } },
          { lng: { gte: lngNum - radiusNum, lte: lngNum + radiusNum } },
        ],
      }
    }

    const hotspots = await prisma.hotspot.findMany({
      where: { ...where, resolved: false },
      include: { reporter: { select: { id: true, username: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return { hotspots }
  })

  // POST /api/hotspots
  // Hotspot melden (+30 Pts)
  app.post('/', { onRequest: [app.authenticate] }, async (req, reply) => {
    const userId = (req.user as any).id
    const { lat, lng, severity, trashTypes, photoUrl } = req.body as {
      lat: number
      lng: number
      severity: 'high' | 'medium' | 'low'
      trashTypes: string[]
      photoUrl?: string
    }

    const points = PointsService.hotspotPoints(severity)

    const [hotspot, _] = await prisma.$transaction([
      prisma.hotspot.create({
        data: {
          reportedBy: userId,
          lat,
          lng,
          severity,
          trashTypes,
          photoUrl,
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { totalPoints: { increment: points } },
      }),
    ])

    return reply.code(201).send({ hotspot, pointsEarned: points })
  })

  // POST /api/hotspots/:id/upvote
  // Hotspot bestätigen
  app.post(
    '/:id/upvote',
    { onRequest: [app.authenticate] },
    async (req, reply) => {
      const { id } = req.params as { id: string }

      const hotspot = await prisma.hotspot.update({
        where: { id },
        data: { upvotes: { increment: 1 } },
      })

      return { hotspot }
    }
  )

  // POST /api/hotspots/:id/resolve
  // Hotspot als bereinigt markieren
  app.post(
    '/:id/resolve',
    { onRequest: [app.authenticate] },
    async (req, reply) => {
      const { id } = req.params as { id: string }
      const userId = (req.user as any).id

      const hotspot = await prisma.hotspot.update({
        where: { id },
        data: {
          resolved: true,
          resolvedAt: new Date(),
        },
      })

      // Bonus für Bereinigung
      const points = 50
      await prisma.user.update({
        where: { id: userId },
        data: { totalPoints: { increment: points } },
      })

      return { hotspot, pointsEarned: points }
    }
  )

  // GET /api/hotspots/:id
  // Hotspot-Details
  app.get('/:id', async (req, reply) => {
    const { id } = req.params as { id: string }

    const hotspot = await prisma.hotspot.findUniqueOrThrow({
      where: { id },
      include: { reporter: { select: { id: true, username: true } } },
    })

    return { hotspot }
  })
}
