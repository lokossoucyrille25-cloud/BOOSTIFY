-- ==============================================================================
-- BOOSTIFY - POLITIQUES DE SÉCURITÉ SUPABASE (ROW LEVEL SECURITY - RLS)
-- ==============================================================================

-- 1. ACTIVATION DE LA RLS SUR TOUTES LES TABLES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smm_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 2. HELPER : VÉRIFICATION SI L'UTILISATEUR EST ADMIN
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. POLITIQUES : PROFILES
-- Lecture : Utilisateur lui-même OU Admin
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
CREATE POLICY "profiles_select_policy" ON public.profiles
FOR SELECT USING (
    auth.uid() = id OR public.is_admin()
);

-- Modification : Seul l'utilisateur peut modifier ses infos personnelles (sauf solde & rôle)
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
CREATE POLICY "profiles_update_policy" ON public.profiles
FOR UPDATE USING (
    auth.uid() = id OR public.is_admin()
) WITH CHECK (
    -- Empêche le client d'augmenter son propre solde ou de s'auto-promouvoir admin
    (auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()) AND balance = (SELECT balance FROM public.profiles WHERE id = auth.uid()))
    OR public.is_admin()
);

-- 4. POLITIQUES : SERVICES (CATALOGUE)
-- Lecture : Tous les utilisateurs authentifiés ou publics peuvent voir les services actifs
DROP POLICY IF EXISTS "services_select_policy" ON public.services;
CREATE POLICY "services_select_policy" ON public.services
FOR SELECT USING (
    is_active = true OR public.is_admin()
);

-- Écriture/Modification : Administrateurs uniquement
DROP POLICY IF EXISTS "services_admin_policy" ON public.services;
CREATE POLICY "services_admin_policy" ON public.services
FOR ALL USING (public.is_admin());

-- 5. POLITIQUES : ORDERS (COMMANDES)
-- Lecture : L'utilisateur ne voit que ses commandes, l'admin voit tout
DROP POLICY IF EXISTS "orders_select_policy" ON public.orders;
CREATE POLICY "orders_select_policy" ON public.orders
FOR SELECT USING (
    auth.uid() = user_id OR public.is_admin()
);

-- Insertion directe refusée pour les clients (doit passer par place_order_with_wallet ou backend API)
DROP POLICY IF EXISTS "orders_insert_policy" ON public.orders;
CREATE POLICY "orders_insert_policy" ON public.orders
FOR INSERT WITH CHECK (
    public.is_admin()
);

-- 6. POLITIQUES : TRANSACTIONS
-- Lecture : L'utilisateur ne voit que ses transactions
DROP POLICY IF EXISTS "transactions_select_policy" ON public.transactions;
CREATE POLICY "transactions_select_policy" ON public.transactions
FOR SELECT USING (
    auth.uid() = user_id OR public.is_admin()
);

-- Insertion/Modification refusée en direct : réservé à la fonction sécurisée et à l'admin
DROP POLICY IF EXISTS "transactions_all_policy" ON public.transactions;
CREATE POLICY "transactions_all_policy" ON public.transactions
FOR ALL USING (public.is_admin());

-- 7. POLITIQUES : NOTIFICATIONS
DROP POLICY IF EXISTS "notifications_select_policy" ON public.notifications;
CREATE POLICY "notifications_select_policy" ON public.notifications
FOR SELECT USING (
    auth.uid() = user_id OR user_id IS NULL OR public.is_admin()
);

DROP POLICY IF EXISTS "notifications_update_policy" ON public.notifications;
CREATE POLICY "notifications_update_policy" ON public.notifications
FOR UPDATE USING (
    auth.uid() = user_id OR public.is_admin()
);

-- 8. POLITIQUES : FOURNISSEURS SMM & AUDIT LOGS (ADMIN UNIQUEMENT)
DROP POLICY IF EXISTS "smm_providers_admin_policy" ON public.smm_providers;
CREATE POLICY "smm_providers_admin_policy" ON public.smm_providers
FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "audit_logs_admin_policy" ON public.audit_logs;
CREATE POLICY "audit_logs_admin_policy" ON public.audit_logs
FOR ALL USING (public.is_admin());
