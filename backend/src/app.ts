import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { ENV } from './config/env.js';
import apiRoutes from './routes/index.js';

const app = express();

// Middlewares de sécurité et utilitaires
app.use(helmet({
  contentSecurityPolicy: false // Permet l'affichage et intégration sans conflit CSP sur Vercel
}));
app.use(cors({ origin: ENV.CORS_ORIGIN || '*', credentials: true }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Montage des routes pour supporter à la fois /api/* (local et réécritures Vercel) et /* (fonctions serverless directes)
app.use('/api', apiRoutes);
app.use('/', apiRoutes);

// Page d'accueil racine API
app.get(['/', '/api'], (req: Request, res: Response) => {
  res.json({
    name: 'Boostify API',
    description: "API Mobile & Web pour les services de croissance d'audience en Afrique de l'Ouest",
    version: '1.0.0',
    status: 'online',
    timestamp: new Date().toISOString()
  });
});

// Middleware 404
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: `Route non trouvée: ${req.method} ${req.originalUrl}` });
});

// Gestionnaire d'erreurs global
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('💥 Erreur serveur non interceptée:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Une erreur interne est survenue.'
  });
});

export default app;

