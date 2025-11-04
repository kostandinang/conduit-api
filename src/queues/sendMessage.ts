import type { SendMessageJobData } from '../types';
import { logger } from '../utils/logger';
import { getQueue, QUEUES } from './queue';

/**
 * Queue a message to be sent
 */
export async function queueSendMessage(data: SendMessageJobData): Promise<string | null> {
	const queue = getQueue();

	const jobId = await queue.send(QUEUES.SEND_MESSAGE, data, {
		retryLimit: 3,
		retryDelay: 1,
		retryBackoff: true,
	});

	logger.info({ jobId, messageId: data.message_id }, 'Queued send-message job');

	return jobId;
}
