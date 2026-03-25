// Trash bash Backend – src/server.ts
import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import multipart from '@fastify/multipart'
import { PrismaClient } from '@prisma/client'

import { sessionsRouter } from './routes/sessions'
import { hotspotsRouter } from './routes/hotspots'
import { rankingRouter }   from './routes/ranking'
import { weighRouter }     from './routes/weigh'
import { userRouter }      from './routes/users'
import { authMiddleware }  from './middleware/auth'

export const prisma = new PrismaClient()

const app = Fastify({ logger: true })

// ─── Plugins ──────────────────────────────────────────────────────────────────
await app.register(cors, { origin: true })
await app.register(jwt,  { secret: process.env.JWT_SECRET! })
await app.register(multipart, { limits: { fileSize: 10 * 1024 * 1024 } }) // 10 MB

// ─── Auth Decorator ───────────────────────────────────────────────────────────
app.decorate('authenticate', authMiddleware)

// ─── Routes ───────────────────────────────────────────────────────────────────
app.register(userRouter,     { prefix: '/api/users'    })
app.register(sessionsRouter, { prefix: '/api/sessions' })
app.register(hotspotsRouter, { prefix: '/api/hotspots' })
app.register(rankingRouter,  { prefix: '/api/ranking'  })
app.register(weighRouter,    { prefix: '/api/weigh'    })

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', async () => ({ status: 'ok', version: '0.1.0' }))

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
