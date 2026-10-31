<script setup lang="ts">
import { computed } from 'vue';
import { state, openAuth, showToast } from '../services/api';
import NetworkSelector from './NetworkSelector.vue';
import type { ServiceItem } from '../types/index';

const currentServices = computed(() => {
  return state.services.filter(s => s.network === state.currentNetwork && !s.is_featured);
});

const featuredPack = computed(() => {
  return state.services.find(s => s.is_featured);
});

function startOrderWithService(service: ServiceItem) {
  state.selectedServiceForOrder = service;
  if (!state.isAuthenticated) {
    showToast("Veuillez vous inscrire ou vous connecter pour passer commande.", "info");
    openAuth('register');
  } else {
    state.activeTab = 'order';
  }
}
</script>

<template>
  <div class="home-view">
    <!-- 0. Carte de bienvenue pour visiteurs non connectés -->
    <div v-if="!state.isAuthenticated" class="visitor-welcome-card">
      <div class="visitor-welcome-badge">
        <span>✨ REJOIGNEZ BOOSTIFY</span>
      </div>
      <h3 class="visitor-welcome-title">Faites décoller votre visibilité en Afrique de l'Ouest</h3>
      <p class="visitor-welcome-desc">Abonnés, likes, vues et membres réels sans mot de passe, payables directement par Mobile Money.</p>
      <div class="visitor-auth-buttons">
        <button class="btn-visitor-register" @click="openAuth('register')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="8.5" cy="7" r="4"></circle>
            <line x1="20" y1="8" x2="20" y2="14"></line>
            <line x1="23" y1="11" x2="17" y2="11"></line>
          </svg>
          <span>Créer un compte</span>
        </button>
        <button class="btn-visitor-login" @click="openAuth('login')">
          <span>Se connecter</span>
        </button>
      </div>
    </div>

    <!-- 1. Bannière Pack Vedette -->
    <div v-if="featuredPack" class="featured-card">
      <div class="featured-glow"></div>
      <div class="featured-header">
        <span class="badge-featured">🔥 PACK VEDETTE DU MOIS</span>
        <span class="badge-discount">-40% RÉDUCTION</span>
      </div>
      <div class="featured-body">
        <div class="featured-title-wrap">
          <h2 class="featured-title">Pack 10 000 Abonnés</h2>
          <p class="featured-desc">Démarrez votre profil TikTok avec une base solide et crédible.</p>
        </div>
        <div class="featured-price-box">
          <span class="old-price">25 000 FCFA</span>
          <span class="featured-price">15 000 <small>FCFA</small></span>
        </div>
      </div>
      <button class="btn-featured-order" @click="startOrderWithService(featuredPack)">
        <span>Profiter de l'offre vedette</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="5" y1="12" x2="19" y2="12"></line>
          <polyline points="12 5 19 12 12 19"></polyline>
        </svg>
      </button>
    </div>

    <!-- 2. Sélecteur de réseaux sociaux -->
    <div class="section-header">
      <h3 class="section-title">Choisissez votre réseau</h3>
      <span class="section-subtitle">Services garantis sans mot de passe</span>
    </div>
    <NetworkSelector />

    <!-- 3. Liste des cartes de services pour le réseau sélectionné -->
    <div class="services-grid">
      <div
        v-for="service in currentServices"
        :key="service.id"
        class="service-card"
      >
        <div class="service-card-top">
          <span class="service-category">{{ service.category }}</span>
          <span class="service-minmax">Min: {{ service.min_quantity.toLocaleString() }}</span>
        </div>

        <h4 class="service-name">{{ service.name }}</h4>
        <p class="service-description">{{ service.description }}</p>

        <div class="service-card-footer">
          <div class="service-price-block">
            <span class="price-value">{{ service.price_per_1000.toLocaleString() }} <small>FCFA</small></span>
            <span class="price-unit">pour 1 000 unités</span>
          </div>
          <button class="btn-order-card" @click="startOrderWithService(service)">
            Commander
          </button>
        </div>
      </div>
    </div>

    <!-- 4. Garanties & Rassurance -->
    <div class="trust-banner">
      <div class="trust-item">
        <div class="trust-icon">🔒</div>
        <div class="trust-content">
          <h5>Zéro mot de passe</h5>
          <p>Seule l'adresse publique de votre page ou post est demandée.</p>
        </div>
      </div>
      <div class="trust-item">
        <div class="trust-icon">⚡</div>
        <div class="trust-content">
          <h5>Démarrage < 10 min</h5>
          <p>Traitement automatique 24h/24 dès validation.</p>
        </div>
      </div>
      <div class="trust-item">
        <div class="trust-icon">📱</div>
        <div class="trust-content">
          <h5>Mobile Money</h5>
          <p>Payez en toute simplicité (MTN, Moov, Orange, Wave).</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-view {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Carte de Bienvenue Visiteurs */
.visitor-welcome-card {
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(6, 78, 59, 0.35));
  border: 1px solid rgba(16, 185, 129, 0.35);
  border-radius: var(--radius-lg);
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.35);
}

.visitor-welcome-badge span {
  font-size: 0.68rem;
  font-weight: 800;
  color: #10b981;
  background: rgba(16, 185, 129, 0.15);
  padding: 3px 10px;
  border-radius: var(--radius-full);
  letter-spacing: 0.5px;
}

