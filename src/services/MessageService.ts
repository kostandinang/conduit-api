import {
	type Message,
	type MessageChannel,
	type MessageDirection,
	type ReplyRequest,
	SendMessageRequest,
} from '../types';
import { logger } from '../utils/logger';
import { supabase } from '../utils/supabase';
import { eventService } from './EventService';
import { leadService } from './LeadService';

/**
 * MessageService: Handles message creation and channel abstraction
 *
 * Channel-agnostic with channel-specific adapters
 * This makes it trivial to add new channels (WhatsApp, LinkedIn, etc.)
 *
 * Mock implementation: Real integration would call external APIs here
 */
export class MessageService {
	async createMessage(
		leadId: string,
		channel: MessageChannel,
		direction: MessageDirection,
		content: string
	): Promise<Message> {
		const { data: message, error } = await supabase
			.from('messages')
			.insert({
				lead_id: leadId,
				channel,
				direction,
				content,
				status: direction === 'outbound' ? 'queued' : 'delivered',
			})
			.select()
			.single();

		if (error) throw error;

		logger.info({ messageId: message.id, leadId, channel, direction }, 'Message created');

		// Log event
		await eventService.logEvent(leadId, 'message_queued', {
			message_id: message.id,
			channel,
			direction,
		});

		return message;
	}

	/**
	 * Mock message sending - in production, this would call:
	 * - SendGrid/AWS SES for email
	 * - Twilio for WhatsApp/SMS
	 * - LinkedIn API for LinkedIn
	 * etc.
	 */
	async sendMessage(messageId: string): Promise<void> {
		const { data: message, error: fetchError } = await supabase
			.from('messages')
			.select('*')
			.eq('id', messageId)
			.single();

		if (fetchError) throw fetchError;

		logger.info(
			{ messageId, channel: message.channel, content: message.content },
			`📤 MOCK SEND [${message.channel.toUpperCase()}]: ${message.content}`
		);

		try {
			// Simulate channel-specific sending
			await this.sendViaChannel(message.channel, message.content);

			// Update message status
			const { error } = await supabase
				.from('messages')
				.update({
					status: 'sent',
					sent_at: new Date().toISOString(),
				})
				.eq('id', messageId);

			if (error) throw error;

			await eventService.logEvent(message.lead_id, 'message_sent', {
				message_id: messageId,
				channel: message.channel,
			});

			logger.info({ messageId }, 'Message sent successfully');
		} catch (error) {
			logger.error({ error, messageId }, 'Failed to send message');

			await supabase
				.from('messages')
				.update({
					status: 'failed',
					error: error instanceof Error ? error.message : 'Unknown error',
				})
				.eq('id', messageId);

			await eventService.logEvent(message.lead_id, 'message_failed', {
				message_id: messageId,
				error: error instanceof Error ? error.message : 'Unknown error',
			});

			throw error;
		}
	}

	/**
	 * Channel-specific sending logic (mocked)
	 * In production, each channel would have its own adapter class
	 */
	private async sendViaChannel(channel: MessageChannel, content: string): Promise<void> {
		// Simulate network delay
		await new Promise((resolve) => setTimeout(resolve, 100));

		// Mock different channel behaviors
		switch (channel) {
			case 'email':
				logger.debug('📧 Sent via email (SendGrid/AWS SES)');
				break;
			case 'whatsapp':
				logger.debug('💬 Sent via WhatsApp (Twilio/Meta API)');
				break;
			case 'voice':
				logger.debug('📞 Sent via voice call (Twilio)');
				break;
			case 'linkedin':
				logger.debug('💼 Sent via LinkedIn (LinkedIn API)');
				break;
			case 'ads':
				logger.debug('📢 Sent via ads platform');
				break;
		}
	}

	/**
	 * Handle inbound reply from prospect
	 * This would be called by webhook endpoints in production
	 */
	async handleReply(data: ReplyRequest): Promise<Message> {
		logger.info({ leadId: data.lead_id, channel: data.channel }, 'Handling inbound reply');

		// Create inbound message
		const message = await this.createMessage(data.lead_id, data.channel, 'inbound', data.content);

		// Update lead status: contacted/new -> replied
		const lead = await leadService.getLead(data.lead_id);
		if (lead && (lead.status === 'new' || lead.status === 'contacted')) {
			await leadService.updateLeadStatus(data.lead_id, 'replied', 'Prospect replied');
		}

		// Log event
		await eventService.logEvent(data.lead_id, 'reply_received', {
			message_id: message.id,
			channel: data.channel,
			content_preview: data.content.substring(0, 100),
		});

		logger.info({ messageId: message.id, leadId: data.lead_id }, 'Reply handled');

		return message;
	}

	async getLeadMessages(leadId: string): Promise<Message[]> {
		const { data, error } = await supabase
			.from('messages')
			.select('*')
			.eq('lead_id', leadId)
			.order('created_at', { ascending: false });

		if (error) throw error;
		return data || [];
	}
}

export const messageService = new MessageService();
