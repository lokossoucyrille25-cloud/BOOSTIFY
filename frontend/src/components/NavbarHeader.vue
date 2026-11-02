<script setup lang="ts">
import { state, openAuth } from '../services/api';

defineEmits<{
  (e: 'open-wallet'): void;
}>();
</script>

<template>
  <header class="app-header">
    <div class="header-container">
      <!-- Logo Boostify -->
      <div class="logo-wrapper" @click="state.activeTab = 'home'">
        <div class="logo-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
          </svg>
        </div>
        <div class="logo-text">
          <span class="logo-title">Boostify</span>
          <span class="logo-badge">AFRIQUE</span>
        </div>
      </div>

      <!-- Badge Solde (si authentifié) ou Boutons Connexion / Inscription (si visiteur) -->
      <div class="header-actions">
        <template v-if="state.isAuthenticated">
          <button class="wallet-badge" @click="$emit('open-wallet')" title="Voir mon portefeuille">
            <div class="wallet-dot"></div>
            <div class="wallet-info">
              <span class="wallet-label">Solde</span>
              <span class="wallet-amount">{{ state.wallet.balance.toLocaleString() }} <small>FCFA</small></span>
            </div>
            <div class="wallet-add-btn">+</div>
          </button>
        </template>
        <template v-else>
          <div class="auth-quick-actions">
            <button class="btn-quick-login" @click="openAuth('login')">
              Connexion
            </button>
            <button class="btn-quick-register" @click="openAuth('register')">
              S'inscrire
            </button>
          </div>
        </template>
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(9, 13, 22, 0.85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--border-color);
  padding: calc(12px + env(safe-area-inset-top)) 16px 12px 16px;
}

.header-container {
  max-width: 540px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
}

.logo-icon {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: linear-gradient(135deg, #059669, #0f766e);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  box-shadow: 0 4px 14px rgba(5, 150, 105, 0.4);
}

.logo-icon svg {
  width: 20px;
  height: 20px;
}

.logo-text {
  display: flex;
  flex-direction: column;
}

.logo-title {
  font-size: 1.25rem;
  font-weight: 800;
  letter-spacing: -0.5px;
  color: #ffffff;
  line-height: 1.1;
}

.logo-badge {
  font-size: 0.65rem;
  font-weight: 700;
  color: #10b981;
  letter-spacing: 1.2px;
}

.wallet-badge {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(26, 34, 54, 0.85);
  border: 1px solid rgba(16, 185, 129, 0.25);
  padding: 6px 10px 6px 12px;
  border-radius: 9999px;
  color: #ffffff;
  transition: all 0.2s ease;
  min-height: 44px; /* Règle zone tactile 44px */
}

.wallet-badge:hover, .wallet-badge:active {
  background: rgba(30, 41, 59, 0.95);
  border-color: rgba(16, 185, 129, 0.6);
  transform: scale(0.98);
}

.wallet-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 8px #10b981;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.2); }
}

.wallet-info {
  display: flex;
  flex-direction: column;
  text-align: left;
}

.wallet-label {
  font-size: 0.65rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  font-weight: 600;
}

.wallet-amount {
  font-size: 0.95rem;
  font-weight: 700;
  color: #ffffff;
}

.wallet-amount small {
  font-size: 0.7rem;
  color: #10b981;
  font-weight: 600;
}

.wallet-add-btn {
  width: 24px;
  height: 24px;
  background: #059669;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  font-weight: 700;
  color: #ffffff;
}

.auth-quick-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-quick-login {
  background: transparent;
  border: 1px solid var(--border-color);
  color: #ffffff;
  font-size: 0.8rem;
  font-weight: 700;
  padding: 8px 14px;
  border-radius: var(--radius-full);
  min-height: 44px;
  transition: all 0.2s ease;
}

.btn-quick-login:hover {
  background: var(--bg-surface-elevated);
  border-color: #10b981;
}

.btn-quick-register {
  background: linear-gradient(135deg, #059669, #10b981);
  border: none;
  color: #ffffff;
  font-size: 0.8rem;
  font-weight: 800;
  padding: 8px 16px;
  border-radius: var(--radius-full);
  min-height: 44px;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.35);
  transition: all 0.2s ease;
}

.btn-quick-register:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.5);
}
</style>
