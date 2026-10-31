# 🚀 Boostify - Plateforme de Croissance d'Audience (Afrique de l'Ouest)

Ce dépôt contient l'architecture et le code source de l'application **Boostify**, basée sur le [Cahier des charges](file:///c:/Dev/Vue/Cahier%20des%20charges%20%E2%80%93%20Application%20mobile%20Boostify.pdf).

---

## 📁 Structure du Projet

```text
c:\Dev\Vue\
├── database/                    # Schémas et scripts SQL pour PostgreSQL / Supabase
│   ├── 01_schema.sql            # Tables, ENUMs, contraintes et index
│   ├── 02_functions_triggers.sql # Procédures atomiques de débit & webhooks Chariow
│   ├── 03_rls_policies.sql      # Politiques de sécurité RLS (Row Level Security)
│   └── 04_seed_services.sql     # Tarifs officiels (TikTok, Instagram, Facebook, Discord)
├── backend/                     # API REST Node.js (TypeScript / Express / Supabase)
│   ├── src/
│   │   ├── config/              # Configuration env et Supabase
│   │   ├── controllers/         # Contrôleurs (Services, Portefeuille, Commandes, Webhooks, Admin)
│   │   ├── middlewares/         # Authentification JWT Supabase & rôles (RBAC)
│   │   ├── routes/              # Définition des endpoints API
│   │   ├── services/            # Intégrations Chariow (Mobile Money) & Fournisseur SMM
│   │   └── server.ts            # Point d'entrée de l'application
│   ├── .env.example
│   └── package.json
└── mobile/                      # Application mobile Vue.js + Ionic / Capacitor (à venir)
```

---

## 🗄️ Étape 1 : Configuration de Supabase (Base de données PostgreSQL)

1. Rendez-vous sur votre tableau de bord [Supabase](https://supabase.com) et créez un nouveau projet (ou utilisez votre projet existant).
2. Ouvrez l'onglet **SQL Editor** dans Supabase.
3. Exécutez successivement les fichiers situés dans `database/` :
   - `01_schema.sql` : Crée les tables (`profiles`, `services`, `orders`, `transactions`, `notifications`, `audit_logs`).
   - `02_functions_triggers.sql` : Active les fonctions transactionnelles sécurisées (`place_order_with_wallet`, `confirm_chariow_deposit`, `process_order_refund`).
   - `03_rls_policies.sql` : Configure l'étanchéité et la protection des données par utilisateur.
   - `04_seed_services.sql` : Charge la grille tarifaire complète conforme au cahier des charges (Bénin, Côte d'Ivoire, Sénégal, Togo).
4. Dans **Project Settings > API**, copiez :
   - `Project URL`
   - `anon public key`
   - `service_role secret key`

---

## ⚡ Étape 2 : Configuration du Backend API

1. Ouvrez le fichier [backend/.env](file:///c:/Dev/Vue/backend/.env) et renseignez vos clés Supabase :
   ```env
   SUPABASE_URL=https://votre-projet.supabase.co
   SUPABASE_ANON_KEY=votre-cle-anon
   SUPABASE_SERVICE_ROLE_KEY=votre-cle-service-role
   ```
2. Lancez le serveur en mode développement :
   ```bash
   cd backend
   npm run dev
   ```
3. L'API est accessible sur : `http://localhost:4000/api`

---

## ☁️ Étape 3 : Déploiement sur Vercel (Frontend & Backend Serverless)

Le projet est configuré pour se déployer intégralement sur **Vercel** en un clic.

### 1. Structure Vercel
- **Frontend** : Application Vue 3 / Vite compilée dans `frontend/dist` et distribuée sur le CDN mondial Vercel.
- **Backend API** : Fonction serverless Node.js dans `api/index.js` montant l'API Express compilée (`backend/dist/app.js`), accessible via `/api/*`.
- **Routage SPA** : Toutes les routes frontend sont automatiquement redirigées vers `/index.html` sans erreur 404.

### 2. Procédure de déploiement
1. Poussez votre code sur votre dépôt Git (GitHub, GitLab ou Bitbucket).
2. Rendez-vous sur [Vercel](https://vercel.com) > **Add New...** > **Project**.
3. Importez votre dépôt Boostify.
4. Dans **Build and Output Settings** :
   - Les réglages sont automatiquement détectés grâce au fichier [vercel.json](file:///c:/Dev/Vue/vercel.json) :
     - **Build Command** : `npm run build`
     - **Output Directory** : `frontend/dist`
5. Dans **Environment Variables**, copiez les variables de [.env.example](file:///c:/Dev/Vue/.env.example) :
   - `NODE_ENV=production`
   - `SUPABASE_URL` & `SUPABASE_ANON_KEY` & `SUPABASE_SERVICE_ROLE_KEY`
   - `VITE_SUPABASE_URL` & `VITE_SUPABASE_ANON_KEY`
   - `CHARIOW_STORE_ID=store_fuu7ejozbr0j`
   - `CHARIOW_SECRET_KEY=sk_bjnwr8ux_66cb63c16facf4e2528fecff552857a1`
   - `CHARIOW_PRODUCT_ID=prd_fav7tf9d`
   - `CHARIOW_REDIRECT_URL=https://<votre-domaine-vercel>.vercel.app`
   - `CHARIOW_WEBHOOK_CALLBACK_URL=https://<votre-domaine-vercel>.vercel.app/api/webhooks/chariow`
   - `SMM_PROVIDER_API_KEY=3f3aeca8f1416d79924bf3e70aefb6a6`
   - `CORS_ORIGIN=*`
6. Cliquez sur **Deploy**.

---

## 🛡️ Règles Métier Clés Implémentées

- **Portefeuille & Anti-Fraude** : Le solde n'est jamais modifié par le client ; il est débité de manière atomique via la procédure PostgreSQL `place_order_with_wallet`, empêchant tout solde négatif ou commande en double.
- **Paiements Chariow** : Le crédit du portefeuille est conditionné à la réception du webhook serveur vérifié (`confirm_chariow_deposit`) avec support complet de l'idempotence.
- **Remboursements au Prorata** : En cas d'annulation ou de livraison partielle par le fournisseur SMM, le montant exact des unités non livrées est recrédité immédiatement sur le solde de l'utilisateur.
- **Traçabilité totale** : Chaque transaction enregistre le `balance_after` pour un audit infalsifiable.
