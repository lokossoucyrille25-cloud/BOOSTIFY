<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { state, calculateOrderPrice, submitOrder } from '../services/api';
import type { SocialNetwork, ServiceItem } from '../types/index';

const emit = defineEmits<{
  (e: 'go-wallet'): void;
}>();

const selectedNetwork = ref<SocialNetwork>(state.currentNetwork || 'tiktok');
const selectedServiceId = ref<string>('');
const targetUrl = ref<string>('');
const quantity = ref<number>(1000);
const isSubmitting = ref<boolean>(false);
const urlError = ref<string>('');

// Services disponibles pour le réseau choisi
const availableServices = computed(() => {
  return state.services.filter(s => s.network === selectedNetwork.value && s.is_active);
});

// Service actif sélectionné
const currentService = computed<ServiceItem | undefined>(() => {
  return state.services.find(s => s.id === selectedServiceId.value);
});

// Prix calculé en temps réel (arrondi au franc supérieur)
const computedPrice = computed(() => {
  if (!currentService.value) return 0;
  return calculateOrderPrice(currentService.value, quantity.value);
});

// Solde suffisant ?
const hasEnoughBalance = computed(() => {
  return state.wallet.balance >= computedPrice.value;
});

const missingAmount = computed(() => {
  return Math.max(0, computedPrice.value - state.wallet.balance);
});

// Initialisation ou synchronisation avec le service pré-sélectionné
onMounted(() => {
  if (state.selectedServiceForOrder) {
    selectedNetwork.value = state.selectedServiceForOrder.network;
    selectedServiceId.value = state.selectedServiceForOrder.id;
    quantity.value = Math.max(state.selectedServiceForOrder.min_quantity, 1000);
    state.selectedServiceForOrder = null;
  } else if (availableServices.value.length > 0) {
    selectedServiceId.value = availableServices.value[0].id;
    quantity.value = Math.max(availableServices.value[0].min_quantity, 1000);
  }
});

// Changement de réseau
watch(selectedNetwork, (newNet) => {
  const firstServ = state.services.find(s => s.network === newNet && s.is_active);
  if (firstServ) {
    selectedServiceId.value = firstServ.id;
    quantity.value = Math.max(firstServ.min_quantity, 1000);
  }
});

// Ajustement de la quantité si le service change
watch(currentService, (serv) => {
  if (serv) {
    if (quantity.value < serv.min_quantity) {
      quantity.value = serv.min_quantity;
    } else if (quantity.value > serv.max_quantity) {
      quantity.value = serv.max_quantity;
    }
  }
});

// Placeholder dynamique selon le réseau
const urlPlaceholder = computed(() => {
  switch (selectedNetwork.value) {
    case 'tiktok': return 'https://www.tiktok.com/@votre_profil ou lien vidéo';
    case 'instagram': return 'https://instagram.com/votre_profil ou lien post/reel';
    case 'facebook': return 'https://facebook.com/votre_page ou publication';
    case 'discord': return 'https://discord.gg/invitation_publique';
    default: return 'Collez le lien public ici';
  }
});

// Bouton Coller depuis le presse-papier
async function pasteFromClipboard() {
  try {
    const text = await navigator.clipboard.readText();
    if (text) {
      targetUrl.value = text.trim();
      validateUrl();
    }
  } catch (err) {
    console.log('Presse-papier non accessible directement');
  }
}

// Contrôle du format du lien
function validateUrl(): boolean {
  urlError.value = '';
  const url = targetUrl.value.trim();

  if (!url) {
    urlError.value = 'Le lien public est requis.';
    return false;
  }

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    urlError.value = 'Le lien doit commencer par https://';
    return false;
  }

  return true;
}

