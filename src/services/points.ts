// Trash bash – src/services/points.ts
// Zentrale Spiellogik: Punkte & Level & Badges

import { prisma } from '../server.js'

// ─── Punkte-Konfiguration ────────────────────────────────────────────────────

const PHOTO_POINTS: Record<string, number> = {
  plastic: 15,
  glass: 12,
  bulky: 25, // Sperrmüll = mehr Aufwand
  organic: 10,
  mixed: 10,
}

const HOTSPOT_POINTS: Record<string, number> = {
  high: 30,
  medium: 20,
  low: 10,
}

const LEVEL_THRESHOLDS = [
  0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5500, 7500,
] // Level 1-11

const BADGES = {
  FIRST_PHOTO: 'first_photo',
  HUNDRED_POINTS: 'hundred_points',
  ECO_WARRIOR: 'eco_warrior',
  HOTSPOT_HUNTER: 'hotspot_hunter',
  LEVEL_5: 'level_5',
  LEVEL_10: 'level_10',
}

// ─── Points Service ──────────────────────────────────────────────────────────

export const PointsService = {
  photoPoints(trashType: string): number {
    return PHOTO_POINTS[trashType] || 10
  },

  hotspotPoints(severity: string): number {
    return HOTSPOT_POINTS[severity] || 10
  },

  sessionBonus({
    distanceKm,
    kgCollected,
  }: {
    distanceKm: number
    kgCollected: number
  }): number {
    let bonus = 0
    // +1 Punkt pro km
    bonus += Math.floor(distanceKm)
    // +5 Punkte pro kg
    bonus += Math.floor(kgCollected * 5)
    return bonus
  },

  weighBonus(weightKg: number): number {
    // +20 Punkte Basis + 2 Punkte pro kg
    return 20 + Math.floor(weightKg * 2)
  },

  calculateLevel(totalPoints: number): number {
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
      if (totalPoints >= LEVEL_THRESHOLDS[i]) {
        return i + 1
      }
    }
    return 1
  },

  async checkBadges(userId: string, user: any): Promise<void> {
    // Badges asynchron checken und vergeben
    try {
      const existingBadges = await prisma.userBadge.findMany({
        where: { userId },
        include: { badge: true },
      })

      const badgeNames = new Set(existingBadges.map((b) => b.badge.name))

      // First Photo
      if (!badgeNames.has(BADGES.FIRST_PHOTO)) {
        const firstPhoto = await prisma.trashPhoto.findFirst({
          where: { userId },
        })
        if (firstPhoto) {
          const badge = await prisma.badge.findUnique({
            where: { name: BADGES.FIRST_PHOTO },
          })
          if (badge) {
            await prisma.userBadge.create({
              data: { userId, badgeId: badge.id },
            })
          }
        }
      }

      // Level-basierte Badges
      const currentLevel = this.calculateLevel(user.totalPoints)
      if (currentLevel >= 5 && !badgeNames.has(BADGES.LEVEL_5)) {
        const badge = await prisma.badge.create({
          data: {
            name: BADGES.LEVEL_5,
            description: 'Erreiche Level 5',
          },
        })
        await prisma.userBadge.create({
          data: { userId, badgeId: badge.id },
        })
      }
    } catch (e) {
      console.error('Badge check failed:', e)
    }
  },
}
