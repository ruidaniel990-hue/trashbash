// ── Battle Match ──
// Match lifecycle: create, accept, submit results, determine winner.
// Handles the data flow of a complete async battle.

import { MATCH_STATUS, OUTCOME, BATTLE_CONFIG, createMatch, createEmptyBattleResult } from './battle-data.js';
import { generateSeed, createBattleRound } from './battle-seed.js';
import { validateBattleResult, isMatchExpired } from './battle-fairness.js';

// ── Match Storage ──
// In-memory for now. Replace with API calls when backend is ready.
const MATCHES_KEY = 'trashcheck_battles';

function loadMatches() {
  try { return JSON.parse(localStorage.getItem(MATCHES_KEY) || '[]'); }
  catch { return []; }
}

function saveMatches(matches) {
  localStorage.setItem(MATCHES_KEY, JSON.stringify(matches));
}

function findMatch(matchId) {
  return loadMatches().find(m => m.id === matchId) || null;
}

function updateMatch(matchId, updates) {
  const matches = loadMatches();
  const idx = matches.findIndex(m => m.id === matchId);
  if (idx === -1) return null;
  Object.assign(matches[idx], updates);
  saveMatches(matches);
  return matches[idx];
}

// ── Generate unique match ID ──
function generateMatchId() {
  return 'battle_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
}

// ── Create a new challenge ──
export function createChallenge(challengerId, opponentId) {
  const seed = generateSeed();
  const id = generateMatchId();
  const match = createMatch(id, seed, challengerId, opponentId);

  const matches = loadMatches();
  matches.push(match);
  saveMatches(matches);

  return { matchId: id, seed, match };
}

// ── Accept a challenge ──
export function acceptChallenge(matchId) {
  const match = findMatch(matchId);
  if (!match) return { ok: false, reason: 'not_found' };
  if (match.status !== MATCH_STATUS.PENDING) return { ok: false, reason: 'invalid_status' };
  if (isMatchExpired(match)) {
    updateMatch(matchId, { status: MATCH_STATUS.EXPIRED });
    return { ok: false, reason: 'expired' };
  }

  updateMatch(matchId, { status: MATCH_STATUS.ACCEPTED });
  return { ok: true };
}

// ── Decline a challenge ──
export function declineChallenge(matchId) {
  const match = findMatch(matchId);
  if (!match) return { ok: false, reason: 'not_found' };

  updateMatch(matchId, { status: MATCH_STATUS.DECLINED });
  return { ok: true };
}

// ── Get the battle round data for a match (items, bins, config) ──
export function getBattleRound(matchId) {
  const match = findMatch(matchId);
  if (!match) return null;

  return createBattleRound(match.seed);
}

// ── Submit a player's result ──
export function submitResult(matchId, playerId, result) {
  const match = findMatch(matchId);
  if (!match) return { ok: false, reason: 'not_found' };

  // Validate result
  const validation = validateBattleResult(result, match.config);
  if (!validation.valid) return { ok: false, reason: 'invalid_result', issues: validation.issues };

  // Determine which player submitted
  const isChallenger = playerId === match.challengerId;
  const isOpponent = playerId === match.opponentId;
  if (!isChallenger && !isOpponent) return { ok: false, reason: 'not_a_participant' };

  // Store result
  const updates = {};
  if (isChallenger) {
    updates.challengerResult = { ...result, completedAt: new Date().toISOString() };
    if (!match.opponentResult) {
      updates.status = MATCH_STATUS.CHALLENGER_DONE;
    }
  } else {
    updates.opponentResult = { ...result, completedAt: new Date().toISOString() };
    if (!match.challengerResult) {
      updates.status = MATCH_STATUS.OPPONENT_DONE;
    }
  }

  // If both results are in, determine winner
  const challengerResult = isChallenger ? updates.challengerResult : match.challengerResult;
  const opponentResult = isOpponent ? updates.opponentResult : match.opponentResult;

  if (challengerResult && opponentResult) {
    const outcome = determineWinner(challengerResult, opponentResult);
    updates.status = MATCH_STATUS.COMPLETED;
    updates.winner = outcome.winner;
    updates.outcome = outcome.challengerOutcome;
    updates.reward = BATTLE_CONFIG.REWARDS[outcome.challengerOutcome];
    updates.completedAt = new Date().toISOString();
  }

  const updated = updateMatch(matchId, updates);
  return { ok: true, match: updated };
}

// ── Determine winner ──
export function determineWinner(challengerResult, opponentResult) {
  // Primary: highest score
  if (challengerResult.score > opponentResult.score) {
    return { winner: 'challenger', challengerOutcome: OUTCOME.WIN };
  }
  if (opponentResult.score > challengerResult.score) {
    return { winner: 'opponent', challengerOutcome: OUTCOME.LOSE };
  }

  // Tiebreakers
  for (const key of BATTLE_CONFIG.TIEBREAKER_ORDER) {
    if (challengerResult[key] > opponentResult[key]) {
      return { winner: 'challenger', challengerOutcome: OUTCOME.WIN };
    }
    if (opponentResult[key] > challengerResult[key]) {
      return { winner: 'opponent', challengerOutcome: OUTCOME.LOSE };
    }
  }

  // True draw
  return { winner: 'draw', challengerOutcome: OUTCOME.DRAW };
}

// ── Get all matches for a player ──
export function getPlayerMatches(playerId) {
  return loadMatches().filter(m =>
    m.challengerId === playerId || m.opponentId === playerId
  );
}

// ── Get pending challenges for a player ──
export function getPendingChallenges(playerId) {
  return loadMatches().filter(m =>
    m.opponentId === playerId && m.status === MATCH_STATUS.PENDING
  );
}

// ── Get active (accepted but not completed) matches ──
export function getActiveMatches(playerId) {
  return loadMatches().filter(m =>
    (m.challengerId === playerId || m.opponentId === playerId) &&
    [MATCH_STATUS.ACCEPTED, MATCH_STATUS.CHALLENGER_DONE, MATCH_STATUS.OPPONENT_DONE].includes(m.status)
  );
}

// ── Cleanup expired matches ──
export function cleanupExpiredMatches() {
  const matches = loadMatches();
  const updated = matches.map(m => {
    if (isMatchExpired(m) && m.status !== MATCH_STATUS.COMPLETED && m.status !== MATCH_STATUS.EXPIRED) {
      return { ...m, status: MATCH_STATUS.EXPIRED };
    }
    return m;
  });
  saveMatches(updated);
}
