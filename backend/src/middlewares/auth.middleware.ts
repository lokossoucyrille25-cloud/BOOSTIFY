import { Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { AuthenticatedRequest, UserRole } from '../types/index.js';

export async function authenticateUser(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Accès non autorisé : Jeton d\'authentification manquant.' });
      return;
    }

    const token = authHeader.split(' ')[1];
    
    // Vérification du JWT auprès de Supabase Auth
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    
    if (error || !user) {
      res.status(401).json({ error: 'Session expirée ou jeton invalide.' });
      return;
    }

    // Récupération du profil et de son rôle
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, role, phone, status')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      res.status(403).json({ error: 'Profil utilisateur introuvable.' });
      return;
    }

    if (profile.status === 'suspended') {
      res.status(403).json({ error: 'Votre compte a été suspendu. Veuillez contacter le support.' });
      return;
    }

    req.user = {
      id: profile.id,
      email: profile.email,
      role: profile.role as UserRole,
      phone: profile.phone
    };

    next();
  } catch (err: any) {
    console.error('Erreur authentification:', err);
    res.status(500).json({ error: 'Erreur interne lors de la vérification de l\'authentification.' });
  }
}

export function requireRole(...allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Utilisateur non authentifié.' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ error: 'Permissions insuffisantes pour cette opération.' });
      return;
    }

    next();
  };
}

export const requireAdmin = requireRole('admin');
