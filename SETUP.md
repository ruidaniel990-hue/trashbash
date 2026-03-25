# Trash bash Backend – Vollständiges Setup

Node.js + Fastify + PostgreSQL (Supabase) + Prisma + TypeScript

## 🚀 Quick Start

### 1️⃣ Abhängigkeiten installieren

```bash
npm install
```

### 2️⃣ Umgebungsvariablen konfigurieren

```bash
cp .env.example .env
# → .env öffnen und DATABASE_URL + JWT_SECRET eintragen
```

**Beispiel .env (lokal):**
```
DATABASE_URL=postgresql://user:password@localhost:5432/trashquest
JWT_SECRET=my-super-secret-key-change-in-production
PORT=3000
NODE_ENV=development
```

**Mit Supabase:**
```bash
# Supabase Dashboard → Settings → Database → Connection String
# (PostgreSQL URI / Node.js format kopieren)
DATABASE_URL=postgresql://postgres.xxxxx:password@db.xxxxx.supabase.co:5432/postgres?schema=public
```

### 3️⃣ Datenbank vorbereiten

```bash
# Prisma Client generieren
npm run db:generate

# Migrations durchführen
npm run db:migrate

# (Optional) Demo-Daten seeden
npm run db:seed
```

### 4️⃣ Entwicklungsserver starten

```bash
npm run dev
# → API läuft auf http://localhost:3000
# → Health Check: GET http://localhost:3000/health
```

---

## 📋 Projektstruktur

```
trashquest-backend/
├── src/
│   ├── server.ts                 # Fastify App Entry Point
│   ├── routes/                   # API Routes
│   │   ├── users.ts              # Auth: Register, Login, Profile
│   │   ├── sessions.ts           # Session Management
│   │   ├── hotspots.ts           # Müll-Hotspots
│   │   ├── ranking.ts            # Ranglisten
│   │   └── weigh.ts              # Wiegestationen
│   ├── services/
│   │   └── points.ts             # Punkte & Gamification Logic
│   └── middleware/
│       └── auth.ts               # JWT Authentication
│
├── prisma/
│   ├── schema.prisma             # Datenbank-Schema
│   └── seed.ts                   # Demo-Daten
│
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript Config
├── .env.example                  # ENV Template
└── README.md                      # Diese Datei
```

---

## 🔌 API Endpoints

### Users (Authentifizierung)

| Method | Route | Auth | Beschreibung |
|--------|-------|------|-------------|
| **POST** | `/api/users/register` | ❌ | Neues Konto anlegen |
| **POST** | `/api/users/login` | ❌ | Einloggen, JWT erhalten |
| **GET** | `/api/users/me` | ✅ | Eigenes Profil abrufen |

### Sessions (Sammel-Sessions)

| Method | Route | Auth | Beschreibung |
|--------|-------|------|-------------|
| **POST** | `/api/sessions/start` | ✅ | Session starten |
| **PATCH** | `/api/sessions/:id/location` | ✅ | GPS-Position, Distanz updaten |
| **POST** | `/api/sessions/:id/photo` | ✅ | Müll-Foto hochladen |
| **POST** | `/api/sessions/:id/end` | ✅ | Session beenden + Bonuspunkte |
| **GET** | `/api/sessions/:id` | ✅ | Session-Details |

### Hotspots (Müll-Hotspots)

| Method | Route | Auth | Beschreibung |
|--------|-------|------|-------------|
| **GET** | `/api/hotspots?lat=&lng=&radius=` | ❌ | Hotspots in der Nähe |
| **POST** | `/api/hotspots` | ✅ | Neuen Hotspot melden |
| **POST** | `/api/hotspots/:id/upvote` | ✅ | Hotspot bestätigen |
| **POST** | `/api/hotspots/:id/resolve` | ✅ | Hotspot als bereinigt markieren |
| **GET** | `/api/hotspots/:id` | ❌ | Hotspot-Details |

### Ranking (Statistik)

| Method | Route | Auth | Beschreibung |
|--------|-------|------|-------------|
| **GET** | `/api/ranking?period=week\|month\|all` | ❌ | Globale Rangliste |
| **GET** | `/api/ranking/me` | ✅ | Eigene Platzierung |

### Weigh (Wiegestationen)

| Method | Route | Auth | Beschreibung |
|--------|-------|------|-------------|
| **GET** | `/api/weigh/stations` | ❌ | Alle Wiegestationen |
| **POST** | `/api/weigh/checkin` | ✅ | Müll wiegen + Punkte |
| **GET** | `/api/weigh/stations/:id/checkins` | ❌ | Letzte Checkins |

