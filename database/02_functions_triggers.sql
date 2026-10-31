-- ==============================================================================
-- BOOSTIFY - FONCTIONS & TRIGGERS POSTGRESQL (LOGIQUE MÉTIER & SÉCURITÉ)
-- ==============================================================================

-- 1. MISE À JOUR AUTOMATIQUE DU CHAMP updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_services_updated_at ON public.services;
CREATE TRIGGER trg_services_updated_at BEFORE UPDATE ON public.services
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_orders_updated_at ON public.orders;
CREATE TRIGGER trg_orders_updated_at BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_transactions_updated_at ON public.transactions;
CREATE TRIGGER trg_transactions_updated_at BEFORE UPDATE ON public.transactions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2. CRÉATION AUTOMATIQUE DU PROFIL LORS DE L'INSCRIPTION SUPABASE AUTH
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        id,
        email,
        full_name,
        phone,
        phone_country_code,
        role,
        balance,
        status
    ) VALUES (
        NEW.id,
        COALESCE(NEW.email, ''),
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Client Boostify'),
        COALESCE(NEW.raw_user_meta_data->>'phone', ''),
        COALESCE(NEW.raw_user_meta_data->>'phone_country_code', '+229'),
        'customer',
        0.00,
        'active'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. PROCÉDURE SÉCURISÉE : CRÉATION DE COMMANDE & DÉBIT ATOMIQUE DU SOLDE
-- Garantit zéro solde négatif et aucune commande sans solde suffisant
CREATE OR REPLACE FUNCTION public.place_order_with_wallet(
    p_user_id UUID,
    p_service_id UUID,
    p_target_url TEXT,
    p_quantity INTEGER
)
RETURNS JSONB AS $$
DECLARE
    v_service RECORD;
    v_unit_price NUMERIC;
    v_total_amount NUMERIC;
    v_current_balance NUMERIC;
    v_new_balance NUMERIC;
    v_order_id UUID;
    v_tx_ref TEXT;
BEGIN
    -- 1. Vérification du service
    SELECT * INTO v_service FROM public.services WHERE id = p_service_id AND is_active = true;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Service introuvable ou indisponible.';
    END IF;

    -- 2. Vérification des bornes de quantité
    IF p_quantity < v_service.min_quantity OR p_quantity > v_service.max_quantity THEN
        RAISE EXCEPTION 'La quantité demandée (%) est hors limites [%, %].',
            p_quantity, v_service.min_quantity, v_service.max_quantity;
    END IF;

    -- 3. Calcul du prix proportionnel arrondi au franc supérieur (Règle du cahier des charges)
    v_unit_price := v_service.price_per_1000 / 1000.0;
    v_total_amount := CEIL(p_quantity * v_unit_price);

    -- 4. Verrouillage de la ligne utilisateur pour éviter toute concurrence (pessimistic lock)
    SELECT balance INTO v_current_balance FROM public.profiles WHERE id = p_user_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Utilisateur introuvable.';
    END IF;

    -- 5. Vérification du solde
    IF v_current_balance < v_total_amount THEN
        RAISE EXCEPTION 'Solde insuffisant (% FCFA) pour cette commande (% FCFA). Veuillez recharger votre portefeuille.',
            v_current_balance, v_total_amount;
    END IF;

    -- 6. Débit du solde
    v_new_balance := v_current_balance - v_total_amount;
    UPDATE public.profiles SET balance = v_new_balance WHERE id = p_user_id;

    -- 7. Création de la commande
    INSERT INTO public.orders (
        user_id,
        service_id,
        target_url,
        quantity,
        amount,
        remains,
        status
    ) VALUES (
        p_user_id,
        p_service_id,
        p_target_url,
        p_quantity,
        v_total_amount,
        p_quantity,
        'pending'
    ) RETURNING id INTO v_order_id;

    -- 8. Enregistrement de la transaction de débit
    v_tx_ref := 'BST-ORD-' || to_char(now(), 'YYYYMMDD') || '-' || substr(md5(random()::text), 1, 6);
    INSERT INTO public.transactions (
        user_id,
        order_id,
        type,
        amount,
        balance_after,
        reference,
        payment_method,
        status,
        metadata
    ) VALUES (
        p_user_id,
        v_order_id,
        'order_debit',
        v_total_amount,
        v_new_balance,
        v_tx_ref,
        'wallet',
        'completed',
        jsonb_build_object(
            'service_name', v_service.name,
            'quantity', p_quantity,
            'target_url', p_target_url
        )
    );

    RETURN jsonb_build_object(
        'success', true,
        'order_id', v_order_id,
        'amount', v_total_amount,
        'new_balance', v_new_balance,
        'reference', v_tx_ref
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. PROCÉDURE SÉCURISÉE : VALIDATION RECHARGE VIA WEBHOOK CHARIOW
CREATE OR REPLACE FUNCTION public.confirm_chariow_deposit(
    p_reference TEXT,
    p_external_reference TEXT,
    p_amount NUMERIC,
    p_payment_method TEXT,
    p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB AS $$
DECLARE
    v_tx RECORD;
    v_current_balance NUMERIC;
    v_new_balance NUMERIC;
BEGIN
    -- Récupération de la transaction en attente avec verrou
    SELECT * INTO v_tx FROM public.transactions
    WHERE reference = p_reference
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Transaction de référence % introuvable.', p_reference;
    END IF;

    -- Idempotence : si déjà complétée, on renvoie le résultat sans réappliquer
    IF v_tx.status = 'completed' THEN
        RETURN jsonb_build_object(
            'success', true,
            'message', 'Transaction déjà confirmée précédemment (idempotence).',
            'balance_after', v_tx.balance_after
        );
    END IF;

    -- Verrouillage du profil utilisateur
    SELECT balance INTO v_current_balance FROM public.profiles WHERE id = v_tx.user_id FOR UPDATE;

    -- Calcul du nouveau solde
    v_new_balance := v_current_balance + p_amount;

    -- Mise à jour du solde utilisateur
    UPDATE public.profiles SET balance = v_new_balance WHERE id = v_tx.user_id;

    -- Mise à jour de la transaction
    UPDATE public.transactions SET
        status = 'completed',
        amount = p_amount,
        balance_after = v_new_balance,
        external_reference = p_external_reference,
        payment_method = COALESCE(p_payment_method, v_tx.payment_method),
        metadata = v_tx.metadata || p_metadata
    WHERE id = v_tx.id;

    -- Création d'une notification push / in-app
    INSERT INTO public.notifications (user_id, title, body, data)
    VALUES (
        v_tx.user_id,
        'Portefeuille crédité !',
        'Votre recharge de ' || p_amount || ' FCFA a été confirmée avec succès.',
        jsonb_build_object('transaction_id', v_tx.id, 'amount', p_amount, 'new_balance', v_new_balance)
    );

    RETURN jsonb_build_object(
        'success', true,
        'user_id', v_tx.user_id,
        'amount', p_amount,
        'new_balance', v_new_balance
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. GESTION DU REMBOURSEMENT AUTOMATIQUE AU PRORATA
CREATE OR REPLACE FUNCTION public.process_order_refund(
    p_order_id UUID,
    p_reason TEXT DEFAULT 'Commande annulée ou partielle'
)
RETURNS JSONB AS $$
DECLARE
    v_order RECORD;
    v_service RECORD;
    v_current_balance NUMERIC;
    v_new_balance NUMERIC;
    v_refund_amount NUMERIC;
    v_unit_price NUMERIC;
    v_tx_ref TEXT;
BEGIN
    SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Commande introuvable.';
    END IF;

    IF v_order.status NOT IN ('canceled', 'partial') THEN
        RAISE EXCEPTION 'Seules les commandes annulées ou partielles peuvent être remboursées.';
    END IF;

    IF v_order.refund_amount > 0 THEN
        RAISE EXCEPTION 'Cette commande a déjà été remboursée à hauteur de % FCFA.', v_order.refund_amount;
    END IF;

    SELECT * INTO v_service FROM public.services WHERE id = v_order.service_id;
    v_unit_price := v_service.price_per_1000 / 1000.0;

    IF v_order.status = 'canceled' THEN
        v_refund_amount := v_order.amount;
    ELSE
        -- Prorata de la quantité restante non livrée
        v_refund_amount := FLOOR(COALESCE(v_order.remains, 0) * v_unit_price);
    END IF;

    IF v_refund_amount <= 0 THEN
        RETURN jsonb_build_object('success', false, 'message', 'Aucun montant à rembourser.');
    END IF;

    -- Crédit du solde
    SELECT balance INTO v_current_balance FROM public.profiles WHERE id = v_order.user_id FOR UPDATE;
    v_new_balance := v_current_balance + v_refund_amount;
    UPDATE public.profiles SET balance = v_new_balance WHERE id = v_order.user_id;

    -- Mise à jour de la commande
    UPDATE public.orders SET refund_amount = v_refund_amount WHERE id = v_order.id;

    -- Insertion de la transaction de remboursement
    v_tx_ref := 'BST-REF-' || to_char(now(), 'YYYYMMDD') || '-' || substr(md5(random()::text), 1, 6);
    INSERT INTO public.transactions (
        user_id,
        order_id,
        type,
        amount,
        balance_after,
        reference,
        payment_method,
        status,
        metadata
    ) VALUES (
        v_order.user_id,
        v_order.id,
        'refund',
        v_refund_amount,
        v_new_balance,
        v_tx_ref,
        'wallet',
        'completed',
        jsonb_build_object('reason', p_reason, 'order_id', v_order.id)
    );

    RETURN jsonb_build_object(
        'success', true,
        'refund_amount', v_refund_amount,
        'new_balance', v_new_balance,
        'reference', v_tx_ref
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
