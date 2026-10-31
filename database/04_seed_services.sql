-- ==============================================================================
-- BOOSTIFY - SEED INITIAL DES SERVICES (TARIFICATION OFFICIELLE CAHIER DES CHARGES)
-- ==============================================================================

INSERT INTO public.services (network, category, name, price_per_1000, min_quantity, max_quantity, is_active, is_featured, description, provider_service_id)
VALUES
    -- TIKTOK
    ('tiktok', 'Vues', 'Vues TikTok', 700.00, 100, 10000000, true, false, 'Vues rapides et stables pour booster vos vidéos TikTok', '36645'),
    ('tiktok', 'Abonnés', 'Abonnés TikTok', 3000.00, 100, 100000, true, false, 'Abonnés TikTok avec livraison progressive sans mot de passe', NULL),
    ('tiktok', 'Likes', 'Likes TikTok', 750.00, 100, 50000, true, false, 'Likes rapides pour booster vos vidéos TikTok', NULL),
    ('tiktok', 'Commentaires', 'Commentaires TikTok', 1500.00, 10, 5000, true, false, 'Commentaires personnalisés ou aléatoires', NULL),

    -- INSTAGRAM
    ('instagram', 'Abonnés', 'Abonnés Instagram', 3500.00, 100, 100000, true, false, 'Croissance de votre profil public Instagram', NULL),
    ('instagram', 'Likes', 'Likes Instagram', 2300.00, 100, 50000, true, false, 'Likes haute qualité sur vos publications Instagram', NULL),
    ('instagram', 'Commentaires', 'Commentaires Instagram', 2700.00, 10, 5000, true, false, 'Commentaires interactifs sur vos posts', NULL),

    -- FACEBOOK
    ('facebook', 'Abonnés', 'Abonnés Page Facebook', 2500.00, 100, 100000, true, false, 'Abonnés pour votre page professionnelle ou profil', NULL),
    ('facebook', 'Likes', 'Likes Publications Facebook', 1700.00, 100, 50000, true, false, 'Likes sur posts et photos', NULL),
    ('facebook', 'Vues', 'Vues Vidéos Facebook', 750.00, 500, 200000, true, false, 'Vues rapides sur vidéos et reels Facebook', NULL),

    -- DISCORD
    ('discord', 'Membres', 'Membres Discord', 4000.00, 50, 20000, true, false, 'Rejoignent votre serveur Discord public', NULL),
    ('discord', 'Membres en ligne', 'Membres en ligne Discord', 4500.00, 50, 10000, true, false, 'Membres affichés connectés sur votre serveur Discord (2 000 FCFA pour 500)', NULL),

    -- OFFRE VEDETTE
    ('tiktok', 'Abonnés', 'Pack Vedette - 10 000 Abonnés', 2000.00, 10000, 10000, true, true, 'Offre Spéciale : Pack 10 000 abonnés', NULL)
ON CONFLICT DO NOTHING;
