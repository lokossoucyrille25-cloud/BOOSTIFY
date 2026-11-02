<script setup lang="ts">
import { ref, watch } from 'vue';
import { state, depositFunds, showToast } from '../services/api';

const selectedAmount = ref<number>(10000);
const customAmount = ref<number | null>(null);
const selectedOperator = ref<string>('mtn_bj');
const rechargePhone = ref<string>(state.user.phone || '');
const isRecharging = ref<boolean>(false);

watch(
  () => state.user.phone,
  (newPhone) => {
    if (!rechargePhone.value && newPhone) {
      rechargePhone.value = newPhone;
    }
  },
  { immediate: true }
);

const presetAmounts = [
  { amount: 5000, label: '5 000 FCFA' },
  { amount: 10000, label: '10 000 FCFA', popular: true },
  { amount: 25000, label: '25 000 FCFA' }
];

const operators = [
  { id: 'mtn_bj', name: 'MTN Mobile Money (Bénin / CI)', icon: '🟡' },
  { id: 'celtiis_bj', name: 'Celtiis Cash (Bénin)', icon: '🟣' },
  { id: 'moov_bj', name: 'Moov Money (Bénin / Togo)', icon: '🔵' },
  { id: 'orange', name: 'Orange Money (CI / Sénégal)', icon: '🟠' },
  { id: 'wave', name: 'Wave (CI / Sénégal)', icon: '🔷' },
  { id: 'card', name: 'Carte Bancaire (Visa / Mastercard)', icon: '💳' }
];

function selectPreset(amount: number) {
  selectedAmount.value = amount;
  customAmount.value = null;
}

function handleCustomAmountChange() {
  if (customAmount.value && customAmount.value >= 600) {
    selectedAmount.value = customAmount.value;
  }
}

async function handleDeposit() {
  const amountToCharge = customAmount.value ? customAmount.value : selectedAmount.value;

  if (amountToCharge < 600) {
    showToast('Le montant minimum de recharge est de 600 FCFA.', 'error');
    return;
  }

  if (selectedOperator.value !== 'card' && (!rechargePhone.value || rechargePhone.value.trim().length < 8)) {
    showToast('Veuillez renseigner un numéro Mobile Money valide pour recevoir la confirmation.', 'error');
    return;
  }

  isRecharging.value = true;
  try {
    await depositFunds(amountToCharge, selectedOperator.value, rechargePhone.value.trim());
  } finally {
    isRecharging.value = false;
  }
}
</script>

