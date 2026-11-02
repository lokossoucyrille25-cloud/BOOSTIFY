import { ref } from 'vue';
import { showToast } from './api';

// État réactif global pour la PWA
export const isStandalone = ref<boolean>(false);
export const canInstall = ref<boolean>(false);
export const isIOS = ref<boolean>(false);
export const isOnline = ref<boolean>(navigator.onLine);
export const showIosInstructions = ref<boolean>(false);

let deferredPrompt: any = null;

export function initPwa(): void {
  // 1. Détection mode Standalone (déjà installé comme application)
  const isDisplayStandalone = window.matchMedia('(display-mode: standalone)').matches;
  const isNavStandalone = (navigator as any).standalone === true;
  isStandalone.value = isDisplayStandalone || isNavStandalone;

  // 2. Détection iOS Safari
  const userAgent = window.navigator.userAgent.toLowerCase();
  const isApple = /iphone|ipad|ipod/.test(userAgent);
  const isSafari = /safari/.test(userAgent) && !/chrome|crios|fxios/.test(userAgent);
  isIOS.value = isApple && isSafari && !isStandalone.value;

  // 3. Écoute de l'événement d'installation Android/Chrome/Edge/Desktop
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    // Empêche la bannière par défaut du navigateur pour utiliser notre UI sur-mesure
    e.preventDefault();
    deferredPrompt = e;
    canInstall.value = true;
  });

  // 4. Détection quand l'application a été installée avec succès
  window.addEventListener('appinstalled', () => {
    canInstall.value = false;
    deferredPrompt = null;
    isStandalone.value = true;
    showToast('🎉 Application Boostify installée avec succès !', 'success');
  });

  // 5. Surveillance de la connexion réseau en temps réel
  window.addEventListener('online', () => {
    isOnline.value = true;
    showToast('🟢 Connexion internet rétablie.', 'success');
  });

  window.addEventListener('offline', () => {
    isOnline.value = false;
    showToast('⚠️ Vous êtes hors-ligne. Mode consultation actif.', 'error');
  });
}

/**
 * Déclenche l'invite d'installation native
 */
export async function installPwa(): Promise<void> {
  if (deferredPrompt) {
    try {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        console.log('Utilisateur a accepté l\'installation PWA');
      }
      deferredPrompt = null;
      canInstall.value = false;
    } catch (err) {
      console.error('Erreur lors de l\'installation:', err);
    }
  } else if (isIOS.value) {
    showIosInstructions.value = true;
  } else {
    showToast('Pour installer : ouvrez le menu de votre navigateur et appuyez sur "Ajouter à l\'écran d\'accueil".', 'info');
  }
}

