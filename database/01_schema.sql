-- ==============================================================================
-- BOOSTIFY - SCHÉMA DE BASE DE DONNÉES (POSTGRESQL / SUPABASE)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('customer', 'admin', 'support', 'accountant');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE user_status AS ENUM ('active', 'suspended', 'pending_verification');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE social_network AS ENUM ('tiktok', 'instagram', 'facebook', 'discord');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE order_status AS ENUM ('pending', 'processing', 'completed', 'partial', 'canceled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE transaction_type AS ENUM ('deposit', 'order_debit', 'refund', 'manual_credit', 'manual_debit');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed', 'canceled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. TABLE DES PROFILS UTILISATEURS
-- Liée à auth.users de Supabase
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL, -- Numéro WhatsApp avec indicatif (+229, +225, +221, +228...)
    phone_country_code VARCHAR(10) DEFAULT '+229',
    role user_role NOT NULL DEFAULT 'customer',
    status user_status NOT NULL DEFAULT 'active',
    balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (balance >= 0),
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index pour recherches rapides
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- 4. TABLE DES FOURNISSEURS SMM (API externes)
CREATE TABLE IF NOT EXISTS public.smm_providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    api_url TEXT NOT NULL,
    api_key TEXT NOT NULL,
    balance NUMERIC(12, 2) DEFAULT 0.00,
    currency VARCHAR(10) DEFAULT 'USD',
    alert_threshold NUMERIC(12, 2) DEFAULT 25.00,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. TABLE DES SERVICES
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    network social_network NOT NULL,
    name TEXT NOT NULL, -- Ex: "Abonnés TikTok", "Likes Instagram"
    category TEXT NOT NULL, -- Ex: "Abonnés", "Likes", "Vues", "Commentaires", "Membres"
    price_per_1000 NUMERIC(12, 2) NOT NULL CHECK (price_per_1000 > 0), -- Prix en FCFA pour 1 000 unités
    min_quantity INTEGER NOT NULL DEFAULT 100 CHECK (min_quantity > 0),
    max_quantity INTEGER NOT NULL DEFAULT 100000 CHECK (max_quantity >= min_quantity),
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_featured BOOLEAN NOT NULL DEFAULT false, -- Pour l'offre mise en avant (ex: pack 10 000 à 15 000 FCFA)
    description TEXT,
    provider_id UUID REFERENCES public.smm_providers(id) ON DELETE SET NULL,
    provider_service_id TEXT, -- ID du service chez le fournisseur SMM
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_services_network ON public.services(network);
CREATE INDEX IF NOT EXISTS idx_services_active ON public.services(is_active);

-- 6. TABLE DES COMMANDES
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE RESTRICT,
    target_url TEXT NOT NULL, -- URL publique du profil ou de la publication
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0), -- Montant débité en FCFA
    start_count INTEGER DEFAULT 0,
    remains INTEGER DEFAULT 0,
    delivered_quantity INTEGER DEFAULT 0,
    status order_status NOT NULL DEFAULT 'pending',
    provider_order_id TEXT, -- ID de commande chez le fournisseur SMM
    error_message TEXT,
    refund_amount NUMERIC(12, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- 7. TABLE DES TRANSACTIONS (Portefeuille & Recharges)
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    type transaction_type NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    balance_after NUMERIC(12, 2) NOT NULL, -- Solde après opération (traçabilité absolue)
    reference VARCHAR(100) UNIQUE NOT NULL, -- Référence interne unique (ex: BST-DEP-...)
    external_reference VARCHAR(150), -- Référence Chariow / Mobile Money
    payment_provider VARCHAR(50) DEFAULT 'chariow',
    payment_method VARCHAR(50), -- mtn, moov, orange, wave, card, wallet
    status transaction_status NOT NULL DEFAULT 'pending',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_transactions_user ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_reference ON public.transactions(reference);
CREATE INDEX IF NOT EXISTS idx_transactions_external_ref ON public.transactions(external_reference);

-- 8. TABLE DES NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE, -- NULL si notification globale
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    data JSONB DEFAULT '{}'::jsonb,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);

-- 9. TABLE D'AUDIT ADMIN
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL, -- Ex: "MANUAL_CREDIT", "UPDATE_PRICE", "CANCEL_ORDER"
    target_type TEXT NOT NULL, -- Ex: "users", "orders", "services"
    target_id UUID,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
