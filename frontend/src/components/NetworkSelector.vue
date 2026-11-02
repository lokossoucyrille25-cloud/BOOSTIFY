<script setup lang="ts">
import { state } from '../services/api';
import type { SocialNetwork } from '../types/index';

const networks: Array<{
  id: SocialNetwork;
  name: string;
  badge: string;
  color: string;
}> = [
  { id: 'tiktok', name: 'TikTok', badge: 'Tendance', color: '#fe2c55' },
  { id: 'instagram', name: 'Instagram', badge: 'Populaire', color: '#e1306c' },
  { id: 'facebook', name: 'Facebook', badge: 'Pages & Groupes', color: '#1877f2' },
  { id: 'discord', name: 'Discord', badge: 'Communautés', color: '#5865f2' }
];

function selectNetwork(net: SocialNetwork) {
  state.currentNetwork = net;
}
</script>

<template>
  <div class="network-selector-container">
    <div class="network-tabs">
      <button
        v-for="net in networks"
        :key="net.id"
        class="network-tab"
        :class="{ active: state.currentNetwork === net.id }"
        @click="selectNetwork(net.id)"
      >
        <div class="tab-icon" :class="net.id">
          <!-- TikTok Icon -->
          <svg v-if="net.id === 'tiktok'" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.47 6.26 6.26 0 0 0 1.86-4.47V8.78a8.17 8.17 0 0 0 4.91 1.62v-3.71z"/>
          </svg>
          <!-- Instagram Icon -->
          <svg v-else-if="net.id === 'instagram'" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
          <!-- Facebook Icon -->
          <svg v-else-if="net.id === 'facebook'" viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          <!-- Discord Icon -->
          <svg v-else viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
          </svg>
        </div>
        <span class="tab-label">{{ net.name }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.network-selector-container {
  overflow-x: auto;
  padding: 4px 0 16px 0;
  -webkit-overflow-scrolling: touch;
}

.network-selector-container::-webkit-scrollbar {
  display: none;
}

.network-tabs {
  display: flex;
  gap: 10px;
  min-width: 100%;
}

@media (min-width: 768px) {
  .network-tabs {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
  }
}

.network-tab {
  flex: 1;
  min-width: 100px;
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 10px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  min-height: 48px;
}

.network-tab:hover {
  background: var(--bg-surface-elevated);
  transform: translateY(-2px);
}

.network-tab.active {
  background: linear-gradient(180deg, rgba(16, 185, 129, 0.15), rgba(15, 118, 110, 0.25));
  border-color: #10b981;
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.25);
  transform: translateY(-2px);
}

.tab-icon {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.06);
}

.tab-icon svg {
  width: 18px;
  height: 18px;
}

.tab-icon.tiktok { color: #fe2c55; }
.tab-icon.instagram { color: #e1306c; }
.tab-icon.facebook { color: #1877f2; }
.tab-icon.discord { color: #5865f2; }

.tab-label {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-secondary);
}

.network-tab.active .tab-label {
  color: #ffffff;
}
</style>
