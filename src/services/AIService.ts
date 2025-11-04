import { logger } from '../utils/logger';
import { config } from '../utils/config';
import { eventService } from './EventService';
import { messageService } from './MessageService';
import { MessageChannel } from '../types';

/**
 * AIService: Generates AI-powered responses
 *
 * Can use OpenAI API (simulated) or fallback to mock responses
 * In production, this would include:
 * - Conversation context retrieval
 * - Prompt engineering
 * - Response personalization
 * - Safety filters
 */
export class AIService {
  /**
   * Generate AI reply for a lead
   * Uses OpenAI if API key is configured, otherwise returns mock response
   */
  async generateReply(
    leadId: string,
    channel: MessageChannel,
    context?: string
  ): Promise<string> {
    logger.info({ leadId, channel }, 'Generating AI reply');

    try {
      // Get conversation history for context
      const messages = await messageService.getLeadMessages(leadId);
      const recentMessages = messages.slice(0, 5); // Last 5 messages

      let reply: string;

      if (config.openai.apiKey) {
        reply = await this.generateWithOpenAI(recentMessages, context);
      } else {
        reply = this.generateMockReply(channel, context);
      }

      await eventService.logEvent(leadId, 'ai_reply_generated', {
        channel,
        reply_preview: reply.substring(0, 100),
        used_openai: !!config.openai.apiKey,
      });

      logger.info({ leadId, replyLength: reply.length }, 'AI reply generated');

      return reply;
    } catch (error) {
      logger.error({ error, leadId }, 'Failed to generate AI reply');
      throw error;
    }
  }

  /**
   * Generate reply using OpenAI API (Mocked implementation)
   */
  private async generateWithOpenAI(
    conversationHistory: any[],
    context?: string
  ): Promise<string> {
    // Mock OpenAI implementation
    // In production, you would:
    // 1. Format conversation history
    // 2. Build system prompt
    // 3. Call OpenAI API
    // 4. Handle rate limits and errors

    logger.debug('Using simulated OpenAI to generate reply');

    // Simulated OpenAI response
    return `Thank you for your interest! Based on our conversation, I'd like to share more details. ${context || 'Let me know if you have any questions!'}`;
  }

  /**
   * Generate mock AI reply (fallback when no OpenAI key)
   * Uses simple template-based responses
   */
  private generateMockReply(channel: MessageChannel, context?: string): string {
    const templates = [
      `Thanks for reaching out! I'd love to discuss this further with you.`,
      `Great to hear from you! Let me share some information that might be helpful.`,
      `Thanks for your message! I think we could be a great fit. Here's why...`,
      `I appreciate your interest! Based on what you've shared, I have some ideas.`,
    ];

    const randomTemplate = templates[Math.floor(Math.random() * templates.length)];

    logger.debug('Using mock AI reply');

    return context
      ? `${randomTemplate} ${context}`
      : `${randomTemplate} Would you like to schedule a quick call?`;
  }
}

export const aiService = new AIService();