<template>
  <div class="wallet-view">
    <!-- Bouton flèche de redirection vers l'accueil -->
    <div class="page-nav-bar">
      <button type="button" class="btn-back-nav" @click="state.activeTab = 'home'">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        <span>Retour à l'accueil</span>
      </button>
    </div>

    <div class="wallet-header">
      <h2 class="view-title">Mon Portefeuille</h2>
      <p class="view-subtitle">Recharge instantanée par Mobile Money</p>
    </div>

    <div class="wallet-layout">
      <!-- Colonne Gauche : Solde & Recharge -->
      <div class="wallet-left-col">
        <!-- Carte de solde luxe -->
        <div class="wallet-balance-card">
          <div class="balance-card-glow"></div>
          <div class="balance-meta">
            <span class="balance-label">SOLDE DISPONIBLE</span>
            <span class="balance-user">{{ state.user.name || 'Mon Compte' }}</span>
          </div>
          <div class="balance-display">
            <span class="balance-number">{{ state.wallet.balance.toLocaleString() }}</span>
            <span class="balance-currency">FCFA</span>
          </div>
          <div class="balance-footer">
            <div class="security-chip">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
              </svg>
              Sécurisé par Chariow
            </div>
            <span class="balance-phone">{{ state.user.phone || 'Non renseigné' }}</span>
          </div>
        </div>

        <!-- Section Recharge -->
        <div class="recharge-section">
          <h3 class="section-title">Recharger mon compte</h3>

          <!-- Paliers prédéfinis du cahier des charges -->
          <div class="preset-amounts-grid">
            <button
              v-for="pack in presetAmounts"
              :key="pack.amount"
              class="amount-card"
              :class="{ active: selectedAmount === pack.amount && !customAmount }"
              @click="selectPreset(pack.amount)"
            >
              <span v-if="pack.popular" class="popular-tag">Le plus choisi</span>
              <span class="amount-val">{{ pack.label }}</span>
            </button>
          </div>

          <!-- Saisie montant libre (min 600 FCFA) -->
          <div class="custom-amount-box">
            <label class="input-label">Ou saisissez un montant libre (min. 600 FCFA)</label>
            <div class="custom-input-group">
              <input
                v-model.number="customAmount"
                type="number"
                min="600"
                step="100"
                placeholder="Ex: 2 500"
                class="input-free-amount"
                @input="handleCustomAmountChange"
              />
              <span class="input-suffix">FCFA</span>
            </div>
          </div>

          <!-- Choix de l'opérateur Mobile Money -->
          <div class="operator-box">
            <label class="input-label">1. Moyen de paiement (Réseau)</label>
            <div class="operator-list">
              <label
                v-for="op in operators"
                :key="op.id"
                class="operator-item"
                :class="{ active: selectedOperator === op.id }"
              >
                <input
                  type="radio"
                  v-model="selectedOperator"
                  :value="op.id"
                  class="radio-op"
                />
                <span class="op-icon">{{ op.icon }}</span>
                <span class="op-name">{{ op.name }}</span>
              </label>
            </div>
          </div>

          <!-- Saisie / Confirmation du numéro Mobile Money -->
          <div class="phone-confirm-box" v-if="selectedOperator !== 'card'">
            <label class="input-label">2. Numéro Mobile Money pour la validation</label>
            <div class="phone-input-group">
              <span class="phone-prefix-icon">📱</span>
              <input
                v-model="rechargePhone"
                type="tel"
                placeholder="Ex: 0159299198 ou +229 0159299198"
                class="input-phone-recharge"
              />
            </div>
            <p class="phone-helper-text">
              ⚡ Chariow envoie directement le message de confirmation avec le montant choisi sur ce numéro, et vous atterrissez directement sur la page de confirmation.
            </p>
          </div>

          <!-- Bouton de validation de recharge -->
          <button
            class="btn-confirm-recharge"
            :disabled="isRecharging"
            @click="handleDeposit"
          >
            <span v-if="!isRecharging">
              Recharger {{ (customAmount || selectedAmount).toLocaleString() }} FCFA
            </span>
            <span v-else>Envoi de la confirmation Mobile Money...</span>
          </button>
        </div>
      </div>

      <!-- Colonne Droite : Historique des transactions -->
      <div class="wallet-right-col">
        <div class="transactions-section">
          <h3 class="section-title">Historique des transactions</h3>
          <div v-if="state.transactions.length > 0" class="transactions-list">
            <div
              v-for="tx in state.transactions"
              :key="tx.id"
              class="transaction-row"
            >
              <div class="tx-icon" :class="tx.type">
                {{ tx.type === 'deposit' ? '↓' : '↑' }}
              </div>
              <div class="tx-details">
                <span class="tx-title">
                  {{ tx.type === 'deposit' ? 'Recharge Mobile Money' : 'Paiement Commande' }}
                </span>
                <span class="tx-ref">{{ tx.reference }} • {{ tx.created_at }}</span>
              </div>
              <div class="tx-amount" :class="tx.type">
                {{ tx.type === 'deposit' ? '+' : '-' }}{{ tx.amount.toLocaleString() }} <small>FCFA</small>
              </div>
            </div>
          </div>
          <div v-else class="transactions-empty">
            <p>Aucune transaction enregistrée pour le moment. Vos recharges et commandes s'afficheront ici.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.wallet-view {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.wallet-layout {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.wallet-left-col {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

@media (min-width: 900px) {
  .wallet-layout {
    display: grid;
    grid-template-columns: 1.15fr 0.85fr;
    gap: 28px;
    align-items: flex-start;
  }

  .wallet-right-col {
    position: sticky;
    top: 84px;
  }
}

.view-title {
  font-size: 1.35rem;
  font-weight: 800;
  color: #ffffff;
}

.view-subtitle {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

/* Carte solde luxe */
.wallet-balance-card {
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #064e3b 0%, #059669 50%, #0f766e 100%);
  border-radius: var(--radius-lg);
  padding: 22px;
  color: #ffffff;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-shadow: 0 10px 28px rgba(5, 150, 105, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.balance-card-glow {
  position: absolute;
  top: -60px;
  right: -60px;
  width: 180px;
  height: 180px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.25) 0%, transparent 70%);
  pointer-events: none;
}

