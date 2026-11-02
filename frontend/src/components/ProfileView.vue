<script setup lang="ts">
import { ref } from 'vue';
import { state, showToast, logout } from '../services/api';
import { isStandalone, installPwa } from '../services/pwa';

const activeFaq = ref<number | null>(0);

function handleLogout() {
  logout();
}

const faqs = [
  {
    q: 'Est-ce que vous demandez le mot de passe de mon compte ?',
    a: 'Non, jamais ! Boostify ne demande JAMAIS de mot de passe, ni d\'accès à votre compte. Seule l\'adresse publique du profil ou de la publication est nécessaire.'
  },
  {
    q: 'Combien de temps prend la livraison d\'une commande ?',
    a: 'Plus de 90% des commandes démarrent en moins de 10 minutes suivant la validation. La livraison se fait ensuite de manière progressive et naturelle.'
  },
  {
    q: 'Comment fonctionne le remboursement en cas d\'annulation ?',
    a: 'Si une commande ne peut aboutir ou n\'est livrée que partiellement, le montant exact correspondant à la part non livrée est automatiquement recrédité sur votre portefeuille Boostify.'
  },
  {
    q: 'Quels sont les pays et moyens de paiement acceptés ?',
    a: 'Nous acceptons les paiements en FCFA par Mobile Money au Bénin (MTN, Moov), en Côte d\'Ivoire (MTN, Orange, Wave), au Sénégal (Orange, Wave) et au Togo (Moov, T-Money), ainsi que les cartes Visa/Mastercard.'
  }
];

function toggleFaq(index: number) {
  activeFaq.value = activeFaq.value === index ? null : index;
}

function openWhatsAppSupport() {
  window.open('https://wa.me/22997000000?text=Bonjour%20Boostify%2C%20j%27ai%20besoin%20d%27assistance', '_blank');
}

function confirmDeleteAccount() {
  if (confirm('Voulez-vous vraiment demander la suppression définitive de votre compte et de vos données personnelles ?')) {
    showToast('Demande de suppression enregistrée auprès du support.', 'info');
  }
}
</script>

<template>
  <div class="profile-view">
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

    <div class="profile-header">
      <h2 class="view-title">Profil & Support</h2>
      <p class="view-subtitle">Gestion de compte et assistance client 24/7</p>
    </div>

    <!-- Carte Profil -->
    <div class="profile-card">
      <div class="avatar-circle">
        {{ (state.user.name || 'BF').slice(0, 2).toUpperCase() }}
      </div>
      <div class="user-meta">
        <h3 class="user-name">{{ state.user.name || 'Utilisateur Boostify' }}</h3>
        <span class="user-phone">{{ state.user.phone || 'Non renseigné' }}</span>
        <span class="user-email">{{ state.user.email }}</span>
      </div>
    </div>

    <!-- Carte PWA Application Mobile -->
    <div v-if="!isStandalone" class="pwa-profile-card">
      <div class="pwa-profile-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
        </svg>
      </div>
      <div class="pwa-profile-info">
        <h4>Application Mobile & Web</h4>
        <p>Installez Boostify sur votre écran d'accueil pour un accès ultra-rapide et plein écran.</p>
      </div>
      <button class="btn-install-profile" @click="installPwa">
        Installer l'App
      </button>
    </div>

    <!-- Assistance WhatsApp Directe -->
    <div class="support-action-card">
      <div class="support-icon">💬</div>
      <div class="support-text">
        <h4>Besoin d'aide avec une commande ?</h4>
        <p>Notre équipe locale est disponible sur WhatsApp 7j/7 pour vous assister.</p>
      </div>
      <button class="btn-whatsapp" @click="openWhatsAppSupport">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        Contacter sur WhatsApp
      </button>
    </div>

    <!-- Centre d'aide (FAQ) -->
    <div class="faq-section">
      <h3 class="section-title">Questions fréquentes (FAQ)</h3>
      <div class="faq-list">
        <div
          v-for="(item, idx) in faqs"
          :key="idx"
          class="faq-item"
          :class="{ open: activeFaq === idx }"
          @click="toggleFaq(idx)"
        >
          <div class="faq-question">
            <span>{{ item.q }}</span>
            <span class="faq-arrow">{{ activeFaq === idx ? '−' : '+' }}</span>
          </div>
          <div v-if="activeFaq === idx" class="faq-answer">
            {{ item.a }}
          </div>
        </div>
      </div>
    </div>

    <!-- Section Politique & Documents Légaux -->
    <div class="legal-section-card">
      <div class="legal-text">
        <h4>Politique de Service & CGU</h4>
        <p>Consultez les 7 articles officiels régissant vos commandes et vos garanties.</p>
      </div>
      <button class="btn-open-policy" @click="state.activeTab = 'policy'">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
        </svg>
        Consulter les 7 Articles
      </button>
    </div>

    <!-- Actions du Compte -->
    <div class="account-actions">
      <button class="btn-logout" @click="handleLogout">
        Se déconnecter
      </button>
      <button class="btn-delete-account" @click="confirmDeleteAccount">
        Demander la suppression de mon compte
      </button>
    </div>
  </div>
