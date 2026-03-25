// ── Battle Data ──
// Configuration, status enums, and reward tables for the battle system.

// ── Match Status Lifecycle ──
export const MATCH_STATUS = {
  PENDING: 'pending',       // Challenge sent, waiting for opponent to accept
  ACCEPTED: 'accepted',     // Opponent accepted, both can play
  CHALLENGER_DONE: 'challenger_done', // Challenger submitted result
  OPPONENT_DONE: 'opponent_done',     // Opponent submitted result
  COMPLETED: 'completed',   // Both results in, winner determined
  EXPIRED: 'expired',       // Match timed out (opponent didn't play)
  DECLINED: 'declined',     // Opponent declined the challenge
};

// ── Battle Result Outcomes ──
export const OUTCOME = {
  WIN: 'win',
  LOSE: 'lose',
  DRAW: 'draw',
};

// ── Battle Configuration ──
export const BATTLE_CONFIG = {
  // Timing
  ROUND_DURATION: 60,         // seconds - same as solo
  MATCH_EXPIRY_HOURS: 48,     // hours before unplayed match expires

  // Difficulty (fixed for fairness - both players get same conditions)
  DIFFICULTY_LEVEL: 3,        // equivalent to level 3 solo (medium)
  FALL_TIME: 1400,            // ms - fixed, not level-dependent
  SPAWN_DELAY: 250,           // ms - fixed
  ITEMS_PER_ROUND: 30,        // fixed number of items from seed

  // Categories per battle (derived from seed, not random)
  ACTIVE_BINS: 3,

  // Matchmaking
  MATCHMAKING_LEVEL_RANGE: 3, // opponent within +/- 3 levels

  // Rewards (coins)
  REWARDS: {
    [OUTCOME.WIN]: 100,
    [OUTCOME.LOSE]: 20,
    [OUTCOME.DRAW]: 50,
  },

  // Win condition: highest score wins. Tiebreaker: accuracy, then max combo.
  TIEBREAKER_ORDER: ['accuracy', 'maxCombo', 'correctCount'],
};

// ── Battle Result Template ──
// Structure that each player submits after completing their battle run.
export function createEmptyBattleResult() {
  return {
    score: 0,
    correctCount: 0,
    totalItems: 0,
    maxCombo: 0,
    accuracy: 0,       // percentage (0-100)
    level: 0,           // player's solo level at time of battle (for matchmaking)
    completedAt: null,  // ISO timestamp
  };
}

// ── Battle Match Template ──
// Full match structure containing both players' data.
export function createMatch(id, seed, challengerId, opponentId) {
  return {
    id,
    seed,                       // shared seed for deterministic item sequence
    status: MATCH_STATUS.PENDING,
    config: {
      duration: BATTLE_CONFIG.ROUND_DURATION,
      fallTime: BATTLE_CONFIG.FALL_TIME,
      spawnDelay: BATTLE_CONFIG.SPAWN_DELAY,
      itemCount: BATTLE_CONFIG.ITEMS_PER_ROUND,
      activeBins: BATTLE_CONFIG.ACTIVE_BINS,
    },
    challengerId,
    opponentId,
    challengerResult: null,     // BattleResult or null
    opponentResult: null,       // BattleResult or null
    winner: null,               // challengerId, opponentId, or 'draw'
    outcome: null,              // OUTCOME enum (from challenger's perspective)
    reward: 0,                  // coins earned
    createdAt: new Date().toISOString(),
    completedAt: null,
  };
}
