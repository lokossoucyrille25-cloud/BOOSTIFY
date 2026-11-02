import { reactive } from 'vue';
import type { ServiceItem, OrderItem, TransactionItem, SocialNetwork, AppTab, PolicyArticle, CoreRule } from '../types/index.js';
import { supabase } from './supabase.js';

export const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || '/api';

// Services initiaux (grille tarifaire officielle du cahier des charges avec Vues TikTok)
export const INITIAL_SERVICES: ServiceItem[] = [
  // TIKTOK
  {
    id: '9fc259c1-1e4a-4dfc-a14c-cb2213720640',
    network: 'tiktok',
    name: 'Vues TikTok',
    category: 'Vues',
    price_per_1000: 700,
    min_quantity: 100,
    max_quantity: 10000000,
    is_active: true,
    is_featured: false,
    description: 'Vues rapides et stables pour booster vos vidéos TikTok en quelques minutes.'
  },
  {
    id: 'd8b9d98a-c56b-4743-9e7f-9c5925b36f23',
    network: 'tiktok',
    name: 'Abonnés TikTok',
    category: 'Abonnés',
    price_per_1000: 3000,
    min_quantity: 100,
    max_quantity: 100000,
    is_active: true,
    is_featured: false,
    description: 'Abonnés réels avec livraison progressive en quelques minutes.'
  },
  {
    id: '8242bd94-7c99-4fe1-8a55-40782347a17d',
    network: 'tiktok',
    name: 'Likes TikTok',
    category: 'Likes',
    price_per_1000: 750,
    min_quantity: 100,
    max_quantity: 50000,
    is_active: true,
    is_featured: false,
    description: 'Boostez vos vidéos TikTok avec des likes instantanés.'
  },
  {
    id: 'd08ab9ea-4c91-4995-b385-4d1fe4e55b7a',
    network: 'tiktok',
    name: 'Commentaires TikTok',
    category: 'Commentaires',
    price_per_1000: 1500,
    min_quantity: 10,
    max_quantity: 5000,
    is_active: true,
    is_featured: false,
    description: 'Commentaires pertinents en français pour stimuler l\'algorithme.'
  },

  // INSTAGRAM
  {
    id: 'a89d3158-6442-46b7-83fc-814bb151af6f',
    network: 'instagram',
    name: 'Abonnés Instagram',
    category: 'Abonnés',
    price_per_1000: 3500,
    min_quantity: 100,
    max_quantity: 100000,
    is_active: true,
    is_featured: false,
    description: 'Croissance rapide de votre profil public ou boutique.'
  },
  {
    id: '24b5fc8b-6ea9-4109-92a0-1d095d640856',
    network: 'instagram',
    name: 'Likes Instagram',
    category: 'Likes',
    price_per_1000: 2300,
    min_quantity: 100,
    max_quantity: 50000,
    is_active: true,
    is_featured: false,
    description: 'Likes de qualité sur vos publications, photos et reels.'
  },
  {
    id: 'bc29a765-ef81-4398-8f6a-6e667f80f2e5',
    network: 'instagram',
    name: 'Commentaires Instagram',
    category: 'Commentaires',
    price_per_1000: 2700,
    min_quantity: 10,
    max_quantity: 5000,
    is_active: true,
    is_featured: false,
    description: 'Commentaires positifs et engageants pour vos posts.'
  },

  // FACEBOOK
  {
    id: 'a6995fe0-f7cb-48bc-962e-c0dd439f2e5d',
    network: 'facebook',
    name: 'Abonnés Page Facebook',
    category: 'Abonnés',
    price_per_1000: 2500,
    min_quantity: 100,
    max_quantity: 100000,
    is_active: true,
    is_featured: false,
    description: 'Abonnés réels pour valoriser votre page commerciale ou profil.'
  },
  {
    id: '74cd2aa7-aff7-418f-a1e1-38a2429cf7b1',
    network: 'facebook',
    name: 'Likes Publications Facebook',
    category: 'Likes',
    price_per_1000: 1700,
    min_quantity: 100,
    max_quantity: 50000,
    is_active: true,
    is_featured: false,
    description: 'Likes sur vos publications, visuels et actualités.'
  },
  {
    id: 'cb942330-1d1a-4bf8-b625-524f22f5e319',
    network: 'facebook',
    name: 'Vues Vidéos Facebook',
    category: 'Vues',
    price_per_1000: 750,
    min_quantity: 500,
    max_quantity: 200000,
    is_active: true,
    is_featured: false,
    description: 'Vues rapides pour vidéos, reels et lives enregistrés.'
  },

  // DISCORD
  {
    id: '3fb641c2-30d0-4732-b64f-e0d2064532d7',
    network: 'discord',
    name: 'Membres Discord',
    category: 'Membres',
    price_per_1000: 4000,
    min_quantity: 50,
    max_quantity: 20000,
    is_active: true,
    is_featured: false,
    description: 'Membres rejoignant votre serveur Discord public.'
  },
  {
    id: '4f01ca81-c85c-4404-9dd2-3ccab123b9ea',
    network: 'discord',
    name: 'Membres en ligne Discord',
    category: 'Membres en ligne',
    price_per_1000: 4500,
    min_quantity: 50,
    max_quantity: 10000,
    is_active: true,
    is_featured: false,
    description: 'Faites paraître votre communauté Discord active en permanence.'
  },

  // PACK VEDETTE
  {
    id: 'b9226b84-94f3-46e6-acdc-b45648e329ed',
    network: 'tiktok',
    name: 'Pack Vedette - 10 000 Abonnés',
    category: 'Pack Spécial',
    price_per_1000: 2000,
    min_quantity: 10000,
    max_quantity: 10000,
    is_active: true,
    is_featured: true,
    description: 'Offre exclusive : Pack 10 000 abonnés à seulement 15 000 FCFA !'
  }
];

