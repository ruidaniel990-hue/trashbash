// Trash bash Frontend API Service
// Verbindet Frontend mit Backend

class TrashbashAPI {
  constructor(baseURL = 'https://trashbash-api.onrender.com') {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('trashbash_token') || null;
  }

  // ─── Authentication ───────────────────────────────────────────────────────

  async register(email, username, password) {
    const response = await fetch(`${this.baseURL}/api/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, username, password }),
    });

    const data = await response.json();
    if (response.ok) {
      this.token = data.token;
      localStorage.setItem('trashquest_token', this.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  }

  async login(email, password) {
    const response = await fetch(`${this.baseURL}/api/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (response.ok) {
      this.token = data.token;
      localStorage.setItem('trashquest_token', this.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  }

  async getProfile() {
    return this._fetch('/api/users/me', 'GET');
  }

  // ─── Sessions ─────────────────────────────────────────────────────────────

  async startSession() {
    return this._fetch('/api/sessions/start', 'POST', {});
  }

  async updateLocation(sessionId, lat, lng, distanceKm) {
    return this._fetch(`/api/sessions/${sessionId}/location`, 'PATCH', {
      lat,
      lng,
      distanceKm,
    });
  }

  async uploadPhoto(sessionId, lat, lng, trashType, photoUrl) {
    return this._fetch(`/api/sessions/${sessionId}/photo`, 'POST', {
      lat,
      lng,
      trashType,
      photoUrl,
    });
  }

  async endSession(sessionId, kgCollected) {
    return this._fetch(`/api/sessions/${sessionId}/end`, 'POST', {
      kgCollected,
    });
  }

  async getSession(sessionId) {
    return this._fetch(`/api/sessions/${sessionId}`, 'GET');
  }

  // ─── Hotspots ─────────────────────────────────────────────────────────────

  async getHotspots(lat, lng, radius = 5) {
    return this._fetch(
      `/api/hotspots?lat=${lat}&lng=${lng}&radius=${radius}`,
      'GET'
    );
  }

  async reportHotspot(lat, lng, severity, trashTypes, photoUrl) {
    return this._fetch('/api/hotspots', 'POST', {
      lat,
      lng,
      severity,
      trashTypes,
      photoUrl,
    });
  }

  async upvoteHotspot(hotspotId) {
    return this._fetch(`/api/hotspots/${hotspotId}/upvote`, 'POST', {});
  }

  async resolveHotspot(hotspotId) {
    return this._fetch(`/api/hotspots/${hotspotId}/resolve`, 'POST', {});
  }

  async getHotspotDetail(hotspotId) {
    return this._fetch(`/api/hotspots/${hotspotId}`, 'GET');
  }

  // ─── Ranking ──────────────────────────────────────────────────────────────

  async getRanking(period = 'all') {
    return this._fetch(`/api/ranking?period=${period}`, 'GET');
  }

  async getMyRank() {
    return this._fetch('/api/ranking/me', 'GET');
  }

  // ─── Weigh ────────────────────────────────────────────────────────────────

  async getWeighStations() {
    return this._fetch('/api/weigh/stations', 'GET');
  }

  async weighCheckin(stationId, weightKg) {
    return this._fetch('/api/weigh/checkin', 'POST', {
      stationId,
      weightKg,
    });
  }

  async getStationCheckins(stationId) {
    return this._fetch(`/api/weigh/stations/${stationId}/checkins`, 'GET');
  }

  // ─── Health & Info ────────────────────────────────────────────────────────

  async health() {
    return this._fetch('/health', 'GET');
  }

  // ─── Helper Methods ───────────────────────────────────────────────────────

  async _fetch(path, method = 'GET', body = null) {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (this.token) {
      options.headers['Authorization'] = `Bearer ${this.token}`;
    }

    if (body) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(`${this.baseURL}${path}`, options);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'API Error');
      }

      return { ok: true, data };
    } catch (error) {
      console.error('API Error:', error);
      return { ok: false, error: error.message };
    }
  }

  logout() {
    this.token = null;
    localStorage.removeItem('trashbash_token');
    localStorage.removeItem('user');
  }

  isAuthenticated() {
    return !!this.token;
  }

  getUser() {
    return JSON.parse(localStorage.getItem('user') || 'null');
  }
}

// Global Instance
const api = new TrashbashAPI();

// Export für Module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TrashbashAPI;
}
