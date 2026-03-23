# 🗑️ Trash bash Frontend

Modernes, responsive Frontend für die Trash bash Gamification-App.

## 📄 Seiten

### 1. **index.html** - Willkommensseite
- Einleitung zur App
- Navigation zu App & Dashboard
- Server Status
- API Übersicht

👉 **Start hier:** [index.html](index.html)

### 2. **app.html** - Live Mobile App
- 🎮 Aktive Sammel-Session
- 📸 Müll fotografieren
- 🔥 Hotspots melden
- 📍 GPS Live-Tracking
- ⭐ Echtzeit-Punkte

👉 **Zum Zocken:** [app.html](app.html)

### 3. **dashboard.html** - User Dashboard
- 📊 Persönliche Statistiken
- 🏆 Level-System & Fortschritt
- 🎖️ Achievements/Badges
- 🏆 Globale Rankings
- 🔥 Hotspots in der Nähe
- 📖 Punkte-System Übersicht

👉 **Zum Schauen:** [dashboard.html](dashboard.html)

---

## 🛠️ Integration mit Backend

Alle Seiten verwenden **api.js** zur Backend-Kommunikation:

```html
<script src="api.js"></script>
```

### Beispiel: Registrierung

```javascript
const result = await api.register('user@example.com', 'username', 'password');
if (result.ok) {
  console.log('Registrierung erfolgreich!');
  window.location.href = 'app.html';
}
```

### Beispiel: Session starten

```javascript
const result = await api.startSession();
if (result.ok) {
  const session = result.data.session;
  sessionId = session.id;
}
```

### Beispiel: Foto hochladen

```javascript
const result = await api.uploadPhoto(
  sessionId,
  52.52,    // lat
  13.405,   // lng
  'plastic',
  'https://example.com/photo.jpg'
);
if (result.ok) {
  points += result.data.pointsEarned;
}
```

---

## 🎨 Design Features

### Farbschema
- **Primary:** Gradient Purple (#667eea → #764ba2)
- **Success:** Green (#10b981)
- **Warning:** Amber (#f59e0b)
- **Danger:** Red (#ef4444)
- **Background:** Dark Navy (#0f172a)

### Animationen
- ✨ Smooth Hover Effects
- 🎯 Pulse Animations
- 📍 Location Markers (floating ring)
- 🎉 Achievement Popups
- 🎪 Toast Notifications

### Responsiv
- 📱 Mobile-first Design
- 💻 Desktop Optimized
- 🖥️ Tablet Compatible
- 📐 Flexbox & Grid Layout

---

## 📚 API Endpoints (Mock & Real)

Die App arbeitet mit Mock-Daten, kann aber einfach mit echten API-Calls verbunden werden.

### Authentifizierung
- `POST /api/users/register` - Registrierung
- `POST /api/users/login` - Login
- `GET /api/users/me` - Profil

### Sessions
- `POST /api/sessions/start` - Session starten
- `PATCH /api/sessions/:id/location` - Position updaten
- `POST /api/sessions/:id/photo` - Foto hochladen
- `POST /api/sessions/:id/end` - Session beenden

### Hotspots
- `GET /api/hotspots` - Hotspots abrufen
- `POST /api/hotspots` - Hotspot melden
- `POST /api/hotspots/:id/upvote` - Bestätigen
- `POST /api/hotspots/:id/resolve` - Bereinigt markieren

### Ranking
- `GET /api/ranking` - Globale Rankings
- `GET /api/ranking/me` - Eigene Platzierung

### Weigh Stations
- `GET /api/weigh/stations` - Alle Stationen
- `POST /api/weigh/checkin` - Einchecken

---

## 🚀 Nutzung

### Lokal (ohne Server)
```bash
# Einfach HTML öffnen
open index.html
open app.html
open dashboard.html
```

### Mit Live Server (VS Code)
```bash
# VS Code Extensions → "Live Server" installieren
# Rechtsklick auf Datei → Open with Live Server
# Oder: Öffne http://localhost:5500
```

### Mit Backend-Integration
```bash
# 1. Backend muss laufen
npm run dev  # Backend auf Port 3000

# 2. Frontend öffnen
open http://localhost:5500/public/index.html
# oder
open file:///path/to/public/index.html
```

---

## 🔌 Backend Integration (noch TODO)

Die App ist prepared für folgende Features:

1. **Echtzeit-Datenbank Sync** (Mutation Observer)
2. **Foto-Upload** (FormData mit Multipart)
3. **WebSocket für Live-Ranking** (Socket.io)
4. **Push-Notifications** (Service Worker)
5. **Offline Support** (IndexedDB Cache)

---

## 📱 Mobile App Featuresammlung

### Aktuelle Features
- ✅ Live Session Tracking
- ✅ Müll-Kategorien
- ✅ Photo Upload Simulation
- ✅ Real-time Stats
- ✅ Hotspot Map
- ✅ Achievement Toast

### TODO Features
- 🔜 Geolocation API
- 🔜 Camera API
- 🔜 Offline Support
- 🔜 Push Notifications
- 🔜 Service Worker
- 🔜 PWA Install Button

---

## 🎮 User Journey

```
Landing Page (index.html)
    ↓
    ├─→ [ZUR APP] → Live App (app.html)
    │                 ├─ Foto machen 📸
    │                 ├─ Punkte verdienen ⭐
    │                 └─ Hotspots melden 🔥
    │
    └─→ [ZUM DASHBOARD] → Stats (dashboard.html)
                            ├─ Ranking anschauen 🏆
                            ├─ Progress sehen 📊
                            └─ Achievements checken 🎖️
```

---

## 💾 Speicherung

Die App nutzt `localStorage` für:
- 🔐 JWT Token
- 👤 User Profil
- 📍 Session Daten
- 🎯 App Preferences

```javascript
// Beispiel
localStorage.setItem('trashbash_token', 'eyJ...');
localStorage.setItem('user', JSON.stringify({ id: '...', username: '...' }));
```

---

## 🐛 Debugging

### Browser Console
```javascript
// API Quick Test
api.health().then(r => console.log(r));

// User Check
console.log(api.getUser());

// Token Check
console.log(localStorage.getItem('trashbash_token'));
```

### Network Tab (DevTools)
- Schau API Requests
- Check Response Codes
- Verifiziere Payloads

---

## 📖 Weitere Ressourcen

- [Backend Docs](../SETUP.md)
- [API Endpoints](../README.md)
- [Prisma Schema](../prisma/schema.prisma)

---

## 🎯 TODO

- [ ] Real Backend Integration
- [ ] Geolocation & Map
- [ ] Photo Camera Input
- [ ] PWA Support
- [ ] Offline Mode
- [ ] Push Notifications
- [ ] Social Sharing
- [ ] Friends System

---

Viel Spaß beim Müllsammeln! 🗑️♻️

Made with ❤️ for a cleaner world 🌍
