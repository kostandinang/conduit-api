import { Router } from 'express';
import healthRouter from './health';
import leadsRouter from './leads';

/**
 * Routes Index
 *
 * Aggregates all route modules and exports a single router.
 */
const router = Router();

router.use('/health', healthRouter);
router.use('/leads', leadsRouter);

export default router;
