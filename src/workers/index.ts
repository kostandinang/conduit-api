import { initQueue, stopQueue } from '../queues/queue';
import { registerSendMessageWorker } from './sendMessageWorker';
import { registerAIReplyWorker } from './aiReplyWorker';
import { logger } from '../utils/logger';

/**
 * Worker Process Entry Point
 *
 * This starts the background workers that process queued jobs.
 * In production, you'd run this as a separate process/container.
 *
 * Usage: npm run worker
 */

async function main() {
  logger.info('Starting Conduit workers');

  try {
    // Initialize queue connection
    await initQueue();

    // Register all workers
    await registerSendMessageWorker();
    await registerAIReplyWorker();

    logger.info('All workers registered and running');
    logger.info('Press Ctrl+C to stop');
  } catch (error) {
    logger.error({ error }, 'Failed to start workers');
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Shutting down workers...');
  await stopQueue();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Shutting down workers...');
  await stopQueue();
  process.exit(0);
});

main();