// Les 7 Règles Fondamentales de Boostify
export const CORE_RULES: CoreRule[] = [
  {
    number: 1,
    title: "Zéro mot de passe exigé",
    shortDescription: "Boostify ne demande ni ne conserve jamais de mot de passe ou d'accès confidentiel à vos réseaux sociaux. Seule l'URL publique de la cible est nécessaire."
  },
  {
    number: 2,
    title: "Conformité & Risques des réseaux tiers",
    shortDescription: "L'utilisateur reconnaît que les algorithmes et conditions des plateformes (TikTok, Instagram, Facebook, Discord) s'appliquent sans allégation trompeuse de garantie éternelle."
  },
  {
    number: 3,
    title: "Paiement en FCFA par Mobile Money",
    shortDescription: "Recharges sécurisées via Chariow (minimum 600 FCFA). Aucun découvert autorisé : le solde est débité à la commande."
  },
  {
    number: 4,
    title: "Démarrage rapide automatisé",
    shortDescription: "Traitement automatique 24h/24 : plus de 90% des commandes sont engagées en moins de 10 minutes suivant la validation."
  },
  {
    number: 5,
    title: "Remboursement automatique au prorata",
    shortDescription: "Toute commande annulée ou partiellement livrée est automatiquement et immédiatement recréditée au prorata sur le solde du portefeuille."
  },
  {
    number: 6,
    title: "Proscription des contenus illicites",
    shortDescription: "Interdiction formelle de promouvoir des arnaques, escroqueries, contenus haineux, violents ou illégaux sous peine de blocage immédiat du compte."
  },
  {
    number: 7,
    title: "Protection des données & Droit à l'oubli",
    shortDescription: "Les données personnelles (WhatsApp / e-mail) sont strictement protégées et l'utilisateur peut supprimer son compte à tout moment."
  }
];

