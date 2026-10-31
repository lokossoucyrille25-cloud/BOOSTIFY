<script setup lang="ts">
import { ref, computed } from 'vue';
import { state, showToast, submitOrder } from '../services/api';
import type { OrderItem } from '../types/index';

const currentFilter = ref<string>('all');

const filterOptions = [
  { id: 'all', label: 'Toutes' },
  { id: 'processing', label: 'En cours' },
  { id: 'completed', label: 'Terminé' },
  { id: 'partial', label: 'Partiel' },
  { id: 'canceled', label: 'Annulé' }
];

const filteredOrders = computed(() => {
  if (currentFilter.value === 'all') return state.orders;
  return state.orders.filter(o => o.status === currentFilter.value);
});

function getStatusBadge(status: string) {
  switch (status) {
    case 'completed': return { text: 'Terminé', class: 'status-completed' };
    case 'processing': return { text: 'En cours', class: 'status-processing' };
    case 'pending': return { text: 'En attente', class: 'status-pending' };
    case 'partial': return { text: 'Partiel', class: 'status-partial' };
    case 'canceled': return { text: 'Annulé', class: 'status-canceled' };
    default: return { text: status, class: '' };
  }
}

// Fonction Recommander (Répéter la commande en 1 clic selon le cahier des charges)
async function repeatOrder(order: OrderItem) {
  const service = state.services.find(s => s.id === order.service_id);
  if (!service) {
    showToast('Le service n\'est plus disponible.', 'error');
    return;
  }

  const res = await submitOrder({
    serviceId: order.service_id,
    targetUrl: order.target_url,
    quantity: order.quantity
  });

  if (res.success) {
    showToast(`Commande renouvelée pour ${order.target_url}`, 'success');
  }
}
</script>

<template>
  <div class="orders-view">
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

    <div class="orders-header">
      <h2 class="view-title">Mes Commandes</h2>
      <p class="view-subtitle">Suivi en direct de vos livraisons</p>
    </div>

    <!-- Filtres de statut -->
    <div class="filters-bar">
      <button
        v-for="opt in filterOptions"
        :key="opt.id"
        class="filter-pill"
        :class="{ active: currentFilter === opt.id }"
        @click="currentFilter = opt.id"
      >
        {{ opt.label }}
      </button>
    </div>

    <!-- Liste des commandes -->
    <div v-if="filteredOrders.length > 0" class="orders-list">
      <div
        v-for="order in filteredOrders"
        :key="order.id"
        class="order-item-card"
      >
        <div class="order-card-header">
          <div class="order-id-block">
            <span class="order-id">#{{ order.id }}</span>
            <span class="order-date">{{ order.created_at }}</span>
          </div>
          <span class="status-badge" :class="getStatusBadge(order.status).class">
            {{ getStatusBadge(order.status).text }}
          </span>
        </div>

        <div class="order-card-body">
          <div class="order-service-title">{{ order.service_name }}</div>
          <a :href="order.target_url" target="_blank" rel="noopener noreferrer" class="order-target-link">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
            </svg>
            <span>{{ order.target_url }}</span>
          </a>

          <!-- Barre de progression de livraison -->
          <div class="progress-wrap">
            <div class="progress-header">
              <span>Livrés : {{ order.delivered_quantity.toLocaleString() }} / {{ order.quantity.toLocaleString() }}</span>
              <span>{{ Math.round((order.delivered_quantity / order.quantity) * 100) }}%</span>
            </div>
            <div class="progress-bar">
              <div
                class="progress-fill"
                :style="{ width: `${Math.min(100, Math.round((order.delivered_quantity / order.quantity) * 100))}%` }"
              ></div>
            </div>
          </div>
        </div>

        <div class="order-card-footer">
          <div class="order-amount">
            {{ order.amount.toLocaleString() }} <small>FCFA</small>
          </div>
          <!-- Bouton Recommander prévu au cahier des charges -->
          <button class="btn-reorder" @click="repeatOrder(order)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="23 4 23 10 17 10"></polyline>
              <polyline points="1 20 1 14 7 14"></polyline>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
            </svg>
            Recommander
          </button>
        </div>
      </div>
    </div>

    <!-- État vide -->
    <div v-else class="empty-state">
      <div class="empty-icon">📦</div>
      <h4>Aucune commande trouvée</h4>
      <p>Passez votre première commande pour booster votre visibilité.</p>
      <button class="btn-empty-order" @click="state.activeTab = 'order'">
        Commander maintenant
      </button>
    </div>
  </div>
</template>

<style scoped>
.orders-view {
  display: flex;
  flex-direction: column;
  gap: 16px;
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

.filters-bar {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.filters-bar::-webkit-scrollbar {
  display: none;
}

.filter-pill {
  padding: 8px 14px;
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-full);
  color: var(--text-secondary);
  font-size: 0.8rem;
  font-weight: 700;
  white-space: nowrap;
  transition: all 0.2s;
  min-height: 44px;
}

.filter-pill.active {
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
  border-color: #10b981;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.order-item-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.order-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.order-id-block {
  display: flex;
  align-items: center;
  gap: 8px;
}

.order-id {
  font-size: 0.95rem;
  font-weight: 800;
  color: #ffffff;
}

.order-date {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.status-badge {
  font-size: 0.75rem;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: var(--radius-full);
}

.status-completed {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
}

.status-processing {
  background: rgba(59, 130, 246, 0.15);
  color: #3b82f6;
}

.status-pending {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
}

.status-partial {
  background: rgba(168, 85, 247, 0.15);
  color: #a855f7;
}

.status-canceled {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

.order-service-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: #ffffff;
}

.order-target-link {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: #10b981;
  text-decoration: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-top: 4px;
}

.order-target-link svg {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

.progress-wrap {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 6px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: var(--bg-surface-elevated);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #059669, #10b981);
  border-radius: var(--radius-full);
  transition: width 0.3s ease;
}

.order-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.order-amount {
  font-size: 1.1rem;
  font-weight: 800;
  color: #ffffff;
}

.order-amount small {
  font-size: 0.75rem;
  color: #10b981;
}

.btn-reorder {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--bg-surface-elevated);
  border: 1px solid var(--border-color);
  color: #ffffff;
  padding: 8px 14px;
  border-radius: var(--radius-sm);
  font-size: 0.8rem;
  font-weight: 700;
  transition: all 0.2s;
  min-height: 44px;
}

.btn-reorder:hover, .btn-reorder:active {
  background: rgba(16, 185, 129, 0.15);
  border-color: #10b981;
  color: #10b981;
}

.btn-reorder svg {
  width: 14px;
  height: 14px;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  background: var(--bg-surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.empty-icon {
  font-size: 3rem;
}

.empty-state h4 {
  font-size: 1.15rem;
  color: #ffffff;
}

.empty-state p {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.btn-empty-order {
  background: #059669;
  color: #ffffff;
  font-weight: 800;
  padding: 12px 24px;
  border-radius: var(--radius-md);
  margin-top: 10px;
  min-height: 44px;
}
</style>
