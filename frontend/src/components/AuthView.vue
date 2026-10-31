<script setup lang="ts">
import { ref, computed } from 'vue';
import { state, registerUser, loginUser, showToast } from '../services/api';

const emit = defineEmits<{
  (e: 'view-policy'): void;
  (e: 'back-home'): void;
}>();

const mode = computed<'register' | 'login'>({
  get: () => state.authMode,
  set: (val: 'register' | 'login') => {
    state.authMode = val;
    errorMessage.value = '';
  }
});

function goToHome() {
  state.activeTab = 'home';
  emit('back-home');
}

// Champs Inscription - Sans aucune fausse valeur mockée
const regFullName = ref('');
const regCountryCode = ref('+229');
const regPhone = ref('');
const regEmail = ref('');
const regPassword = ref('');
const regPasswordConfirm = ref('');
const regTermsAccepted = ref(false);

// Champs Connexion
const loginIdentifier = ref('');
const loginPassword = ref('');
const loginPrivacyAccepted = ref(false);

// État de chargement et message d'erreur
const isSubmitting = ref(false);
const errorMessage = ref('');

// Indicateur en direct pour la confirmation du mot de passe
const passwordMatchStatus = computed(() => {
  if (!regPasswordConfirm.value) return null;
  if (regPassword.value === regPasswordConfirm.value) {
    return { matches: true, text: '✓ Les mots de passe sont identiques' };
  }
  return { matches: false, text: '⚠️ Les mots de passe ne correspondent pas' };
});

// Traitement Inscription réelle via Supabase
async function handleRegister() {
  errorMessage.value = '';

  // 1. Validations pas à pas avec messages clairs
  const name = regFullName.value.trim();
  if (!name || name.length < 2) {
    errorMessage.value = 'Veuillez saisir votre nom complet ou de marque (au moins 2 caractères).';
    showToast(errorMessage.value, 'error');
    return;
  }

  const phone = regPhone.value.trim();
  if (!phone || phone.length < 6) {
    errorMessage.value = 'Veuillez saisir un numéro de téléphone WhatsApp valide.';
    showToast(errorMessage.value, 'error');
    return;
  }

  const email = regEmail.value.trim();
  if (!email || !email.includes('@') || !email.includes('.')) {
    errorMessage.value = 'Veuillez saisir une adresse e-mail valide.';
    showToast(errorMessage.value, 'error');
    return;
  }

  if (!regPassword.value || regPassword.value.length < 6) {
    errorMessage.value = 'Le mot de passe doit comporter au moins 6 caractères.';
    showToast(errorMessage.value, 'error');
    return;
  }

  if (regPassword.value !== regPasswordConfirm.value) {
    errorMessage.value = 'Les deux mots de passe ne correspondent pas.';
    showToast(errorMessage.value, 'error');
    return;
  }

  if (!regTermsAccepted.value) {
    errorMessage.value = "Veuillez cocher la case d'acceptation des Conditions Générales d'Utilisation.";
    showToast(errorMessage.value, 'error');
    return;
  }

  // 2. Appel réel à Supabase Auth
  isSubmitting.value = true;
  try {
    const result = await registerUser({
      name,
      phone,
      phoneCountryCode: regCountryCode.value,
      email,
      password: regPassword.value
    });

    if (!result.success) {
      errorMessage.value = result.message;
      showToast(result.message, 'error');
    }
  } finally {
    isSubmitting.value = false;
  }
}