.visitor-welcome-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: #ffffff;
  line-height: 1.25;
}

.visitor-welcome-desc {
  font-size: 0.85rem;
  color: #a7f3d0;
  line-height: 1.4;
}

.visitor-auth-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 4px;
}

.btn-visitor-register {
  flex: 1;
  min-width: 140px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: linear-gradient(135deg, #059669, #10b981);
  color: #ffffff;
  font-size: 0.9rem;
  font-weight: 800;
  padding: 12px 16px;
  border-radius: var(--radius-md);
  min-height: 46px;
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35);
  transition: all 0.2s ease;
}

.btn-visitor-register svg {
  width: 18px;
  height: 18px;
}

.btn-visitor-register:hover, .btn-visitor-register:active {
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(16, 185, 129, 0.5);
}

.btn-visitor-login {
  background: var(--bg-surface-elevated);
  border: 1px solid var(--border-color);
  color: #ffffff;
  font-size: 0.85rem;
  font-weight: 700;
  padding: 12px 18px;
  border-radius: var(--radius-md);
  min-height: 46px;
  transition: all 0.2s ease;
}

.btn-visitor-login:hover, .btn-visitor-login:active {
  background: rgba(16, 185, 129, 0.12);
  border-color: #10b981;
}

/* Pack Vedette */
.featured-card {
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, rgba(6, 78, 59, 0.95), rgba(15, 118, 110, 0.9));
  border: 1px solid rgba(16, 185, 129, 0.4);
  border-radius: var(--radius-lg);
  padding: 20px;
  box-shadow: 0 12px 30px rgba(5, 150, 105, 0.25);
}

.featured-glow {
  position: absolute;
  top: -40px;
  right: -40px;
  width: 140px;
  height: 140px;
  background: radial-gradient(circle, rgba(16, 185, 129, 0.5) 0%, transparent 70%);
  pointer-events: none;
}

.featured-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.badge-featured {
  font-size: 0.7rem;
  font-weight: 800;
  background: #f59e0b;
  color: #000000;
  padding: 3px 8px;
  border-radius: var(--radius-full);
  letter-spacing: 0.5px;
}

.badge-discount {
  font-size: 0.7rem;
  font-weight: 800;
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
  padding: 3px 8px;
  border-radius: var(--radius-full);
}

.featured-body {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.featured-title {
  font-size: 1.35rem;
  font-weight: 800;
  color: #ffffff;
  line-height: 1.2;
}

.featured-desc {
  font-size: 0.85rem;
  color: #a7f3d0;
  margin-top: 4px;
}

.featured-price-box {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.old-price {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
  text-decoration: line-through;
}

.featured-price {
  font-size: 1.45rem;
  font-weight: 800;
  color: #ffffff;
}

.featured-price small {
  font-size: 0.8rem;
  color: #6ee7b7;
}

.btn-featured-order {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: #ffffff;
  color: #064e3b;
  font-weight: 800;
  padding: 13px 16px;
  border-radius: var(--radius-md);
  font-size: 0.95rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.2s ease;
  min-height: 48px;
}

.btn-featured-order:hover, .btn-featured-order:active {
  background: #f0fdf4;
  transform: translateY(-1px);
}

.btn-featured-order svg {
  width: 18px;
  height: 18px;
}

/* Titres de sections */
.section-header {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-top: 4px;
}

.section-title {
  font-size: 1.15rem;
  font-weight: 800;
  color: #ffffff;
}

.section-subtitle {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

/* Grille de services */
.services-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.service-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: all 0.2s ease;
}

.service-card:hover {
  background: var(--bg-surface-elevated);
  border-color: rgba(16, 185, 129, 0.3);
}

.service-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.service-category {
  font-size: 0.7rem;
  font-weight: 700;
  color: #10b981;
  background: rgba(16, 185, 129, 0.12);
  padding: 3px 8px;
  border-radius: var(--radius-full);
  text-transform: uppercase;
}

.service-minmax {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.service-name {
  font-size: 1.05rem;
  font-weight: 700;
  color: #ffffff;
}

.service-description {
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.4;
}

.service-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.service-price-block {
  display: flex;
  flex-direction: column;
}

.price-value {
  font-size: 1.15rem;
  font-weight: 800;
  color: #ffffff;
}

.price-value small {
  font-size: 0.75rem;
  color: #10b981;
}

.price-unit {
  font-size: 0.7rem;
  color: var(--text-muted);
}

.btn-order-card {
  background: var(--color-primary);
  color: #ffffff;
  font-weight: 700;
  padding: 9px 18px;
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
  min-height: 44px; /* Règle 44px minimum */
  transition: all 0.2s ease;
}

.btn-order-card:hover, .btn-order-card:active {
  background: var(--color-primary-light);
  transform: translateY(-1px);
}

/* Bannière de réassurance */
.trust-banner {
  background: rgba(26, 34, 54, 0.5);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: 10px;
}

.trust-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.trust-icon {
  font-size: 1.4rem;
  line-height: 1;
}

.trust-content h5 {
  font-size: 0.9rem;
  font-weight: 700;
  color: #ffffff;
}

.trust-content p {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-top: 2px;
}
</style>
