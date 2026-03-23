// Trash bash – prisma/seed.ts
// Seed Script für Entwicklung: Demo-Daten

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Badges erstellen
  const badges = await Promise.all([
    prisma.badge.upsert({
      where: { name: 'first_photo' },
      update: {},
      create: {
        name: 'first_photo',
        description: 'Erstes Müll-Foto hochgeladen',
      },
    }),
    prisma.badge.upsert({
      where: { name: 'hundred_points' },
      update: {},
      create: {
        name: 'hundred_points',
        description: '100 Punkte erreicht',
      },
    }),
    prisma.badge.upsert({
      where: { name: 'eco_warrior' },
      update: {},
      create: {
        name: 'eco_warrior',
        description: 'Umwelt-Krieger – 50kg gesammelt',
      },
    }),
  ])

  // Demo-Wiegestationen
  const stations = await Promise.all([
    prisma.weighStation.upsert({
      where: { id: 'station-1' },
      update: {},
      create: {
        id: 'station-1',
        name: 'Wiegestation Mitte',
        lat: 52.52,
        lng: 13.405,
        address: 'Hauptstr. 123, Berlin',
        openHour: 8,
        closeHour: 18,
      },
    }),
    prisma.weighStation.upsert({
      where: { id: 'station-2' },
      update: {},
      create: {
        id: 'station-2',
        name: 'Wiegestation Neukölln',
        lat: 52.485,
        lng: 13.43,
        address: 'Neukölln, Berlin',
        openHour: 9,
        closeHour: 17,
      },
    }),
  ])

  console.log('✅ Seeding complete')
  console.log(`Created ${badges.length} badges and ${stations.length} stations`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
