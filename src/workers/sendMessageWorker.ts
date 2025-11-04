import { getQueue, QUEUES } from '../queues/queue';
import { logger } from '../utils/logger';
import { messageService } from '../services/MessageService';
import { leadService } from '../services/LeadService';
import { supabase } from '../utils/supabase';
import { SendMessageJobData } from '../types';

/**
 * Send Message Worker
 *
 * Processes outbound messages from the queue.
 * Handles retries automatically via pg-boss.
 *
 * Job flow:
 * 1. Receive message_id from queue
 * 2. Send message via appropriate channel
 * 3. Update lead status if first message (new -> contacted)
 * 4. Log job completion in jobs table
 */
export async function registerSendMessageWorker() {
  const queue = getQueue();

  await queue.work<SendMessageJobData>(
    QUEUES.SEND_MESSAGE,
    {
      teamSize: 5, // Process up to 5 jobs concurrently
      teamConcurrency: 1, // Each worker processes 1 job at a time
    },
    async (job) => {
      const { message_id, lead_id, channel } = job.data;

      logger.info(
        { jobId: job.id, messageId: message_id, leadId: lead_id },
        'Processing send-message job'
      );

      // Track job in database
      const { data: jobRecord } = await supabase
        .from('jobs')
        .insert({
          lead_id,
          job_name: QUEUES.SEND_MESSAGE,
          status: 'active',
          attempts: 1,
          max_attempts: 3,
        })
        .select()
        .single();

      try {
        // Send the message
        await messageService.sendMessage(message_id);

        // Update lead status: new -> contacted (if first outbound message)
        const lead = await leadService.getLead(lead_id);
        if (lead && lead.status === 'new') {
          await leadService.updateLeadStatus(lead_id, 'contacted', 'First message sent');
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
          { jobId: job.id, messageId: message_id },
          'send-message job completed'
        );
      } catch (error) {
        logger.error(
          { error, jobId: job.id, messageId: message_id },
          'send-message job failed'
        );

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

  logger.info('Send message worker registered');
}
