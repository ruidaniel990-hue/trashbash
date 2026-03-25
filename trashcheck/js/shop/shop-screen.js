// ── Shop Screen UI ──
// Renders the shop: item grid with buy/equip buttons, coin balance.

import { SLOTS } from './shop-data.js';
import { getShopDisplayItems, purchaseItem, equipItem, getEquippedInSlot, unequipSlot } from './shop-manager.js';
import { getBalance } from '../economy/coin-manager.js';

export function renderShop() {
  const container = document.getElementById('shop-items');
  if (!container) return;

  const coinsEl = document.getElementById('shop-coins');
  if (coinsEl) coinsEl.textContent = getBalance();

  const items = getShopDisplayItems();

  // Group by slot
  const slotNames = {
    [SLOTS.HANDS]: '🧤 Handschuhe',
    [SLOTS.HEAD]: '🔍 Kopf',
    [SLOTS.BACK]: '🎒 Rücken',
    [SLOTS.OUTFIT]: '👔 Outfit',
  };

  let html = '';
  for (const [slot, label] of Object.entries(slotNames)) {
    const slotItems = items.filter(i => i.slot === slot);
    if (slotItems.length === 0) continue;

    html += `<div class="shop-section-title">${label}</div>`;
    for (const item of slotItems) {
      const rarityClass = 'rarity-' + item.rarity;
      let statusClass = '';
      let actionHtml = '';

      if (item.equipped) {
        statusClass = 'shop-item-equipped';
        actionHtml = `<button class="shop-btn shop-btn-unequip" data-action="unequip" data-slot="${item.slot}">Ablegen</button>`;
      } else if (item.owned) {
        statusClass = 'shop-item-owned';
        actionHtml = `<button class="shop-btn shop-btn-equip" data-action="equip" data-id="${item.id}">Anlegen</button>`;
      } else if (item.purchasable) {
        actionHtml = `<button class="shop-btn shop-btn-buy" data-action="buy" data-id="${item.id}">🪙 ${item.price}</button>`;
      } else if (!item.prerequisiteMet) {
        statusClass = 'shop-item-locked';
        actionHtml = `<div class="shop-locked">🔒 Voraussetzung</div>`;
      } else {
        statusClass = 'shop-item-expensive';
        actionHtml = `<div class="shop-locked">🪙 ${item.price}</div>`;
      }

      const effectText = item.soloEffect
        ? Object.entries(item.soloEffect).map(([k, v]) => {
            if (k === 'timeBonusCorrect') return '+' + v + 's Zeit';
            if (k === 'comboShield') return v + '× Combo-Schutz';
            if (k === 'coinMultiplier') return '+' + Math.round((v - 1) * 100) + '% Coins';
            return '';
          }).filter(Boolean).join(', ')
        : 'Kosmetisch';

      html += `
        <div class="shop-item ${statusClass} ${rarityClass}">
          <div class="shop-item-icon">${item.icon}</div>
          <div class="shop-item-info">
            <div class="shop-item-name">${item.name}</div>
            <div class="shop-item-effect">${effectText}</div>
          </div>
          <div class="shop-item-action">${actionHtml}</div>
        </div>`;
    }
  }

  container.innerHTML = html;

  // Attach event listeners
  container.querySelectorAll('[data-action="buy"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const result = purchaseItem(btn.dataset.id);
      if (result.ok) renderShop(); // re-render
    });
  });

  container.querySelectorAll('[data-action="equip"]').forEach(btn => {
    btn.addEventListener('click', () => {
      equipItem(btn.dataset.id);
      renderShop();
    });
  });

  container.querySelectorAll('[data-action="unequip"]').forEach(btn => {
    btn.addEventListener('click', () => {
      unequipSlot(btn.dataset.slot);
      renderShop();
    });
  });
}
