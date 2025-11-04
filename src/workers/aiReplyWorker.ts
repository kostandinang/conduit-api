import { getQueue, QUEUES } from '../queues/queue';
import { queueSendMessage } from '../queues/sendMessage';
import { aiService } from '../services/AIService';
import { leadService } from '../services/LeadService';
import { messageService } from '../services/MessageService';
import type { GenerateAIReplyJobData } from '../types';
import { logger } from '../utils/logger';
import { supabase } from '../utils/supabase';

/**
 * AI Reply Worker
 *
 * Generates AI-powered replies and queues them for sending.
 *
 * Job flow:
 * 1. Receive lead_id and channel from queue
 * 2. Generate AI reply based on conversation context
 * 3. Create outbound message
 * 4. Queue message for sending (separate job)
 * 5. Update lead status (to. engaged)
 */
export async function registerAIReplyWorker() {
	const queue = getQueue();

	await queue.work<GenerateAIReplyJobData>(
		QUEUES.GENERATE_AI_REPLY,
		{
			teamSize: 3, // Lower concurrency for AI jobs (may hit rate limits)
			teamConcurrency: 1,
		},
		async (job) => {
			const { lead_id, channel, context } = job.data;

			logger.info({ jobId: job.id, leadId: lead_id, channel }, 'Processing generate-ai-reply job');

			// Track job in database
			const { data: jobRecord } = await supabase
				.from('jobs')
				.insert({
					lead_id,
					job_name: QUEUES.GENERATE_AI_REPLY,
					status: 'active',
					attempts: 1,
					max_attempts: 3,
				})
				.select()
				.single();

			try {
				// Generate AI reply
				const reply = await aiService.generateReply(lead_id, channel, context);

				// Create outbound message
				const message = await messageService.createMessage(lead_id, channel, 'outbound', reply);

				// Queue the message for sending
				await queueSendMessage({
					message_id: message.id,
					lead_id,
					channel,
					content: reply,
				});

				// Update lead status: replied -> engaged
				const lead = await leadService.getLead(lead_id);
				if (lead && lead.status === 'replied') {
					await leadService.updateLeadStatus(lead_id, 'engaged', 'AI reply generated and queued');
				}

				// Mark job as completed
				if (jobRecord) {
					await supabase
						.from('jobs')
						.update({
							status: 'completed',
							completed_at: new Date().toISOString(),
						})
						.eq('id', jobRecord.id);
				}

				logger.info(
					{ jobId: job.id, leadId: lead_id, messageId: message.id },
					'generate-ai-reply job completed'
				);
			} catch (error) {
				logger.error({ error, jobId: job.id, leadId: lead_id }, 'generate-ai-reply job failed');

				// Update job status
				if (jobRecord) {
					await supabase
						.from('jobs')
						.update({
							status: 'failed',
							error: error instanceof Error ? error.message : 'Unknown error',
						})
						.eq('id', jobRecord.id);
				}

				throw error; // pg-boss will handle retry
			}
		}
	);

	logger.info('AI reply worker registered');
}
