<script setup lang="ts">
import { POLICY_ARTICLES, CORE_RULES } from '../services/api';

defineEmits<{
  (e: 'back'): void;
}>();

function scrollToArticle(index: number) {
  const el = document.getElementById(`article-${index}`);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
</script>

<template>
  <div class="policy-page">
    <!-- En-tête de la page Politique -->
    <div class="policy-header">
      <button class="btn-back-nav btn-back" @click="$emit('back')" title="Retour">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        <span>Retour</span>
      </button>
      <div class="header-titles">
        <span class="policy-tag">DOCUMENT OFFICIEL OBLIGATOIRE</span>
        <h1 class="policy-main-title">Politique de Service, Règles & CGU</h1>
        <p class="policy-subtitle">
          Conditions Générales d'Utilisation régissant la plateforme Boostify en Afrique de l'Ouest.
          <br /><small>Dernière mise à jour : 25 Octobre 2026 • Version 1.0</small>
        </p>
      </div>
    </div>

    <!-- SECTION 1 : LES 7 RÈGLES FONDAMENTALES DE BOOSTIFY -->
    <section class="core-rules-section">
      <div class="rules-card-header">
        <div class="rules-title-row">
          <span class="rules-icon">🛡️</span>
          <div>
            <h2 class="rules-section-title">Les 7 Règles Fondamentales</h2>
            <p class="rules-section-subtitle">Principes non négociables encadrant chaque commande et utilisateur</p>
          </div>
        </div>
      </div>

      <div class="rules-grid">
        <div
          v-for="rule in CORE_RULES"
          :key="rule.number"
          class="rule-box"
          @click="scrollToArticle(rule.number)"
        >
          <div class="rule-box-header">
            <span class="rule-box-num">RÈGLE {{ rule.number }}</span>
            <span class="rule-link-text">Voir Art. {{ rule.number }} →</span>
          </div>
          <h3 class="rule-box-title">{{ rule.title }}</h3>
          <p class="rule-box-desc">{{ rule.shortDescription }}</p>
        </div>
      </div>
    </section>

    <!-- SECTION 2 : SOMMAIRE DES ARTICLES -->
    <div class="articles-index">
      <span class="index-title">Accès direct aux Articles juridiques :</span>
      <div class="index-chips">
        <button
          v-for="art in POLICY_ARTICLES"
          :key="art.number"
          class="index-chip"
          @click="scrollToArticle(art.number)"
        >
          Article {{ art.number }}
        </button>
      </div>
    </div>

    <!-- SECTION 3 : LISTE DES 7 ARTICLES DÉTAILLÉS -->
    <section class="articles-list">
      <article
        v-for="article in POLICY_ARTICLES"
        :key="article.number"
        :id="`article-${article.number}`"
        class="article-card"
      >
        <div class="article-top">
          <div class="article-badge">ARTICLE {{ article.number }}</div>
          <span class="article-summary-pill">{{ article.summary }}</span>
        </div>

        <h2 class="article-title">{{ article.title }}</h2>

        <div class="article-content">
          <p
            v-for="(paragraph, pIdx) in article.content"
            :key="pIdx"
            class="article-paragraph"
          >
            {{ paragraph }}
          </p>
        </div>
      </article>
    </section>

    <!-- Pied de page de confirmation -->
    <div class="policy-footer">
      <p class="footer-note">
        L'utilisation des services de Boostify implique l'acceptation sans réserve des 7 règles et articles ci-dessus.
      </p>
      <button class="btn-policy-close" @click="$emit('back')">
        J'ai pris connaissance des 7 Règles et Articles
      </button>
    </div>
  </div>
</template>

<style scoped>
.policy-page {
  display: flex;
  flex-direction: column;
  gap: 22px;
  padding-bottom: 24px;
}

.policy-header {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--bg-surface-elevated);
  border: 1px solid var(--border-color);
  color: #10b981;
  padding: 8px 14px;
  border-radius: var(--radius-full);
  font-size: 0.85rem;
  font-weight: 700;
  width: fit-content;
  min-height: 44px;
  transition: all 0.2s;
}