// Articles officiels de la politique Boostify
export const POLICY_ARTICLES: PolicyArticle[] = [
  {
    number: 1,
    title: "Objet du service et Fourniture automatisée",
    summary: "Boostify est une plateforme de commande automatisée de visibilité d'audience sans accès aux comptes.",
    content: [
      "Boostify met à la disposition des créateurs, commerçants et entreprises d'Afrique de l'Ouest des services de visibilité numérique (abonnés, mentions 'j'aime', vues, commentaires, membres Discord).",
      "Le service repose sur un parcours automatisé en trois étapes : sélection du service, indication de l'URL publique de la cible, et exécution automatisée.",
      "L'utilisateur reconnaît que Boostify agit comme intermédiaire technique de transmission vers des infrastructures automatisées de distribution."
    ]
  },
  {
    number: 2,
    title: "Non-détention de mot de passe & Sécurité absolue",
    summary: "Aucun mot de passe ni identifiant privé ne vous sera jamais demandé.",
    content: [
      "Boostify ne demande, ne collecte et ne stocke JAMAIS les identifiants ou mots de passe de vos comptes de réseaux sociaux.",
      "Seule l'adresse web publique (lien direct du profil, de la page, du canal ou de la publication) est nécessaire pour l'acheminement de la prestation.",
      "Si une personne prétendant représenter Boostify vous demande vos identifiants ou codes secrets, vous devez immédiatement refuser et le signaler au support."
    ]
  },
  {
    number: 3,
    title: "Conformité et Règles des Réseaux Sociaux Tiers",
    summary: "Avertissement sur les conditions d'utilisation des réseaux sociaux (TikTok, Meta, Discord).",
    content: [
      "L'utilisateur reconnaît expressément que l'achat de services d'audience peut enfreindre les conditions d'utilisation définies par les plateformes tierces (TikTok, Instagram, Facebook, Discord).",
      "Boostify ne garantit pas l'immunité contre les ajustements d'algorithmes, suppressions de profils inactifs ou purges périodiques opérées par ces plateformes.",
      "Aucune allégation trompeuse n'est faite : Boostify ne garantit pas que les profils livrés interagissent commercialement avec vos produits.",
      "L'utilisateur assume l'entière responsabilité de l'usage des prestations sur ses canaux publics."
    ]
  },
  {
    number: 4,
    title: "Portefeuille, Paiements Mobile Money & Règles de Solde",
    summary: "Recharges en FCFA par Mobile Money (min. 600 FCFA), crédit sécurisé sur webhook.",
    content: [
      "Toutes les transactions sont libellées et traitées en Francs CFA (FCFA / XOF).",
      "Le rechargement s'effectue via la passerelle certifiée Chariow prenant en charge MTN Mobile Money, Moov Money, Orange Money, Wave et cartes bancaires.",
      "Le solde de l'utilisateur n'est crédité qu'après confirmation cryptographique directe émise par le serveur du prestataire (webhook sécurisé).",
      "Le montant minimum d'une recharge est fixé à 600 FCFA. Aucune commande ne peut être exécutée à découvert ou avec un solde insuffisant."
    ]
  },
  {
    number: 5,
    title: "Politique de Remboursement et Commandes Partielles",
    summary: "Recrédit automatique au prorata sur le portefeuille en cas de commande partielle ou annulée.",
    content: [
      "En cas d'annulation technique d'une commande par le fournisseur de service, l'intégralité du montant débité est immédiatement recréditée sur le portefeuille Boostify.",
      "En cas de livraison partielle, le montant strictement équivalent à la quantité restante non délivrée est calculé et recrédité au prorata au franc près.",
      "Aucun remboursement en espèces ou versement bancaire externe n'est effectué dès lors que la commande a été engagée."
    ]
  },
  {
    number: 6,
    title: "Usages Proscrits et Responsabilité de l'Utilisateur",
    summary: "Interdiction formelle de promouvoir des contenus illicites, haineux ou frauduleux.",
    content: [
      "Il est rigoureusement interdit de passer commande pour des pages, comptes ou publications promouvant des actes criminels, du terrorisme, des escroqueries financières, de la pornographie ou de la diffamation.",
      "Tout compte identifié comme violant cette clause sera bloqué sur-le-champ sans possibilité de restitution de solde, et des signalements pourront être transmis aux autorités compétentes."
    ]
  },
  {
    number: 7,
    title: "Protection des Données Personnelles et Droit à l'Oubli",
    summary: "Données limitées au strict minimum légal avec droit de suppression instantané.",
    content: [
      "Les données personnelles conservées se limitent au nom/marque, numéro WhatsApp et historique transactionnel pour assurer le service client.",
      "Ces informations ne sont ni cédées ni revendues à des tiers.",
      "L'utilisateur dispose d'un droit permanent de suppression de son compte et de l'ensemble de ses données associées, exerçable d'un simple clic depuis l'onglet Profil ou auprès du support."
    ]
  }
];

// État réactif global sans AUCUNE fausse donnée mockée
export const state = reactive({
  user: {
    id: '',
    name: '',
    phone: '',
    email: ''
  },
  isAuthenticated: false,
  hasAcceptedTerms: false,
  wallet: {
    balance: 0,
    currency: 'FCFA'
  },
  services: INITIAL_SERVICES as ServiceItem[],
  orders: [] as OrderItem[],
  transactions: [] as TransactionItem[],
  currentNetwork: 'tiktok' as SocialNetwork,
  activeTab: 'home' as AppTab,
  authMode: 'login' as 'login' | 'register',
  selectedServiceForOrder: null as ServiceItem | null,
  toast: {
    show: false,
    message: '',
    type: 'success' as 'success' | 'error' | 'info'
  }
});