// Validation finale de la commande
async function handleOrderSubmit() {
  if (!validateUrl()) return;
  if (!currentService.value) return;

  if (!hasEnoughBalance.value) {
    emit('go-wallet');
    return;
  }

  isSubmitting.value = true;
  try {
    const res = await submitOrder({
      serviceId: currentService.value.id,
      targetUrl: targetUrl.value.trim(),
      quantity: quantity.value
    });

    if (res.success) {
      targetUrl.value = '';
      state.activeTab = 'orders'; // Redirection vers le suivi des commandes
    }
  } catch (err: any) {
    console.error('Erreur commande:', err);
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <div class="order-view">
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

    <div class="order-header">
      <h2 class="view-title">Nouvelle Commande</h2>
      <p class="view-subtitle">Parcours express en 4 étapes simples</p>
    </div>

    <div class="order-layout">
      <!-- Colonne des étapes de configuration -->
      <div class="order-steps-column">
        <!-- Étape 1 : Réseau & Service -->
        <div class="step-card">
          <div class="step-badge">1</div>
          <div class="step-content">
            <label class="step-label">Réseau & Type de service</label>
            
            <!-- Sélecteur rapide réseau -->
            <div class="mini-network-pills">
              <button
                v-for="net in (['tiktok', 'instagram', 'facebook', 'discord'] as SocialNetwork[])"
                :key="net"
                class="mini-pill"
                :class="{ active: selectedNetwork === net }"
                @click="selectedNetwork = net"
              >
                {{ net.toUpperCase() }}
              </button>
            </div>

            <!-- Dropdown de choix du service -->
            <div class="select-wrapper">
              <select v-model="selectedServiceId" class="custom-select">
                <option
                  v-for="serv in availableServices"
                  :key="serv.id"
                  :value="serv.id"
                >
                  {{ serv.name }} ({{ serv.price_per_1000.toLocaleString() }} FCFA / 1000)
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- Étape 2 : Adresse publique de la cible -->
        <div class="step-card">
          <div class="step-badge">2</div>
          <div class="step-content">
            <div class="step-label-row">
              <label class="step-label">Lien public de la cible</label>
              <button class="btn-paste" @click="pasteFromClipboard">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                </svg>
                Coller
              </button>
            </div>

            <div class="input-wrapper" :class="{ 'has-error': urlError }">
              <input
                v-model="targetUrl"
                type="url"
                class="custom-input"
                :placeholder="urlPlaceholder"
                @blur="validateUrl"
              />
            </div>
            <span v-if="urlError" class="error-text">{{ urlError }}</span>
            <span class="helper-text">⚠️ Ne donnez jamais votre mot de passe. Seul le lien public est requis.</span>
          </div>
        </div>

        <!-- Étape 3 : Quantité & Calcul temps réel -->
        <div class="step-card" v-if="currentService">
          <div class="step-badge">3</div>
          <div class="step-content">
            <div class="step-label-row">
              <label class="step-label">Quantité demandée</label>
              <span class="quantity-counter">{{ quantity.toLocaleString() }} unités</span>
            </div>

            <!-- Slider de quantité -->
            <input
              v-model.number="quantity"
              type="range"
              class="custom-range"
              :min="currentService.min_quantity"
              :max="currentService.max_quantity"
              :step="currentService.min_quantity >= 500 ? 100 : 50"
            />

            <!-- Raccourcis de quantité rapide -->
            <div class="preset-chips">
              <button class="chip" @click="quantity = currentService.min_quantity">Min ({{ currentService.min_quantity }})</button>
              <button class="chip" @click="quantity = 500">+500</button>
              <button class="chip" @click="quantity = 1000">+1 000</button>
              <button class="chip" @click="quantity = 5000">+5 000</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Colonne Récapitulatif et Validation (Sticky sur Desktop) -->
      <div class="order-summary-column" v-if="currentService">
        <div class="summary-card">
          <div class="summary-row">
            <span class="summary-label">Service sélectionné</span>
            <span class="summary-val">{{ currentService.name }}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">Quantité</span>
            <span class="summary-val">{{ quantity.toLocaleString() }}</span>
          </div>
          <div class="summary-divider"></div>
          <div class="summary-total-row">
            <div class="total-label-box">
              <span class="total-title">Total à payer</span>
              <span class="total-subtitle">Débité de votre solde</span>
            </div>
            <div class="total-price">
              {{ computedPrice.toLocaleString() }} <small>FCFA</small>
            </div>
          </div>

          <!-- Alerte solde insuffisant -->
          <div v-if="!hasEnoughBalance" class="balance-warning">
            <div class="warning-icon">⚠️</div>
            <div class="warning-text">
              <strong>Solde insuffisant</strong>
              <span>Il vous manque {{ missingAmount.toLocaleString() }} FCFA. Rechargez pour continuer.</span>
            </div>
            <button class="btn-warning-recharge" @click="$emit('go-wallet')">
              Recharger
            </button>
          </div>

          <!-- Bouton d'action principal -->
          <button
            v-if="hasEnoughBalance"
            class="btn-submit-order"
            :disabled="isSubmitting"
            @click="handleOrderSubmit"
          >
            <span v-if="!isSubmitting">Confirmer et Commander ({{ computedPrice.toLocaleString() }} FCFA)</span>
            <span v-else>Traitement de votre commande...</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.order-view {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.order-layout {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.order-steps-column {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

@media (min-width: 900px) {
  .order-layout {
    display: grid;
    grid-template-columns: 1.15fr 0.85fr;
    gap: 28px;
    align-items: flex-start;
  }

  .order-summary-column {
    position: sticky;
    top: 84px;
  }
}

.order-header {
  margin-bottom: 4px;
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

.step-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 16px;
  display: flex;
  gap: 14px;
  align-items: flex-start;
}

.step-badge {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid #10b981;
  color: #10b981;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 0.85rem;
  flex-shrink: 0;
}

.step-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.step-label {
  font-size: 0.85rem;
  font-weight: 700;
  color: #ffffff;
}

.step-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.mini-network-pills {
  display: flex;
  gap: 6px;
  overflow-x: auto;
}

.mini-pill {
  flex: 1;
  padding: 8px 4px;
  font-size: 0.7rem;
  font-weight: 700;
  border-radius: var(--radius-sm);
  background: var(--bg-surface-elevated);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
  transition: all 0.2s ease;
  min-height: 44px;
}

.mini-pill.active {
  background: #059669;
  color: #ffffff;
  border-color: #10b981;
}

.custom-select {
  width: 100%;
  padding: 12px 14px;
  background: var(--bg-surface-elevated);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  color: #ffffff;
  font-size: 0.9rem;
  font-weight: 600;
  min-height: 44px;
}

.btn-paste {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  font-weight: 700;
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
  padding: 6px 10px;
  border-radius: var(--radius-full);
  min-height: 36px;
}

.btn-paste svg {
  width: 14px;
  height: 14px;
}

.input-wrapper {
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-color);
  overflow: hidden;
  transition: border-color 0.2s;
}

.input-wrapper.has-error {
  border-color: var(--color-danger);
}

.custom-input {
  width: 100%;
  padding: 12px 14px;
  background: var(--bg-surface-elevated);
  border: none;
  color: #ffffff;
  font-size: 0.9rem;
}

.error-text {
  font-size: 0.75rem;
  color: var(--color-danger);
}

.helper-text {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.quantity-counter {
  font-size: 0.95rem;
  font-weight: 800;
  color: #10b981;
}

.custom-range {
  width: 100%;
  accent-color: #10b981;
  height: 6px;
  border-radius: 4px;
  margin: 6px 0;
  cursor: pointer;
}

.preset-chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.chip {
  padding: 6px 12px;
  background: var(--bg-surface-elevated);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-secondary);
  transition: all 0.2s ease;
  min-height: 44px;
}

.chip:hover, .chip:active {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
  border-color: #10b981;
}

/* Récapitulatif */
.summary-card {
  background: linear-gradient(180deg, var(--bg-surface), rgba(15, 23, 42, 0.95));
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: var(--radius-lg);
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
}

.summary-label {
  color: var(--text-secondary);
}

.summary-val {
  font-weight: 700;
  color: #ffffff;
}

.summary-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.08);
  margin: 4px 0;
}

.summary-total-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.total-title {
  font-size: 1rem;
  font-weight: 800;
  color: #ffffff;
  display: block;
}

.total-subtitle {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.total-price {
  font-size: 1.5rem;
  font-weight: 800;
  color: #10b981;
}

.total-price small {
  font-size: 0.8rem;
}

.balance-warning {
  background: rgba(245, 158, 11, 0.12);
  border: 1px solid rgba(245, 158, 11, 0.35);
  border-radius: var(--radius-md);
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 6px;
}

.warning-icon {
  font-size: 1.25rem;
}

.warning-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  font-size: 0.8rem;
  color: #fef3c7;
}

.btn-warning-recharge {
  background: #f59e0b;
  color: #000000;
  font-weight: 800;
  padding: 8px 14px;
  border-radius: var(--radius-sm);
  font-size: 0.8rem;
  min-height: 44px;
}

.btn-submit-order {
  width: 100%;
  background: linear-gradient(135deg, #059669, #10b981);
  color: #ffffff;
  font-weight: 800;
  padding: 14px 16px;
  border-radius: var(--radius-md);
  font-size: 1rem;
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.35);
  transition: all 0.2s ease;
  min-height: 48px;
  margin-top: 6px;
}

.btn-submit-order:hover, .btn-submit-order:active {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.5);
}
</style>
