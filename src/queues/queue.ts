import PgBoss from 'pg-boss';
import { GenerateAIReplyJobData, SendMessageJobData } from '../types';
import { config } from '../utils/config';
import { logger } from '../utils/logger';

/**
 * Queue system using pg-boss (PostgreSQL-based queue)
 */
let boss: PgBoss | null = null;

export const QUEUES = {
	SEND_MESSAGE: 'send-message',
	GENERATE_AI_REPLY: 'generate-ai-reply',
} as const;

/**
 * Initialize pg-boss connection
 */
export async function initQueue(): Promise<PgBoss> {
	if (boss) return boss;

	// Validate DATABASE_URL before attempting connection
	if (!config.database.url) {
		logger.error('DATABASE_URL is not configured');
		throw new Error(
			'DATABASE_URL is required for queue system.\n' +
				'Please set it in your .env file.\n' +
				'Get it from: Supabase Dashboard -> Settings -> Database -> Connection String (URI)'
		);
	}

	logger.info('Initializing pg-boss queue system');

	try {
		boss = new PgBoss({
			connectionString: config.database.url,
			// Retry strategy: 3 attempts with exponential backoff
			retryLimit: 3,
			retryDelay: 1, // seconds
			retryBackoff: true, // exponential backoff: 1s, 2s, 4s
			expireInHours: 24, // Jobs expire after 24 hours
			// Archive completed jobs for 7 days
			archiveCompletedAfterSeconds: 60 * 60 * 24 * 7,
		});

		boss.on('error', (error) => {
			logger.error({ error }, 'pg-boss error');
		});

		await boss.start();

		logger.info('pg-boss queue system started');

		return boss;
	} catch (error) {
		logger.error({ error }, 'Failed to initialize pg-boss queue');
		boss = null; // Reset on failure
		throw new Error(
			'Failed to connect to database for queue system.\n' +
				'Please check your DATABASE_URL in .env file.\n' +
				`Error: ${error instanceof Error ? error.message : 'Unknown error'}`
		);
	}
}

/**
 * Get queue instance (must call initQueue first)
 */
export function getQueue(): PgBoss {
	if (!boss) {
		throw new Error('Queue not initialized. Call initQueue() first.');
	}
	return boss;
}

/**
 * Graceful shutdown
 */
export async function stopQueue(): Promise<void> {
	if (boss) {
		logger.info('Stopping pg-boss queue system');
		await boss.stop();
		boss = null;
	}
}