// Toast notification
export function showToast(message: string, type: 'success' | 'error' | 'info' = 'success') {
  state.toast.message = message;
  state.toast.type = type;
  state.toast.show = true;
  setTimeout(() => {
    state.toast.show = false;
  }, 4000);
}

// Navigation vers l'authentification
export function openAuth(mode: 'login' | 'register' = 'login') {
  state.authMode = mode;
  state.activeTab = 'auth';
}

/**
 * Charge la liste des services en direct depuis Supabase / Backend API
 */
export async function loadServices(): Promise<void> {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('is_active', true)
      .order('price_per_1000', { ascending: true });

    if (!error && data && data.length > 0) {
      state.services = data.map((item: any) => ({
        id: item.id,
        network: item.network,
        name: item.name,
        category: item.category,
        price_per_1000: Number(item.price_per_1000),
        min_quantity: item.min_quantity,
        max_quantity: item.max_quantity,
        is_active: item.is_active,
        is_featured: item.is_featured,
        description: item.description || ''
      }));
    }
  } catch (err) {
    console.warn('Utilisation de la grille locale de services:', err);
  }
}

/**
 * Charge le profil de l'utilisateur connecté depuis Supabase
 */
export async function loadUserProfile(userId?: string): Promise<void> {
  try {
    const uid = userId || (await supabase.auth.getUser()).data.user?.id;
    if (!uid) {
      state.isAuthenticated = false;
      state.user = { id: '', name: '', phone: '', email: '' };
      state.wallet.balance = 0;
      state.orders = [];
      state.transactions = [];
      return;
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', uid)
      .maybeSingle();

    if (error) {
      console.error('Erreur lecture profil:', error);
      return;
    }

    if (profile) {
      state.user.id = profile.id;
      state.user.name = profile.full_name || 'Utilisateur';
      state.user.phone = profile.phone || '';
      state.user.email = profile.email || '';
      state.wallet.balance = Number(profile.balance) || 0;
      state.isAuthenticated = true;
      state.hasAcceptedTerms = true;

      // Charger les commandes et transactions réelles de l'utilisateur
      await Promise.all([loadUserOrders(uid), loadUserTransactions(uid)]);
    }
  } catch (err) {
    console.error('Erreur loadUserProfile:', err);
  }
}

/**
 * Charge les vraies commandes de l'utilisateur depuis Supabase
 */
export async function loadUserOrders(userId?: string): Promise<void> {
  try {
    const uid = userId || state.user.id;
    if (!uid) {
      state.orders = [];
      return;
    }

    const { data, error } = await supabase
      .from('orders')
      .select('*, services(name, network)')
      .eq('user_id', uid)
      .order('created_at', { ascending: false });

    if (!error && data) {
      state.orders = data.map((o: any) => ({
        id: o.id.slice(0, 8).toUpperCase(),
        service_id: o.service_id,
        service_name: o.services?.name || 'Service Boostify',
        network: o.services?.network || 'tiktok',
        target_url: o.target_url,
        quantity: o.quantity,
        amount: Number(o.amount),
        status: o.status,
        start_count: o.start_count || 0,
        remains: o.remains || 0,
        delivered_quantity: o.delivered_quantity || 0,
        created_at: new Date(o.created_at).toLocaleString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        })
      }));
    }
  } catch (err) {
    console.error('Erreur loadUserOrders:', err);
  }
}

/**
 * Charge les vraies transactions de l'utilisateur depuis Supabase
 */
export async function loadUserTransactions(userId?: string): Promise<void> {
  try {
    const uid = userId || state.user.id;
    if (!uid) {
      state.transactions = [];
      return;
    }

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: false });

    if (!error && data) {
      state.transactions = data.map((t: any) => ({
        id: t.id,
        type: t.type,
        amount: Number(t.amount),
        balance_after: Number(t.balance_after),
        reference: t.reference,
        payment_method: t.payment_method || 'Mobile Money',
        status: t.status,
        created_at: new Date(t.created_at).toLocaleString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        }),
        note: t.metadata?.note || ''
      }));
    }
  } catch (err) {
    console.error('Erreur loadUserTransactions:', err);
  }
}

