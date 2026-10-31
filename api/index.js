// Vercel Serverless Function entry point
// Connecte l'application Express compilée de backend/dist/app.js aux fonctions serverless Vercel

let app;

try {
  const backendApp = require('../backend/dist/app.js');
  app = backendApp.default || backendApp;
} catch (error) {
  console.error('Erreur chargement backend/dist/app.js:', error);
  throw error;
}

module.exports = (req, res) => {
  return app(req, res);
};