.balance-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.balance-label {
  font-size: 0.75rem;
  letter-spacing: 1.2px;
  font-weight: 800;
  color: #a7f3d0;
}

.balance-user {
  font-size: 0.85rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.9);
}

.balance-display {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.balance-number {
  font-size: 2.2rem;
  font-weight: 800;
  letter-spacing: -1px;
}

.balance-currency {
  font-size: 1.1rem;
  font-weight: 700;
  color: #a7f3d0;
}

.balance-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.15);
}

.security-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  color: #d1fae5;
  font-weight: 600;
}

.security-chip svg {
  width: 14px;
  height: 14px;
}

.balance-phone {
  font-size: 0.8rem;
  color: #d1fae5;
}

/* Formulaire Recharge */
.recharge-section {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 800;
  color: #ffffff;
}

.preset-amounts-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.amount-card {
  position: relative;
  background: var(--bg-surface-elevated);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 14px 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  transition: all 0.2s;
  min-height: 48px;
}

.amount-card.active {
  background: rgba(16, 185, 129, 0.15);
  border-color: #10b981;
  color: #10b981;
}

.popular-tag {
  position: absolute;
  top: -8px;
  font-size: 0.6rem;
  font-weight: 800;
  background: #f59e0b;
  color: #000000;
  padding: 1px 6px;
  border-radius: var(--radius-full);
}

.amount-val {
  font-size: 0.85rem;
  font-weight: 700;
}

.custom-amount-box {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.input-label {
  font-size: 0.8rem;
  color: var(--text-secondary);
  font-weight: 600;
}

.custom-input-group {
  display: flex;
  align-items: center;
  background: var(--bg-surface-elevated);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  padding: 0 14px;
}

.input-free-amount {
  flex: 1;
  background: transparent;
  border: none;
  padding: 12px 0;
  color: #ffffff;
  font-size: 1rem;
  font-weight: 700;
}

.input-suffix {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-muted);
}

.operator-box {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.operator-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.operator-item {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--bg-surface-elevated);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  padding: 10px 14px;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 44px;
}

.operator-item.active {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.08);
}

.radio-op {
  accent-color: #10b981;
}

.op-icon {
  font-size: 1.1rem;
}

.op-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: #ffffff;
}

.phone-confirm-box {
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: rgba(16, 185, 129, 0.05);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: var(--radius-md);
  padding: 14px;
}

.phone-input-group {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--bg-surface-elevated);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  padding: 0 12px;
}

.phone-prefix-icon {
  font-size: 1.1rem;
}

.input-phone-recharge {
  flex: 1;
  background: transparent;
  border: none;
  padding: 12px 0;
  color: #ffffff;
  font-size: 0.95rem;
  font-weight: 600;
  outline: none;
}

.phone-helper-text {
  font-size: 0.78rem;
  color: #10b981;
  margin: 0;
  line-height: 1.4;
}

.btn-confirm-recharge {
  background: linear-gradient(135deg, #059669, #10b981);
  color: #ffffff;
  font-weight: 800;
  padding: 14px;
  border-radius: var(--radius-md);
  font-size: 0.95rem;
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35);
  transition: all 0.2s;
  min-height: 48px;
  margin-top: 4px;
}

.btn-confirm-recharge:hover, .btn-confirm-recharge:active {
  transform: translateY(-1px);
}

/* Transactions */
.transactions-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.transactions-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.transaction-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  padding: 12px 14px;
}

.tx-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1rem;
  flex-shrink: 0;
  margin-right: 12px;
}

.tx-icon.deposit {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
}

.tx-icon.order_debit {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

.tx-details {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.tx-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: #ffffff;
}

.tx-ref {
  font-size: 0.7rem;
  color: var(--text-muted);
}

.tx-amount {
  font-size: 0.95rem;
  font-weight: 800;
}

.tx-amount.deposit {
  color: #10b981;
}

.tx-amount.order_debit {
  color: #f87171;
}

.transactions-empty {
  padding: 24px 16px;
  background: var(--bg-surface);
  border: 1px dashed var(--border-color);
  border-radius: var(--radius-md);
  text-align: center;
  color: var(--text-muted);
  font-size: 0.85rem;
}
</style>