</template>

<style scoped>
.profile-view {
  display: flex;
  flex-direction: column;
  gap: 18px;
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

.profile-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 18px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.avatar-circle {
  width: 54px;
  height: 54px;
  border-radius: 50%;
  background: linear-gradient(135deg, #059669, #0f766e);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  font-weight: 800;
  color: #ffffff;
  box-shadow: 0 4px 14px rgba(5, 150, 105, 0.4);
}

.user-meta {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 1.15rem;
  font-weight: 800;
  color: #ffffff;
}

.user-phone {
  font-size: 0.85rem;
  color: #10b981;
  font-weight: 600;
}

.user-email {
  font-size: 0.8rem;
  color: var(--text-muted);
}

/* Carte PWA Profil */
.pwa-profile-card {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(6, 78, 59, 0.25));
  border: 1px solid rgba(16, 185, 129, 0.35);
  border-radius: var(--radius-lg);
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.pwa-profile-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, #059669, #10b981);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.4);
}

.pwa-profile-icon svg {
  width: 24px;
  height: 24px;
}

.pwa-profile-info h4 {
  font-size: 1.05rem;
  font-weight: 800;
  color: #ffffff;
}

.pwa-profile-info p {
  font-size: 0.8rem;
  color: #d1fae5;
  margin-top: 2px;
  line-height: 1.4;
}

.btn-install-profile {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: linear-gradient(135deg, #059669, #10b981);
  color: #ffffff;
  border: none;
  font-weight: 800;
  padding: 12px 18px;
  border-radius: var(--radius-md);
  font-size: 0.95rem;
  min-height: 48px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35);
}

.btn-install-profile:hover, .btn-install-profile:active {
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(16, 185, 129, 0.5);
}

/* Support WhatsApp */
.support-action-card {
  background: linear-gradient(135deg, rgba(37, 211, 102, 0.12), rgba(18, 140, 126, 0.2));
  border: 1px solid rgba(37, 211, 102, 0.35);
  border-radius: var(--radius-lg);
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.support-icon {
  font-size: 1.6rem;
}

.support-text h4 {
  font-size: 1.05rem;
  font-weight: 800;
  color: #ffffff;
}

.support-text p {
  font-size: 0.8rem;
  color: #d1fae5;
  margin-top: 2px;
}

.btn-whatsapp {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #25d366;
  color: #ffffff;
  font-weight: 800;
  padding: 12px 18px;
  border-radius: var(--radius-md);
  font-size: 0.95rem;
  min-height: 48px;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(37, 211, 102, 0.3);
}

.btn-whatsapp:hover, .btn-whatsapp:active {
  background: #20ba5a;
  transform: translateY(-1px);
}

.btn-whatsapp svg {
  width: 20px;
  height: 20px;
}

/* FAQ */
.faq-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 800;
  color: #ffffff;
}

.faq-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.faq-item {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  padding: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.faq-question {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  font-weight: 700;
  color: #ffffff;
}

.faq-arrow {
  font-size: 1.2rem;
  color: #10b981;
  font-weight: 700;
}

.faq-answer {
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.legal-section-card {
  background: var(--bg-surface);
  border: 1px solid rgba(16, 185, 129, 0.25);
  border-radius: var(--radius-md);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.legal-text h4 {
  font-size: 0.95rem;
  font-weight: 700;
  color: #ffffff;
}

.legal-text p {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-top: 2px;
}

.btn-open-policy {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: var(--bg-surface-elevated);
  border: 1px solid var(--border-color);
  color: #10b981;
  font-weight: 700;
  padding: 10px 14px;
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  min-height: 44px;
  transition: all 0.2s;
}

.btn-open-policy:hover, .btn-open-policy:active {
  background: rgba(16, 185, 129, 0.15);
  border-color: #10b981;
}

.btn-open-policy svg {
  width: 16px;
  height: 16px;
}

.account-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
}

.btn-logout {
  width: 100%;
  background: var(--bg-surface-elevated);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  font-weight: 700;
  padding: 12px;
  border-radius: var(--radius-md);
  font-size: 0.9rem;
  min-height: 44px;
  transition: all 0.2s;
}

.btn-logout:hover {
  background: rgba(239, 68, 68, 0.12);
  color: var(--color-danger);
  border-color: rgba(239, 68, 68, 0.3);
}

.btn-delete-account {
  background: transparent;
  color: var(--color-danger);
  font-size: 0.8rem;
  text-decoration: underline;
  padding: 8px;
}
</style>
