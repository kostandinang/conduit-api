import { Request, Response } from 'express';
import { z } from 'zod';
import { leadService } from '../services/LeadService';
import { messageService } from '../services/MessageService';
import { queueGenerateAIReply } from '../queues/generateAIReply';
import { queueSendMessage } from '../queues/sendMessage';
import { logger } from '../utils/logger';

const createLeadSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  metadata: z.record(z.any()).optional(),
}).refine(data => data.email || data.phone, {
  message: 'Either email or phone is required',
});

const sendMessageSchema = z.object({
  lead_id: z.string().uuid(),
  channel: z.enum(['email', 'whatsapp', 'voice', 'linkedin', 'ads']),
  content: z.string().min(1, 'Content is required'),
});

const replySchema = z.object({
  lead_id: z.string().uuid(),
  channel: z.enum(['email', 'whatsapp', 'voice', 'linkedin', 'ads']),
  content: z.string().min(1, 'Content is required'),
});

const aiReplySchema = z.object({
  lead_id: z.string().uuid(),
  channel: z.enum(['email', 'whatsapp', 'voice', 'linkedin', 'ads']),
  context: z.string().optional(),
});

/**
 * LeadController
 *
 * Handles controller logic for lead-related endpoints.
 */
export class LeadController {
  /**
   * POST /lead
   * Create a new lead
   */
  async createLead(req: Request, res: Response): Promise<void> {
    try {
      const data = createLeadSchema.parse(req.body);
      const lead = await leadService.createLead(data);

      res.status(201).json({
        success: true,
        data: lead,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.errors,
        });
        return;
      }

      logger.error({ error }, 'Failed to create lead');
      res.status(500).json({
        success: false,
        error: 'Failed to create lead',
      });
    }
  }

  /**
   * POST /send
   * Queue an outbound message
   */
  async sendMessage(req: Request, res: Response): Promise<void> {
    try {
      const data = sendMessageSchema.parse(req.body);

      // Verify lead exists
      const lead = await leadService.getLead(data.lead_id);
      if (!lead) {
        res.status(404).json({
          success: false,
          error: 'Lead not found',
        });
        return;
      }

      const message = await messageService.createMessage(
        data.lead_id,
        data.channel,
        'outbound',
        data.content
      );

      const jobId = await queueSendMessage({
        message_id: message.id,
        lead_id: data.lead_id,
        channel: data.channel,
        content: data.content,
      });

      res.status(200).json({
        success: true,
        data: {
          message_id: message.id,
          job_id: jobId,
          status: 'queued',
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.errors,
        });
        return;
      }

      logger.error({ error }, 'Failed to queue message');
      res.status(500).json({
        success: false,
        error: 'Failed to queue message',
      });
    }
  }

  /**
   * POST /reply
   * Handle inbound reply from prospect (webhook simulation)
   */
  async handleReply(req: Request, res: Response): Promise<void> {
    try {
      const data = replySchema.parse(req.body);

      // Verify lead exists
      const lead = await leadService.getLead(data.lead_id);
      if (!lead) {
        res.status(404).json({
          success: false,
          error: 'Lead not found',
        });
        return;
      }

      const message = await messageService.handleReply(data);

      res.status(200).json({
        success: true,
        data: message,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.errors,
        });
        return;
      }

      logger.error({ error }, 'Failed to handle reply');
      res.status(500).json({
        success: false,
        error: 'Failed to handle reply',
      });
    }
  }

  /**
   * POST /ai/reply
   * Generate AI response and queue it for sending
   */
  async generateAIReply(req: Request, res: Response): Promise<void> {
    try {
      const data = aiReplySchema.parse(req.body);

      // Verify lead exists
      const lead = await leadService.getLead(data.lead_id);
      if (!lead) {
        res.status(404).json({
          success: false,
          error: 'Lead not found',
        });
        return;
      }

      // Queue AI reply generation
      const jobId = await queueGenerateAIReply({
        lead_id: data.lead_id,
        channel: data.channel,
        context: data.context,
      });

      res.status(200).json({
        success: true,
        data: {
          job_id: jobId,
          status: 'queued',
          message: 'AI reply generation queued',
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.errors,
        });
        return;
      }

      logger.error({ error }, 'Failed to queue AI reply');
      res.status(500).json({
        success: false,
        error: 'Failed to queue AI reply',
      });
    }
  }

  /**
   * GET /lead/:id
   * Get complete lead timeline (lead + messages + jobs + events)
   */
  async getLeadTimeline(req: Request, res: Response): Promise<void> {
    try {
      const leadId = req.params.id;

      // Validate UUID
      if (!z.string().uuid().safeParse(leadId).success) {
        res.status(400).json({
          success: false,
          error: 'Invalid lead ID format',
        });
        return;
      }

      const timeline = await leadService.getLeadTimeline(leadId);

      res.status(200).json({
        success: true,
        data: timeline,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Lead not found') {
        res.status(404).json({
          success: false,
          error: 'Lead not found',
        });
        return;
      }

      logger.error({ error }, 'Failed to get lead timeline');
      res.status(500).json({
        success: false,
        error: 'Failed to get lead timeline',
      });
    }
  }
}

export const leadController = new LeadController();
