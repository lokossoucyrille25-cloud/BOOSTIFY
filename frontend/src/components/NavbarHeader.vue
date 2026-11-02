<script setup lang="ts">
import { computed } from 'vue';
import { state, openAuth } from '../services/api';
import { canInstall, isStandalone, isIOS, installPwa } from '../services/pwa';

defineEmits<{
  (e: 'open-wallet'): void;
}>();

const activeOrdersCount = computed(() => {
  return state.orders.filter(o => o.status === 'processing' || o.status === 'pending').length;
});
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
        </div>
      </div>

      <!-- Navigation Desktop & Tablette (>= 768px) -->
      <nav class="desktop-nav">
        <button
          class="desktop-nav-link"
          :class="{ active: state.activeTab === 'home' }"
          @click="state.activeTab = 'home'"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          <span>Accueil</span>
        </button>

        <button
          class="desktop-nav-link highlight"
          :class="{ active: state.activeTab === 'order' }"
          @click="state.activeTab = 'order'"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>Commander</span>
        </button>

        <button
          class="desktop-nav-link"
          :class="{ active: state.activeTab === 'orders' }"
          @click="state.activeTab = 'orders'"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
          <span>Mes Commandes</span>
          <span v-if="activeOrdersCount > 0" class="desktop-badge">{{ activeOrdersCount }}</span>
        </button>

        <button
          class="desktop-nav-link"
          :class="{ active: state.activeTab === 'wallet' }"
          @click="state.activeTab = 'wallet'"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="4" width="20" height="16" rx="2"></rect>
            <line x1="2" y1="10" x2="22" y2="10"></line>
          </svg>
          <span>Portefeuille</span>
        </button>

        <button
          class="desktop-nav-link"
          :class="{ active: state.activeTab === 'profile' }"
          @click="state.activeTab = 'profile'"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <span>Profil & Aide</span>
        </button>
      </nav>

      <!-- Actions d'en-tête (Solde, Install PWA, Auth) -->
      <div class="header-actions">
        <!-- Bouton Installer l'App Desktop/Tablette -->
        <button
          v-if="!isStandalone && (canInstall || isIOS)"
          type="button"
          class="btn-desktop-install"
          @click="installPwa"
          title="Installer l'application sur cet appareil"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          <span class="btn-text">Installer l'App</span>
        </button>

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
  background: rgba(9, 13, 22, 0.88);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--border-color);
  padding: calc(10px + env(safe-area-inset-top)) 16px 10px 16px;
  transition: all 0.2s ease;
}

@media (min-width: 768px) {
  .app-header {
    padding: 12px 32px;
  }
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 16px;
}

/* Logo */
.logo-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
  flex-shrink: 0;
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

/* Navigation Desktop (masquée sur smartphone) */
.desktop-nav {
  display: none;
  align-items: center;
  gap: 6px;
}

@media (min-width: 768px) {
  .desktop-nav {
    display: flex;
  }
}

.desktop-nav-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: var(--radius-full);
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.desktop-nav-link svg {
  width: 17px;
  height: 17px;
}

.desktop-nav-link:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.05);
}

.desktop-nav-link.active {
  color: #10b981;
  background: rgba(16, 185, 129, 0.12);
  border: 1px solid rgba(16, 185, 129, 0.25);
}

.desktop-nav-link.highlight {
  color: #ffffff;
  background: linear-gradient(135deg, rgba(5, 150, 105, 0.4), rgba(16, 185, 129, 0.5));
  border: 1px solid rgba(16, 185, 129, 0.5);
}

.desktop-nav-link.highlight:hover {
  background: linear-gradient(135deg, #059669, #10b981);
}

.desktop-badge {
  background: #10b981;
  color: #000000;
  font-size: 0.65rem;
  font-weight: 800;
  padding: 1px 6px;
  border-radius: var(--radius-full);
}

/* Actions */
.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

/* Bouton PWA Install Header */
.btn-desktop-install {
  display: none;
  align-items: center;
  gap: 6px;
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.35);
  color: #34d399;
  padding: 8px 14px;
  border-radius: var(--radius-full);
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

@media (min-width: 640px) {
  .btn-desktop-install {
    display: flex;
  }
}

.btn-desktop-install:hover {
  background: rgba(16, 185, 129, 0.25);
  transform: translateY(-1px);
}

.btn-desktop-install svg {
  width: 15px;
  height: 15px;
}

/* Portefeuille Badge */
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
  min-height: 42px;
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
  min-height: 42px;
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
  min-height: 42px;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.35);
  transition: all 0.2s ease;
}

.btn-quick-register:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.5);
}
</style>
