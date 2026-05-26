import { Router } from 'express';
import { getDashboardStats, getLowStockAlerts } from '../controllers/dashboard.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/stats', getDashboardStats);
router.get('/alerts', getLowStockAlerts);

export default router;
