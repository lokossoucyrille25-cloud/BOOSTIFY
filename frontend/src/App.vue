<script setup lang="ts">
import { ref } from 'vue';
import { state } from './services/api';
import NavbarHeader from './components/NavbarHeader.vue';
import HomeView from './components/HomeView.vue';
import OrderView from './components/OrderView.vue';
import OrdersView from './components/OrdersView.vue';
import WalletView from './components/WalletView.vue';
import ProfileView from './components/ProfileView.vue';
import PolicyView from './components/PolicyView.vue';
import AuthView from './components/AuthView.vue';
import BottomNavBar from './components/BottomNavBar.vue';
import type { AppTab } from './types/index';

const previousTab = ref<AppTab>('home');

function openPolicy() {
  previousTab.value = state.activeTab;
  state.activeTab = 'policy';
}

function closePolicy() {
  state.activeTab = previousTab.value === 'policy' ? 'home' : previousTab.value;
}
</script>

<template>
  <div class="app-layout">
    <!-- En-tête avec Solde ou Connexion (masqué sur policy et auth) -->
    <NavbarHeader
      v-if="state.activeTab !== 'policy' && state.activeTab !== 'auth'"
      @open-wallet="state.activeTab = 'wallet'"
    />

    <!-- Conteneur Principal (Mobile Centered) -->
    <main class="main-content">
      <Transition name="fade" mode="out-in">
        <!-- 1. Page d'Accueil placée DEVANT (Landing Page par défaut) -->
        <HomeView v-if="state.activeTab === 'home'" />

        <!-- 2. Page d'Inscription / Connexion -->
        <AuthView
          v-else-if="state.activeTab === 'auth'"
          @back-home="state.activeTab = 'home'"
          @view-policy="openPolicy"
        />

        <!-- 3. Page dédiée des Articles de la Politique & Règles -->
        <PolicyView v-else-if="state.activeTab === 'policy'" @back="closePolicy" />

        <!-- 4. Passer une Commande -->
        <OrderView v-else-if="state.activeTab === 'order'" @go-wallet="state.activeTab = 'wallet'" />

        <!-- 5. Suivi des Commandes -->
        <OrdersView v-else-if="state.activeTab === 'orders'" />

        <!-- 6. Portefeuille Mobile Money -->
        <WalletView v-else-if="state.activeTab === 'wallet'" />

        <!-- 7. Profil & Assistance -->
        <ProfileView v-else-if="state.activeTab === 'profile'" />
      </Transition>
    </main>

    <!-- Navigation Inférieure (masquée sur auth et policy) -->
    <BottomNavBar v-if="state.activeTab !== 'policy' && state.activeTab !== 'auth'" />

    <!-- Notifications Toast Globales -->
    <Transition name="slide-up">
      <div v-if="state.toast.show" class="toast-popup" :class="state.toast.type">
        <span class="toast-dot"></span>
        <span class="toast-message">{{ state.toast.message }}</span>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-app);
  padding-bottom: 90px;
}

.main-content {
  width: 100%;
  max-width: 540px;
  margin: 0 auto;
  padding: 16px;
  flex: 1;
}

/* Toast popup */
.toast-popup {
  position: fixed;
  bottom: 84px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 200;
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(17, 24, 39, 0.95);
  backdrop-filter: blur(14px);
  border: 1px solid var(--border-color);
  padding: 12px 20px;
  border-radius: var(--radius-full);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
  max-width: 90%;
  width: max-content;
}

.toast-popup.success {
  border-color: rgba(16, 185, 129, 0.5);
}

.toast-popup.error {
  border-color: rgba(239, 68, 68, 0.5);
}

.toast-popup.info {
  border-color: rgba(59, 130, 246, 0.5);
}

.toast-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10b981;
  flex-shrink: 0;
}

.toast-popup.error .toast-dot {
  background: #ef4444;
}

.toast-popup.info .toast-dot {
  background: #3b82f6;
}

.toast-message {
  font-size: 0.85rem;
  font-weight: 700;
  color: #ffffff;
}
</style>
