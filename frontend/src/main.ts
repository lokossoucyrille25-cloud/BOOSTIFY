import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import { initAuth } from './services/api';

// Initialisation de la session Supabase et du catalogue en direct
initAuth();

createApp(App).mount('#app');
