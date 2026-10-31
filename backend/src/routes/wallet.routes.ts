import { Router } from 'express';
import { WalletController } from '../controllers/wallet.controller.js';
import { authenticateUser } from '../middlewares/auth.middleware.js';

const router = Router();

// Toutes les routes du portefeuille nécessitent une authentification
router.use(authenticateUser);

router.get('/overview', WalletController.getWalletOverview);
router.post('/deposit', WalletController.initiateDeposit);
router.get('/transactions', WalletController.getTransactions);

export default router;
