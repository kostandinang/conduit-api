import { Router } from 'express';

/**
 * Health Check Routes
 *
 * System health and status endpoints
 */
const router = Router();

/**
 * GET /health
 * Basic health check endpoint
 */
router.get('/', (req, res) => {
	res.json({
		status: 'healthy',
		service: 'conduit',
		timestamp: new Date().toISOString(),
	});
});

/**
 * GET /health/detailed
 * Detailed health check with system info
 */
router.get('/detailed', (req, res) => {
	res.json({
		status: 'healthy',
		service: 'conduit',
		timestamp: new Date().toISOString(),
		uptime: process.uptime(),
		memory: {
			used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
			total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
			unit: 'MB',
		},
		environment: process.env.NODE_ENV || 'development',
	});
});

export default router;