.btn-back svg {
  width: 16px;
  height: 16px;
}

.btn-back:hover, .btn-back:active {
  background: rgba(16, 185, 129, 0.15);
  border-color: #10b981;
}

.header-titles {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.policy-tag {
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 1.2px;
  color: #10b981;
}

.policy-main-title {
  font-size: 1.55rem;
  font-weight: 800;
  color: #ffffff;
  line-height: 1.2;
}

.policy-subtitle {
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.4;
}

.policy-subtitle small {
  font-size: 0.75rem;
  color: var(--text-muted);
}

/* SECTION 1 : LES 7 RÈGLES */
.core-rules-section {
  background: linear-gradient(180deg, rgba(6, 78, 59, 0.35) 0%, rgba(17, 24, 39, 0.85) 100%);
  border: 1px solid rgba(16, 185, 129, 0.35);
  border-radius: var(--radius-lg);
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
}

.rules-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.rules-icon {
  font-size: 1.8rem;
}

.rules-section-title {
  font-size: 1.2rem;
  font-weight: 800;
  color: #ffffff;
}

.rules-section-subtitle {
  font-size: 0.8rem;
  color: #a7f3d0;
}

.rules-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

@media (min-width: 640px) {
  .rules-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
}

.rule-box {
  background: var(--bg-surface-elevated);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.rule-box:hover {
  background: rgba(16, 185, 129, 0.12);
  border-color: #10b981;
  transform: translateY(-1px);
}

.rule-box-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.rule-box-num {
  font-size: 0.7rem;
  font-weight: 800;
  color: #10b981;
  letter-spacing: 0.6px;
}

.rule-link-text {
  font-size: 0.72rem;
  color: var(--text-muted);
  font-weight: 600;
}

.rule-box:hover .rule-link-text {
  color: #10b981;
}

.rule-box-title {
  font-size: 0.95rem;
  font-weight: 800;
  color: #ffffff;
}

.rule-box-desc {
  font-size: 0.82rem;
  color: var(--text-secondary);
  line-height: 1.4;
}

/* Sommaire des articles */
.articles-index {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.index-title {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
}

.index-chips {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.index-chip {
  background: var(--bg-surface-elevated);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 700;
  transition: all 0.2s;
  min-height: 38px;
}

.index-chip:hover, .index-chip:active {
  background: #059669;
  color: #ffffff;
  border-color: #10b981;
}

/* Cartes des Articles */
.articles-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.article-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
  transition: border-color 0.2s;
}

.article-card:hover {
  border-color: rgba(16, 185, 129, 0.4);
}

.article-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
}

.article-badge {
  background: linear-gradient(135deg, #064e3b, #059669);
  color: #ffffff;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.8px;
  padding: 4px 10px;
  border-radius: var(--radius-sm);
}

.article-summary-pill {
  font-size: 0.75rem;
  color: #a7f3d0;
  background: rgba(16, 185, 129, 0.1);
  padding: 3px 8px;
  border-radius: var(--radius-full);
}

.article-title {
  font-size: 1.15rem;
  font-weight: 800;
  color: #ffffff;
  line-height: 1.3;
}

.article-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  padding-top: 12px;
}

.article-paragraph {
  font-size: 0.9rem;
  color: #cbd5e1;
  line-height: 1.6;
}

/* Pied de page */
.policy-footer {
  background: rgba(26, 34, 54, 0.5);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  text-align: center;
}

.footer-note {
  font-size: 0.8rem;
  color: var(--text-secondary);
  line-height: 1.4;
}

.btn-policy-close {
  background: #059669;
  color: #ffffff;
  font-weight: 800;
  padding: 12px 18px;
  border-radius: var(--radius-md);
  font-size: 0.95rem;
  min-height: 44px;
  transition: all 0.2s;
}

.btn-policy-close:hover {
  background: #10b981;
}
</style>
