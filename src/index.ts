import cors from 'cors';
import express from 'express';
import { errorHandler, notFoundHandler, requestLogger } from './middleware';
import { initQueue, stopQueue } from './queues/queue';
import routes from './routes';
import { config } from './utils/config';
import { logger } from './utils/logger';

/**
 * Conduit API Server
 *
 * Multi-channel automation workflow engine
 * This is the main API server that handles incoming requests
 * Queue workers run separately via: npm run worker
 */
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(requestLogger);

// Mount all routes
app.use('/', routes);

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

async function main() {
	try {
		// Initialize queue connection (for enqueueing jobs)
		await initQueue();
		logger.info('Queue connection initialized');

		// Start server
		const port = config.server.port;
		app.listen(port, () => {
			logger.info(`🚀 Conduit API server running on port ${port}`);
			logger.info(`📊 Health check: http://localhost:${port}/health`);
			logger.info('');
			logger.info('💡 Run workers separately: npm run worker');
		});
	} catch (error) {
		logger.error({ error }, 'Failed to start server');
		process.exit(1);
	}
}

process.on('SIGINT', async () => {
	logger.info('Shutting down server...');
	await stopQueue();
	process.exit(0);
});

process.on('SIGTERM', async () => {
	logger.info('Shutting down server...');
	await stopQueue();
	process.exit(0);
});

main();