/**
 * Inscription réelle via Supabase Auth
 */
export async function registerUser(params: {
  name: string;
  phone: string;
  phoneCountryCode: string;
  email: string;
  password: string;
}): Promise<{ success: boolean; message: string }> {
  try {
    const fullPhone = `${params.phoneCountryCode} ${params.phone.trim()}`;
    const { data, error } = await supabase.auth.signUp({
      email: params.email.trim().toLowerCase(),
      password: params.password,
      options: {
        data: {
          full_name: params.name.trim(),
          phone: fullPhone,
          phone_country_code: params.phoneCountryCode
        }
      }
    });

    if (error) {
      let msg = error.message;
      if (msg.includes('already registered')) {
        msg = 'Cette adresse e-mail est déjà associée à un compte. Veuillez vous connecter.';
      } else if (msg.includes('Password should be')) {
        msg = 'Le mot de passe doit comporter au moins 6 caractères.';
      } else if (msg.includes('invalid email')) {
        msg = 'Veuillez saisir une adresse e-mail valide.';
      }
      return { success: false, message: msg };
    }

    if (data.user) {
      // Si une session a été créée directement
      if (data.session) {
        await loadUserProfile(data.user.id);
        state.activeTab = 'home';
        showToast(`Bienvenue sur Boostify, ${params.name} !`, 'success');
        return { success: true, message: 'Compte créé avec succès !' };
      } else {
        // En attente éventuelle de confirmation email
        state.authMode = 'login';
        showToast('Compte créé ! Vous pouvez maintenant vous connecter.', 'success');
        return { success: true, message: 'Compte créé avec succès !' };
      }
    }

    return { success: false, message: 'Impossible de finaliser la création du compte.' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Erreur inattendue lors de l\'inscription.' };
  }
}

/**
 * Connexion réelle via Supabase Auth
 */
export async function loginUser(params: {
  email: string;
  password: string;
}): Promise<{ success: boolean; message: string }> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: params.email.trim().toLowerCase(),
      password: params.password
    });

    if (error) {
      let msg = error.message;
      if (msg.includes('Invalid login credentials')) {
        msg = 'Adresse e-mail ou mot de passe incorrect.';
      } else if (msg.includes('Email not confirmed')) {
        msg = 'Veuillez confirmer votre adresse e-mail avant de vous connecter.';
      }
      return { success: false, message: msg };
    }

    if (data.user) {
      await loadUserProfile(data.user.id);
      state.activeTab = 'home';
      showToast(`Ravi de vous revoir, ${state.user.name || 'sur Boostify'} !`, 'success');
      return { success: true, message: 'Connexion réussie.' };
    }

    return { success: false, message: 'Connexion impossible.' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Erreur lors de la connexion.' };
  }
}

/**
 * Déconnexion réelle
 */
export async function logout(): Promise<void> {
  try {
    await supabase.auth.signOut();
  } catch (err) {
    console.error('Erreur déconnexion:', err);
  } finally {
    state.isAuthenticated = false;
    state.user = { id: '', name: '', phone: '', email: '' };
    state.wallet.balance = 0;
    state.orders = [];
    state.transactions = [];
    state.activeTab = 'home';
    showToast('Vous avez été déconnecté.', 'info');
  }
}

// Fonction de rétrocompatibilité pour authentification locale
export function authenticate(params: {
  name: string;
  phone: string;
  email: string;
  rememberMe?: boolean;
}) {
  state.user.name = params.name;
  state.user.phone = params.phone;
  state.user.email = params.email;
  state.isAuthenticated = true;
  state.hasAcceptedTerms = true;
  state.activeTab = 'home';
  showToast(`Bienvenue, ${params.name} !`, 'success');
}

/**
 * Calcul du montant selon les règles du cahier des charges :
 * Prix proportionnel à la quantité, arrondi au franc supérieur.
 */
export function calculateOrderPrice(service: ServiceItem, quantity: number): number {
  if (!service || quantity <= 0) return 0;
  if (service.is_featured) return 15000;
  const unitPrice = service.price_per_1000 / 1000.0;
  return Math.ceil(quantity * unitPrice);
}

/**
 * Création d'une nouvelle commande avec débit immédiat du portefeuille via l'API Backend / Supabase
 */
