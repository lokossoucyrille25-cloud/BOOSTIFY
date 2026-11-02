<script setup lang="ts">
import { ref, computed } from 'vue';
import { canInstall, isIOS, isStandalone, isOnline, showIosInstructions, installPwa } from '../services/pwa';

const dismissed = ref(sessionStorage.getItem('boostify_pwa_dismissed') === 'true');

const shouldShowBanner = computed(() => {
  if (isStandalone.value || dismissed.value) return false;
  return canInstall.value || isIOS.value;
});

function dismissBanner() {
  dismissed.value = true;
  sessionStorage.setItem('boostify_pwa_dismissed', 'true');
}

function handleInstall() {
  installPwa();
}

function closeIosModal() {
  showIosInstructions.value = false;
}
</script>

<template>
  <!-- Bandeau indicateur Hors-Ligne -->
  <Transition name="slide-down">
    <div v-if="!isOnline" class="offline-strip">
      <div class="offline-content">
        <span class="offline-pulse"></span>
        <span>Mode hors-ligne : données en cache disponibles</span>
      </div>
    </div>
  </Transition>

  <!-- Bannière d'installation PWA Mobile & Web -->
  <Transition name="slide-up">
    <div v-if="shouldShowBanner" class="pwa-install-banner">
      <div class="banner-body">
        <div class="app-icon-preview">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
          </svg>
        </div>
        <div class="app-info">
          <div class="app-title-row">
            <span class="app-name">Boostify Mobile</span>
            <span class="pwa-badge">GRATUIT</span>
          </div>
          <p class="app-desc">Installez l'application pour un accès direct & instantané</p>
        </div>
        <div class="banner-actions">
          <button type="button" class="btn-install" @click="handleInstall">
            <svg class="install-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            <span>Installer</span>
          </button>
          <button type="button" class="btn-dismiss" @click="dismissBanner" title="Ignorer">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </Transition>

  <!-- Modal Guide d'installation iOS (Safari) -->
  <Transition name="fade">
    <div v-if="showIosInstructions" class="ios-modal-backdrop" @click="closeIosModal">
      <div class="ios-modal-card" @click.stop>
        <div class="ios-modal-header">
          <div class="ios-app-logo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
            </svg>
          </div>
          <div>
            <h3 class="ios-modal-title">Installer sur iPhone & iPad</h3>
            <p class="ios-modal-sub">Ajoutez Boostify à votre écran d'accueil en 3 clics</p>
          </div>
          <button class="btn-close-modal" @click="closeIosModal">✕</button>
        </div>

        <div class="ios-steps">
          <div class="ios-step">
            <div class="step-num">1</div>
            <div class="step-text">
              Dans <strong>Safari</strong>, appuyez sur le bouton de <strong>Partage</strong>
              <div class="share-icon-pill">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                  <polyline points="16 6 12 2 8 6"></polyline>
                  <line x1="12" y1="2" x2="12" y2="15"></line>
                </svg>
                <span>Partager</span>
              </div>
            </div>
          </div>

          <div class="ios-step">
            <div class="step-num">2</div>
            <div class="step-text">
              Faites défiler vers le bas et choisissez <strong>« Sur l'écran d'accueil »</strong>
              <div class="add-icon-pill">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="12" y1="8" x2="12" y2="16"></line>
                  <line x1="8" y1="12" x2="16" y2="12"></line>
                </svg>
                <span>Sur l'écran d'accueil</span>
              </div>
            </div>
          </div>

          <div class="ios-step">
            <div class="step-num">3</div>
            <div class="step-text">
              Appuyez sur <strong>« Ajouter »</strong> en haut à droite. L'icône Boostify apparaîtra immédiatement sur votre téléphone !
            </div>
          </div>
        </div>

        <button class="btn-got-it" @click="closeIosModal">
          C'est compris !
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* Strip hors ligne */
.offline-strip {
  background: linear-gradient(90deg, #b91c1c, #dc2626);
  color: #ffffff;
  padding: 8px 16px;
  font-size: 0.8rem;
  font-weight: 700;
  text-align: center;
  position: sticky;
  top: 0;
  z-index: 999;
  box-shadow: 0 2px 10px rgba(220, 38, 38, 0.4);
}

.offline-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.offline-pulse {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ffffff;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { transform: scale(0.95); opacity: 0.8; }
  50% { transform: scale(1.3); opacity: 1; }
  100% { transform: scale(0.95); opacity: 0.8; }
}

/* Bannière d'installation PWA */
.pwa-install-banner {
  position: fixed;
  bottom: calc(76px + env(safe-area-inset-bottom));
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 24px);
  max-width: 500px;
  z-index: 150;
  background: rgba(17, 24, 39, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(16, 185, 129, 0.35);
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.65), 0 0 20px rgba(16, 185, 129, 0.2);
  border-radius: 16px;
  padding: 12px 14px;
}

