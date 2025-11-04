import type { GenerateAIReplyJobData } from '../types';
import { logger } from '../utils/logger';
import { getQueue, QUEUES } from './queue';

/**
 * Queue AI reply generation
 */
export async function queueGenerateAIReply(data: GenerateAIReplyJobData): Promise<string | null> {
	const queue = getQueue();

	const jobId = await queue.send(QUEUES.GENERATE_AI_REPLY, data, {
		retryLimit: 3,
		retryDelay: 1,
		retryBackoff: true,
	});

	logger.info({ jobId, leadId: data.lead_id }, 'Queued generate-ai-reply job');

	return jobId;
}
