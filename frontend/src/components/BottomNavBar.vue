<script setup lang="ts">
import { computed } from 'vue';
import { state, openAuth } from '../services/api';

const activeOrdersCount = computed(() => {
  return state.orders.filter(o => o.status === 'processing' || o.status === 'pending').length;
});
</script>

<template>
  <nav class="bottom-nav">
    <div class="nav-container">
      <!-- 1. Accueil -->
      <button
        class="nav-tab"
        :class="{ active: state.activeTab === 'home' }"
        @click="state.activeTab = 'home'"
      >
        <div class="nav-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
        </div>
        <span class="nav-label">Accueil</span>
      </button>

      <!-- 2. Commander (CTA mis en avant) -->
      <button
        class="nav-tab highlight"
        :class="{ active: state.activeTab === 'order' }"
        @click="state.activeTab = 'order'"
      >
        <div class="nav-icon-main">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </div>
        <span class="nav-label">Commander</span>
      </button>

      <!-- 3. Commandes avec badge actif -->
      <button
        class="nav-tab"
        :class="{ active: state.activeTab === 'orders' }"
        @click="state.activeTab = 'orders'"
      >
        <div class="nav-icon relative">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
          <span v-if="activeOrdersCount > 0" class="badge-active-count">
            {{ activeOrdersCount }}
          </span>
        </div>
        <span class="nav-label">Commandes</span>
      </button>

      <!-- 4. Portefeuille -->
      <button
        class="nav-tab"
        :class="{ active: state.activeTab === 'wallet' }"
        @click="state.activeTab = 'wallet'"
      >
        <div class="nav-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="4" width="20" height="16" rx="2"></rect>
            <line x1="2" y1="10" x2="22" y2="10"></line>
          </svg>
        </div>
        <span class="nav-label">Portefeuille</span>
      </button>

      <!-- 5. Profil (si connecté) ou Connexion (si visiteur) -->
      <button
        v-if="state.isAuthenticated"
        class="nav-tab"
        :class="{ active: state.activeTab === 'profile' }"
        @click="state.activeTab = 'profile'"
      >
        <div class="nav-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
        <span class="nav-label">Profil</span>
      </button>

      <button
        v-else
        class="nav-tab"
        :class="{ active: state.activeTab === 'auth' }"
        @click="openAuth('login')"
      >
        <div class="nav-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
            <polyline points="10 17 15 12 10 7"></polyline>
            <line x1="15" y1="12" x2="3" y2="12"></line>
          </svg>
        </div>
        <span class="nav-label">Connexion</span>
      </button>
    </div>
  </nav>
</template>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: rgba(17, 24, 39, 0.92);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 1px solid var(--border-color);
  padding: 6px 12px calc(6px + env(safe-area-inset-bottom));
}

.nav-container {
  max-width: 540px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-around;
  height: 60px;
}

.nav-tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background: transparent;
  color: var(--text-muted);
  transition: all 0.2s ease;
  min-height: 44px; /* Zone tactile conforme */
  position: relative;
}

.nav-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.nav-icon svg {
  width: 22px;
  height: 22px;
}

.nav-label {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: -0.2px;
}

.nav-tab.active {
  color: #10b981;
}

.badge-active-count {
  position: absolute;
  top: -4px;
  right: -8px;
  background: #10b981;
  color: #000000;
  font-size: 0.65rem;
  font-weight: 800;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Bouton Commander central stylisé */
.nav-tab.highlight .nav-icon-main {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #059669, #10b981);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  margin-top: -16px;
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.45);
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.nav-tab.highlight:hover .nav-icon-main,
.nav-tab.highlight.active .nav-icon-main {
  transform: scale(1.08);
}

.nav-icon-main svg {
  width: 22px;
  height: 22px;
}
</style>