.banner-body {
  display: flex;
  align-items: center;
  gap: 12px;
}

.app-icon-preview {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: linear-gradient(135deg, #059669, #10b981);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.35);
  flex-shrink: 0;
}

.app-icon-preview svg {
  width: 22px;
  height: 22px;
}

.app-info {
  flex: 1;
  min-width: 0;
}

.app-title-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.app-name {
  font-size: 0.9rem;
  font-weight: 800;
  color: #ffffff;
}

.pwa-badge {
  font-size: 0.6rem;
  font-weight: 800;
  padding: 1px 6px;
  border-radius: 6px;
  background: rgba(16, 185, 129, 0.2);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.4);
}

.app-desc {
  font-size: 0.72rem;
  color: #94a3b8;
  margin: 2px 0 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.banner-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.btn-install {
  display: flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, #059669, #10b981);
  color: #ffffff;
  border: none;
  padding: 8px 14px;
  border-radius: 10px;
  font-size: 0.8rem;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.35);
  transition: transform 0.15s ease;
}

.btn-install:active {
  transform: scale(0.96);
}

.install-icon {
  width: 15px;
  height: 15px;
}

.btn-dismiss {
  background: transparent;
  border: none;
  color: #64748b;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 50%;
}

.btn-dismiss:hover {
  color: #ffffff;
}

.btn-dismiss svg {
  width: 18px;
  height: 18px;
}

/* Modal iOS Safari */
.ios-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 300;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: env(safe-area-inset-bottom);
}

.ios-modal-card {
  background: #111827;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px 24px 0 0;
  width: 100%;
  max-width: 500px;
  padding: 24px 20px;
  box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.8);
}

.ios-modal-header {
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
  margin-bottom: 20px;
}

.ios-app-logo {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #059669, #10b981);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  flex-shrink: 0;
}

.ios-app-logo svg {
  width: 26px;
  height: 26px;
}

.ios-modal-title {
  font-size: 1.05rem;
  font-weight: 800;
  color: #ffffff;
  margin: 0;
}

.ios-modal-sub {
  font-size: 0.75rem;
  color: #94a3b8;
  margin: 2px 0 0;
}

.btn-close-modal {
  position: absolute;
  top: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.08);
  border: none;
  color: #94a3b8;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ios-steps {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.ios-step {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.step-num {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.4);
  color: #10b981;
  font-size: 0.8rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.step-text {
  font-size: 0.85rem;
  color: #cbd5e1;
  line-height: 1.5;
}

.share-icon-pill, .add-icon-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
  color: #ffffff;
  margin-left: 4px;
}

.share-icon-pill svg, .add-icon-pill svg {
  width: 14px;
  height: 14px;
  color: #38bdf8;
}

.btn-got-it {
  width: 100%;
  background: linear-gradient(135deg, #059669, #10b981);
  color: #ffffff;
  border: none;
  padding: 14px;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 800;
  cursor: pointer;
}

/* Animations */
.slide-up-enter-active, .slide-up-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-up-enter-from, .slide-up-leave-to {
  transform: translate(-50%, 100px);
  opacity: 0;
}

.slide-down-enter-active, .slide-down-leave-active {
  transition: all 0.3s ease;
}
.slide-down-enter-from, .slide-down-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>

