// Trash bash – src/routes/sessions.ts
import { FastifyInstance } from 'fastify'
import { prisma } from '../server'
import { PointsService } from '../services/points'

export async function sessionsRouter(app: FastifyInstance) {

  // POST /api/sessions/start
  // Startet eine neue Sammel-Session
  app.post('/start', { onRequest: [app.authenticate] }, async (req, reply) => {
    const userId = (req.user as any).id

    const session = await prisma.session.create({
      data: {
        userId,
        startedAt: new Date(),
      },
    })

    return reply.code(201).send({ session })
  })

  // PATCH /api/sessions/:id/location
  // Live-Tracking: Position + Distanz updaten
  app.patch('/:id/location', { onRequest: [app.authenticate] }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const { lat, lng, distanceKm } = req.body as {
      lat: number; lng: number; distanceKm: number
    }

    // In Produktion: GeoJSON LineString in PostGIS updaten
    const session = await prisma.session.update({
      where: { id },
      data:  { distanceKm },
    })

    return { ok: true, distanceKm: session.distanceKm }
  })

  // POST /api/sessions/:id/photo
  // Foto eines gesammelten Mülls hochladen
  app.post('/:id/photo', { onRequest: [app.authenticate] }, async (req, reply) => {
    const { id: sessionId } = req.params as { id: string }
    const userId = (req.user as any).id
    const { lat, lng, trashType, photoUrl } = req.body as {
      lat: number; lng: number; trashType: string; photoUrl: string
    }

    const points = PointsService.photoPoints(trashType)

    const [photo] = await prisma.$transaction([
      prisma.trashPhoto.create({
        data: { sessionId, userId, lat, lng, trashType, photoUrl, points },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { totalPoints: { increment: points } },
      }),
    ])

    return reply.code(201).send({ photo, pointsEarned: points })
  })

  // POST /api/sessions/:id/end
  // Session beenden, finale Punkte berechnen
  app.post('/:id/end', { onRequest: [app.authenticate] }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const userId = (req.user as any).id
    const { kgCollected } = req.body as { kgCollected?: number }

    const session = await prisma.session.findUniqueOrThrow({ where: { id } })

    const bonusPoints = PointsService.sessionBonus({
      distanceKm:  session.distanceKm,
      kgCollected: kgCollected ?? 0,
    })

    const totalEarned = session.pointsEarned + bonusPoints

    const [updatedSession, updatedUser] = await prisma.$transaction([
      prisma.session.update({
        where: { id },
        data: {
          endedAt:      new Date(),
          kgCollected:  kgCollected ?? 0,
          pointsEarned: { increment: bonusPoints },
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          totalPoints:  { increment: bonusPoints },
          totalKg:      { increment: kgCollected ?? 0 },
          sessionCount: { increment: 1 },
        },
      }),
    ])

    // Badge-Check async (nicht auf Antwort warten)
    PointsService.checkBadges(userId, updatedUser).catch(console.error)

    return {
      session:      updatedSession,
      bonusPoints,
      totalEarned,
      newTotalPoints: updatedUser.totalPoints,
    }
  })

  // GET /api/sessions/my
  // Eigene Sessions abrufen
  app.get('/my', { onRequest: [app.authenticate] }, async (req) => {
    const userId = (req.user as any).id
    const sessions = await prisma.session.findMany({
      where:   { userId },
      orderBy: { startedAt: 'desc' },
      take:    20,
      include: { trashPhotos: { select: { id: true, trashType: true, points: true } } },
    })
    return { sessions }
  })
}
