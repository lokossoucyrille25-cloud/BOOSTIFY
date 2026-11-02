import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import { initAuth } from './services/api';

// Initialisation de la session Supabase et du catalogue en direct
initAuth();

// Enregistrement du Service Worker PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('✅ Service Worker Boostify PWA actif:', reg.scope);
      })
      .catch((err) => {
        console.warn('⚠️ Échec enregistrement Service Worker:', err);
      });
  });
}

createApp(App).mount('#app');