export async function submitOrder(params: {
  serviceId: string;
  targetUrl: string;
  quantity: number;
}): Promise<{ success: boolean; message: string; order?: OrderItem }> {
  if (!state.isAuthenticated) {
    openAuth('login');
    showToast('Veuillez vous connecter pour passer commande.', 'error');
    return { success: false, message: 'Non authentifié.' };
  }

  const service = state.services.find(s => s.id === params.serviceId);
  if (!service) {
    showToast('Service introuvable.', 'error');
    return { success: false, message: 'Service introuvable.' };
  }

  const amount = calculateOrderPrice(service, params.quantity);
  if (state.wallet.balance < amount) {
    showToast(`Solde insuffisant (${state.wallet.balance.toLocaleString()} FCFA). Rechargez votre portefeuille.`, 'error');
    return { success: false, message: 'Solde insuffisant.' };
  }

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;

    if (!token) {
      showToast('Session expirée. Veuillez vous reconnecter.', 'error');
      openAuth('login');
      return { success: false, message: 'Session expirée.' };
    }

    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        service_id: params.serviceId,
        target_url: params.targetUrl,
        quantity: params.quantity
      })
    });

    const resJson = await response.json();

    if (!response.ok) {
      showToast(resJson.error || 'Erreur lors de la validation de la commande.', 'error');
      return { success: false, message: resJson.error };
    }

    // Mise à jour immédiate du solde et rafraîchissement des données réelles
    await loadUserProfile();
    showToast('Commande validée ! Démarrage en cours...', 'success');
    return { success: true, message: 'Commande créée avec succès.' };
  } catch (err: any) {
    showToast(err.message || 'Erreur réseau lors de la commande.', 'error');
    return { success: false, message: err.message };
  }
}

/**
 * Recharge du portefeuille par Mobile Money
 */
export async function depositFunds(
  amount: number,
  operatorName: string,
  phone?: string
): Promise<{ success: boolean; message: string }> {
  if (amount < 600) {
    showToast('Le montant minimum de recharge est de 600 FCFA.', 'error');
    return { success: false, message: 'Montant inférieur à 600 FCFA.' };
  }

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;

    if (!token) {
      showToast('Veuillez vous connecter pour recharger.', 'error');
      openAuth('login');
      return { success: false, message: 'Non authentifié.' };
    }

    const response = await fetch('/api/wallet/deposit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        amount,
        payment_method: operatorName,
        phone: phone || undefined
      })
    });

    const resData = await response.json();

    if (!response.ok) {
      showToast(resData.error || 'Erreur lors de l\'initialisation de la recharge.', 'error');
      return { success: false, message: resData.error };
    }

    // Redirection automatique vers la page de confirmation Chariow
    if (resData.checkout_url) {
      showToast('Demande envoyée sur votre téléphone ! Redirection...', 'success');
      setTimeout(() => {
        window.location.href = resData.checkout_url;
      }, 400);
      return { success: true, message: 'Redirection vers Chariow.' };
    }

    await loadUserProfile();
    return { success: true, message: 'Session initialisée.' };
  } catch (err: any) {
    showToast(err.message || 'Erreur lors de la recharge.', 'error');
    return { success: false, message: err.message };
  }
}

/**
 * Initialisation au démarrage de l'application
 */
export async function initAuth(): Promise<void> {
  // 0. Support des raccourcis PWA et navigation par URL (?tab=order, ?tab=wallet...)
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab') as AppTab | null;
    if (tabParam && ['home', 'order', 'orders', 'wallet', 'profile', 'policy', 'auth'].includes(tabParam)) {
      state.activeTab = tabParam;
    }
  } catch (e) {
    console.warn('Navigation URL non supportée:', e);
  }

  // 1. Charger les services en direct
  await loadServices();

  // 2. Vérifier la session active Supabase
  const { data } = await supabase.auth.getSession();
  if (data.session?.user) {
    await loadUserProfile(data.session.user.id);
  }

  // 3. Écouter les changements d'état d'authentification
  supabase.auth.onAuthStateChange(async (event, session) => {
    if (session?.user) {
      await loadUserProfile(session.user.id);
    } else if (event === 'SIGNED_OUT') {
      state.isAuthenticated = false;
      state.user = { id: '', name: '', phone: '', email: '' };
      state.wallet.balance = 0;
      state.orders = [];
      state.transactions = [];
    }
  });
}
