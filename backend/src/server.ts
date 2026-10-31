import app from './app.js';
import { ENV } from './config/env.js';

// Démarrage du serveur local
const PORT = ENV.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Serveur Boostify démarré sur http://localhost:${PORT}`);
  console.log(`📡 Endpoints API disponibles sur http://localhost:${PORT}/api`);
});

export default app;
