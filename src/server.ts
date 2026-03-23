// Trash bash Backend – src/server.ts
import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import multipart from '@fastify/multipart'
import fastifyStatic from '@fastify/static'
import path from 'path'
import { fileURLToPath } from 'url'
import { PrismaClient } from '@prisma/client'
import os from 'os'

import { sessionsRouter } from './routes/sessions.js'
import { hotspotsRouter } from './routes/hotspots.js'
import { rankingRouter } from './routes/ranking.js'
import { weighRouter } from './routes/weigh.js'
import { userRouter } from './routes/users.js'
import { friendRouter } from './routes/friends.js'
import { authMiddleware } from './middleware/auth.js'

export const prisma = new PrismaClient()

const app = Fastify({ logger: true })

// ─── Plugins ──────────────────────────────────────────────────────────────────
await app.register(cors, { origin: true })
await app.register(jwt, { secret: process.env.JWT_SECRET || 'dev-secret-key' })
await app.register(multipart, { limits: { fileSize: 10 * 1024 * 1024 } }) // 10 MB

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
await app.register(fastifyStatic, {
  root: path.join(__dirname, '..', 'public'),
  prefix: '/',
  list: false,
  index: ['index.html'],
})

// ─── Auth Decorator ───────────────────────────────────────────────────────────
app.decorate('authenticate', authMiddleware)

// ─── Routes ───────────────────────────────────────────────────────────────────
app.register(userRouter, { prefix: '/api/users' })
app.register(sessionsRouter, { prefix: '/api/sessions' })
app.register(hotspotsRouter, { prefix: '/api/hotspots' })
app.register(rankingRouter, { prefix: '/api/ranking' })
app.register(weighRouter, { prefix: '/api/weigh' })
app.register(friendRouter, { prefix: '/api/friends' })

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', async () => ({ status: 'ok', version: '0.1.0' }))

// ─── Network Info (for QR code) ───────────────────────────────────────────────
app.get('/api/network-info', async () => {
  const port = Number(process.env.PORT) || 3000
  const interfaces = os.networkInterfaces()
  let localIP = 'localhost'
  for (const iface of Object.values(interfaces)) {
    for (const addr of iface ?? []) {
      if (addr.family === 'IPv4' && !addr.internal) {
        localIP = addr.address
        break
      }
    }
    if (localIP !== 'localhost') break
  }
  return { url: `http://${localIP}:${port}`, ip: localIP, port }
})

// ─── Start ────────────────────────────────────────────────────────────────────
const start = async () => {
  try {
    await app.listen({ port: Number(process.env.PORT) || 3000, host: '0.0.0.0' })
    console.log('🚀 Trash bash API läuft auf Port 3000')
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()