// Traitement Connexion réelle via Supabase
async function handleLogin() {
  errorMessage.value = '';

  const email = loginIdentifier.value.trim();
  if (!email || !email.includes('@')) {
    errorMessage.value = 'Veuillez saisir une adresse e-mail valide.';
    showToast(errorMessage.value, 'error');
    return;
  }

  if (!loginPassword.value) {
    errorMessage.value = 'Veuillez saisir votre mot de passe.';
    showToast(errorMessage.value, 'error');
    return;
  }

  if (!loginPrivacyAccepted.value) {
    errorMessage.value = "Veuillez cocher la case d'acceptation de la politique de confidentialité.";
    showToast(errorMessage.value, 'error');
    return;
  }

  isSubmitting.value = true;
  try {
    const result = await loginUser({
      email,
      password: loginPassword.value
    });

    if (!result.success) {
      errorMessage.value = result.message;
      showToast(result.message, 'error');
    }
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <div class="auth-view">
    <!-- Barre de retour vers la page d'accueil -->
    <div class="page-nav-bar auth-navigation-bar">
      <button type="button" class="btn-back-nav" @click="goToHome">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        <span>Retour à l'accueil</span>
      </button>
    </div>

    <!-- En-tête de marque -->
    <div class="auth-brand">
      <div class="brand-logo">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
        </svg>
      </div>
      <h1 class="brand-name">Boostify</h1>
      <p class="brand-tagline">Croissance d'audience par Mobile Money en Afrique de l'Ouest</p>
    </div>

    <!-- Sélecteur d'onglet Inscription / Connexion -->
    <div class="auth-card">
      <div class="auth-tabs">
        <button
          type="button"
          class="auth-tab"
          :class="{ active: mode === 'register' }"
          @click="mode = 'register'"
        >
          Inscription
        </button>
        <button
          type="button"
          class="auth-tab"
          :class="{ active: mode === 'login' }"
          @click="mode = 'login'"
        >
          Connexion
        </button>
      </div>

      <!-- Message d'erreur visible si présent -->
      <div v-if="errorMessage" class="auth-error-alert">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <span>{{ errorMessage }}</span>
      </div>

      <!-- FORMULAIRE INSCRIPTION -->
      <form v-if="mode === 'register'" class="auth-form" @submit.prevent="handleRegister">
        <div class="form-group">
          <label class="form-label">Nom complet ou nom de marque</label>
          <input
            v-model="regFullName"
            type="text"
            required
            class="form-input"
            placeholder="Ex: Mensah ou Ma Boutique"
            autocomplete="name"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Numéro WhatsApp (avec indicatif pays)</label>
          <div class="phone-row">
            <select v-model="regCountryCode" class="country-select">
              <option value="+229">🇧🇯 Bénin (+229)</option>
              <option value="+225">🇨🇮 Côte d'Ivoire (+225)</option>
              <option value="+221">🇸🇳 Sénégal (+221)</option>
              <option value="+228">🇹🇬 Togo (+228)</option>
            </select>
            <input
              v-model="regPhone"
              type="tel"
              required
              class="form-input phone-input"
              placeholder="01 59 29 91 98"
              autocomplete="tel"
            />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Adresse e-mail</label>
          <input
            v-model="regEmail"
            type="email"
            required
            class="form-input"
            placeholder="votre.email@gmail.com"
            autocomplete="email"
          />
        </div>

        <div class="form-row">
          <div class="form-group half">
            <label class="form-label">Mot de passe</label>
            <input
              v-model="regPassword"
              type="password"
              required
              class="form-input"
              placeholder="••••••••"
              autocomplete="new-password"
            />
          </div>
          <div class="form-group half">
            <label class="form-label">Confirmer</label>
            <input
              v-model="regPasswordConfirm"
              type="password"
              required
              class="form-input"
              :class="{
                'input-mismatch': passwordMatchStatus && !passwordMatchStatus.matches,
                'input-match': passwordMatchStatus && passwordMatchStatus.matches
              }"
              placeholder="••••••••"
              autocomplete="new-password"
            />
          </div>
        </div>

        <!-- Indicateur en direct pour la concordance des mots de passe -->
        <div v-if="passwordMatchStatus" class="password-feedback" :class="{ error: !passwordMatchStatus.matches, success: passwordMatchStatus.matches }">
          {{ passwordMatchStatus.text }}
        </div>

        <!-- Unique case d'acceptation obligatoire des CGU -->
        <div class="single-checkbox-card" :class="{ checked: regTermsAccepted }">
          <label class="single-checkbox-label">
            <input
              type="checkbox"
              v-model="regTermsAccepted"
              class="rule-input"
            />
            <span class="single-checkbox-text">
              J'ai lu et j'accepte les
              <button type="button" class="btn-link-policy" @click.stop="$emit('view-policy')">
                Conditions Générales d'Utilisation et la Politique
              </button>
            </span>
          </label>
        </div>

        <!-- Bouton Créer mon compte : Toujours visible, actif et valorisant -->
        <button
          type="submit"
          class="btn-auth-submit"
          :class="{ 'btn-loading': isSubmitting }"
          :disabled="isSubmitting"
        >
          <span v-if="!isSubmitting">Créer mon compte et Entrer</span>
          <span v-else class="btn-spinner-content">
            <svg class="spinner-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10" stroke-width="3" stroke-dasharray="32" stroke-dashoffset="12"></circle>
            </svg>
            Création du compte en cours...
          </span>
        </button>
      </form>

      <!-- FORMULAIRE CONNEXION -->
      <form v-else class="auth-form" @submit.prevent="handleLogin">
        <div class="form-group">
          <label class="form-label">Adresse e-mail</label>
          <input
            v-model="loginIdentifier"
            type="email"
            required
            class="form-input"
            placeholder="votre.email@gmail.com"
            autocomplete="email"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Mot de passe</label>
          <input
            v-model="loginPassword"
            type="password"
            required
            class="form-input"
            placeholder="••••••••"
            autocomplete="current-password"
          />
        </div>

        <!-- Unique case pour la connexion -->
        <div class="single-checkbox-card" :class="{ checked: loginPrivacyAccepted }">
          <label class="single-checkbox-label">
            <input
              type="checkbox"
              v-model="loginPrivacyAccepted"
              class="rule-input"
            />
            <span class="single-checkbox-text">
              J'ai lu et j'accepte l'intégralité de la
              <button type="button" class="btn-link-policy" @click.stop="$emit('view-policy')">
                politique de confidentialité
              </button>
            </span>
          </label>
        </div>

        <!-- Bouton Se connecter : Toujours visible et actif -->
        <button
          type="submit"
          class="btn-auth-submit"
          :class="{ 'btn-loading': isSubmitting }"
          :disabled="isSubmitting"
        >
          <span v-if="!isSubmitting">Se connecter et Entrer</span>
          <span v-else class="btn-spinner-content">
            <svg class="spinner-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10" stroke-width="3" stroke-dasharray="32" stroke-dashoffset="12"></circle>
            </svg>
            Connexion en cours...
          </span>
        </button>
      </form>
    </div>

    <!-- Lien vers la page dédiée de la politique -->
    <div class="auth-footer-policy">
      <button type="button" class="btn-policy-standalone" @click="$emit('view-policy')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
        Consulter la page complète des Articles de la Politique
      </button>
    </div>
  </div>
</template>

<style scoped>
.auth-view {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 480px;
  margin: 6px auto;
}

.auth-navigation-bar {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.auth-brand {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.brand-logo {
  width: 50px;
  height: 50px;
  border-radius: 16px;
  background: linear-gradient(135deg, #059669, #0f766e);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  box-shadow: 0 8px 24px rgba(5, 150, 105, 0.45);
}

.brand-logo svg {
  width: 28px;
  height: 28px;
}

.brand-name {
  font-size: 1.8rem;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: -0.5px;
}

.brand-tagline {
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.4;
}

.auth-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 22px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.auth-tabs {
  display: flex;
  gap: 6px;
  background: var(--bg-surface-elevated);
  padding: 4px;
  border-radius: var(--radius-md);
  margin-bottom: 20px;
}

.auth-tab {
  flex: 1;
  padding: 10px;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text-secondary);
  font-weight: 700;
  font-size: 0.95rem;
  transition: all 0.2s;
  min-height: 44px;
}

.auth-tab.active {
  background: #059669;
  color: #ffffff;
  box-shadow: 0 2px 10px rgba(5, 150, 105, 0.35);
}

.auth-error-alert {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.4);
  color: #fca5a5;
  padding: 10px 14px;
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 16px;
}

.auth-error-alert svg {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  color: #ef4444;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-row {
  display: flex;
  gap: 10px;
}

.form-group.half {
  flex: 1;
}

.form-label {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--text-secondary);
}

.form-input {
  background: var(--bg-surface-elevated);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  padding: 12px 14px;
  color: #ffffff;
  font-size: 0.95rem;
  min-height: 46px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-input:focus {
  border-color: #10b981;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
}

.input-mismatch {
  border-color: #ef4444 !important;
}

.input-match {
  border-color: #10b981 !important;
}

.password-feedback {
  font-size: 0.78rem;
  font-weight: 700;
  margin-top: -6px;
  margin-bottom: 2px;
}

.password-feedback.error {
  color: #f87171;
}

.password-feedback.success {
  color: #34d399;
}

.phone-row {
  display: flex;
  gap: 8px;
}

.country-select {
  width: 140px;
  background: var(--bg-surface-elevated);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  padding: 10px 10px;
  color: #ffffff;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  min-height: 46px;
}

.country-select option {
  background: var(--bg-surface);
  color: #ffffff;
}

.phone-input {
  flex: 1;
}

.single-checkbox-card {
  background: rgba(16, 185, 129, 0.05);
  border: 1px solid rgba(16, 185, 129, 0.25);
  border-radius: var(--radius-sm);
  padding: 12px 14px;
  display: flex;
  align-items: center;
  transition: all 0.2s;
}

.single-checkbox-card:hover, .single-checkbox-card.checked {
  background: rgba(16, 185, 129, 0.12);
  border-color: #10b981;
}

.single-checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  cursor: pointer;
  width: 100%;
}

.single-checkbox-text {
  font-size: 0.88rem;
  color: #ffffff;
  font-weight: 600;
  line-height: 1.4;
}

.rule-input {
  width: 20px;
  height: 20px;
  accent-color: #10b981;
  margin-top: 1px;
  flex-shrink: 0;
  cursor: pointer;
}

.btn-link-policy {
  display: inline;
  background: transparent;
  color: #10b981;
  font-weight: 800;
  font-size: 0.85rem;
  text-decoration: underline;
  padding: 0;
  margin-left: 4px;
  cursor: pointer;
}

.btn-link-policy:hover {
  color: #34d399;
}

/* Bouton principal de soumission : Toujours éclatant, net et cliquable */
.btn-auth-submit {
  width: 100%;
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  color: #ffffff !important;
  font-weight: 800;
  padding: 14px 20px;
  border-radius: var(--radius-md);
  font-size: 1.05rem;
  min-height: 50px;
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.45);
  transition: all 0.2s ease-in-out;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  letter-spacing: 0.3px;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.btn-auth-submit:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.6);
  filter: brightness(1.08);
}

.btn-auth-submit:active {
  transform: translateY(1px);
  box-shadow: 0 2px 10px rgba(16, 185, 129, 0.4);
}

.btn-spinner-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.spinner-icon {
  width: 20px;
  height: 20px;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.auth-footer-policy {
  text-align: center;
  margin-top: 8px;
}

.btn-policy-standalone {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  padding: 10px 18px;
  border-radius: var(--radius-full);
  font-size: 0.85rem;
  font-weight: 600;
  transition: all 0.2s;
  min-height: 44px;
  cursor: pointer;
}

.btn-policy-standalone svg {
  width: 16px;
  height: 16px;
  color: #10b981;
}

.btn-policy-standalone:hover {
  background: var(--bg-surface-elevated);
  color: #ffffff;
  border-color: #10b981;
}
</style>
