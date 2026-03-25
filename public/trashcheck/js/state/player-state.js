// ── Player State [P2] ──
// Persistent state across rounds: coins, XP, unlocks, inventory.

export function getPlayerState() {
  // TODO [P2]: Load from save-manager
  return {
    totalCoins: 0,
    xp: 0,
    level: 1,
    unlockedItems: [],
    purchasedUpgrades: [],
  };
}

export function updatePlayerState(updates) {
  // TODO [P2]: Merge updates and persist
}