---

## 🎮 Punkte-System

### Aktivitäten

| Aktion | Punkte |
|--------|--------|
| Plastik-Foto | 15 |
| Glas-Foto | 12 |
| Sperrmüll-Foto | 25 |
| Organik-Foto | 10 |
| **Hotspot melden** | **High:** 30 Pts / **Medium:** 20 Pts / **Low:** 10 Pts |
| **Hotspot bereinigen** | 50 |
| **Pro km Session** | +1 |
| **Pro kg gewogen** | +2 |
| **Wiegestation Checkin** | 20 + (2 × kg) |

### Level-System

| Level | Punkte erforderlich |
|-------|-------------------|
| 1 | 0 |
| 2 | 100 |
| 3 | 300 |
| 4 | 600 |
| 5 | 1.000 |
| 6 | 1.500 |
| 7 | 2.200 |
| 8 | 3.000 |
| 9 | 4.000 |
| 10 | 5.500 |
| 11 | 7.500 |

---

## 🛠️ Scripts

```bash
# Entwicklung
npm run dev          # Hot-reload Server starten
npm run build        # TypeScript → JavaScript kompilieren
npm run start        # Production starten

# Datenbank
npm run db:generate  # Prisma Client generieren
npm run db:migrate   # Migrations durchführen
npm run db:studio    # Prisma Studio öffnen (GUI)
npm run db:seed      # Demo-Daten laden

# Code Quality
npm run lint         # ESLint prüfen
npm run format       # Prettier formatieren
npm run test         # Vitest starten
```

---

## 🔐 Authentication

**JWT Token erhalten:**
```bash
POST /api/users/login
Body: { "email": "...", "password": "..." }
→ Response: { "user": {...}, "token": "eyJ..." }
```

**Token verwenden:**
```bash
GET /api/users/me
Header: Authorization: Bearer eyJ...
```

---

## 🗄️ Datenbank

### Mit Supabase (empfohlen)

1. **Account erstellen:** https://supabase.com
2. **Projekt anlegen** mit PostgreSQL
3. **Connection String kopieren:**
   - Dashboard → Settings → Database → URI (Node.js)
   - In `.env` eintragen als `DATABASE_URL`

### Lokal mit Docker

```bash
docker run --name trashquest-db -e POSTGRES_PASSWORD=secret -e POSTGRES_DB=trashquest -p 5432:5432 postgres:15
```

---

## 📦 Installation von Grund auf

```bash
# 1. Projekt klonen / neue Repo
git clone <repo> trashquest-backend
cd trashquest-backend

# 2. Node / npm überprüfen
node --version  # v18+ erforderlich
npm --version

# 3. Abhängigkeiten installieren
npm install

# 4. .env konfigurieren
cp .env.example .env
# → DATABASE_URL eintragen!

# 5. Datenbank
npm run db:generate
npm run db:migrate
npm run db:seed

# 6. Starten
npm run dev
```

---

## 🧪 Testing

```bash
# Unit Tests schreiben (src/**/*.test.ts)
npm run test        # Alle Tests
npm run test:watch  # Watch Mode
```

---

## 🚀 Deployment

### Zu Vercel / Railway / Heroku

1. **Umgebungsvariablen setzen:**
   - `DATABASE_URL` (Supabase)
   - `JWT_SECRET` (sicherer Key)
   - `NODE_ENV=production`

2. **Build:**
   ```bash
   npm run build
   ```

3. **Start:**
   ```bash
   npm start
   ```

---

## 🐛 Debugging

### Server läuft nicht?

```bash
# Logs checken
npm run dev

# Port bereits in Nutzung?
lsof -i :3000
kill -9 <PID>

# Datenbank-Fehler?
npm run db:studio  # Prisma Studio öffnen
```

### JWT Fehler?

- `JWT_SECRET` in `.env` gesetzt?
- Token mit "Bearer " im Header?

---

## 📞 Weitere Ressourcen

- **Fastify Docs:** https://www.fastify.io
- **Prisma Docs:** https://www.prisma.io/docs
- **Supabase:** https://supabase.com/docs
- **PostgreSQL:** https://www.postgresql.org/docs/

---

## 👨‍💻 Team

TrashQuest Backend – Gamified Trash Collection API

Made with 🌍♻️
