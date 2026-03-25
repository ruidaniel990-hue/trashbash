// Trash bash – src/services/points.ts
// Zentrale Spiellogik: Punkte & Level & Badges

import { prisma } from '../server'

// ─── Punkte-Konfiguration ────────────────────────────────────────────────────

const PHOTO_POINTS: Record<string, number> = {
  plastic:  15,
  glass:    12,
  bulky:    25,  // Sperrmüll = mehr Aufwand
  organic:  10,
  mixed:    10,
}

const HOTSPOT_POINTS: Record<string, number> = {
  high:   30,
  medium: 20,
  low:    10,
}

const LEVEL_THRESHOLDS = [
  0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5500, 7500,
] // Level 1-11

// ─── Points Service ──────────────────────────────────────────────────────────

export const PointsService = {

  photoPoints(trashType: string): number {
    return PHOTO_POINTS[trashType] ?? 10
  },

  hotspotPoints(severity: string): number {
    return HOTSPOT_POINTS[severity] ?? 10
  },

  weighPoints(kgWeighed: number): number {
    // 1 kg = 20 Punkte, Bonus ab 2 kg
    const base = Math.floor(kgWeighed * 20)
    const bonus = kgWeighed >= 2 ? Math.floor((kgWeighed - 2) * 10) : 0
    return base + bonus
  },

  sessionBonus({ distanceKm, kgCollected }: {
    distanceKm: number
    kgCollected: number
  }): number {
    // Distanz-Bonus: 5 Pts/km
    const distBonus = Math.floor(distanceKm * 5)
    // Kg-Bonus: 10 Pts/kg (vorläufig, bis zur Wiegestation)
    const kgBonus = Math.floor(kgCollected * 10)
    return distBonus + kgBonus
  },

  levelForPoints(points: number): number {
    let level = 1
    for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
      if (points >= LEVEL_THRESHOLDS[i]) level = i + 1
      else break
    }
    return level
  },

  nextLevelAt(points: number): number {
    const level = PointsService.levelForPoints(points)
    return LEVEL_THRESHOLDS[level] ?? Infinity
  },

  // Badge-Check nach jeder Session / Aktion
  async checkBadges(userId: string, user: {
    totalPoints: number
    totalKg: number
    sessionCount: number
  }): Promise<void> {
    const toAward: string[] = []

    if (user.sessionCount >= 1)   toAward.push('first_session')
    if (user.sessionCount >= 10)  toAward.push('10_sessions')
    if (user.sessionCount >= 50)  toAward.push('50_sessions')
    if (user.totalKg >= 1)        toAward.push('1kg_collected')
    if (user.totalKg >= 10)       toAward.push('10kg_collected')
    if (user.totalKg >= 50)       toAward.push('50kg_collected')
    if (user.totalPoints >= 1000) toAward.push('1000_points')
    if (user.totalPoints >= 5000) toAward.push('5000_points')

    for (const key of toAward) {
      const badge = await prisma.badge.findUnique({ where: { key } })
      if (!badge) continue
      // upsert: kein Fehler wenn schon vorhanden
      await prisma.userBadge.upsert({
        where:  { userId_badgeId: { userId, badgeId: badge.id } },
        update: {},
        create: { userId, badgeId: badge.id },
      }).catch(() => {/* bereits vergeben */})
    }

    // Level aktualisieren
    const newLevel = PointsService.levelForPoints(user.totalPoints)
    await prisma.user.update({
      where: { id: userId },
      data:  { level: newLevel },
    })
  },
}
