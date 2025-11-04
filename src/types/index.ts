// Core domain types
export type LeadStatus = 'new' | 'contacted' | 'replied' | 'engaged';

export type MessageChannel = 'email' | 'whatsapp' | 'voice' | 'linkedin' | 'ads';

export type MessageDirection = 'inbound' | 'outbound';

export type MessageStatus = 'queued' | 'sent' | 'failed' | 'delivered';

export type JobStatus = 'active' | 'completed' | 'failed' | 'retry';

export type EventType =
	| 'lead_created'
	| 'lead_status_changed'
	| 'message_queued'
	| 'message_sent'
	| 'message_failed'
	| 'reply_received'
	| 'ai_reply_generated';

export interface Lead {
	id: string;
	name: string;
	email?: string;
	phone?: string;
	status: LeadStatus;
	metadata?: Record<string, any>;
	created_at: string;
	updated_at: string;
}

export interface Message {
	id: string;
	lead_id: string;
	channel: MessageChannel;
	direction: MessageDirection;
	content: string;
	status: MessageStatus;
	error?: string;
	sent_at?: string;
	created_at: string;
}

export interface Job {
	id: string;
	lead_id: string;
	job_name: string;
	status: JobStatus;
	attempts: number;
	max_attempts: number;
	error?: string;
	created_at: string;
	completed_at?: string;
}

export interface Event {
	id: string;
	lead_id: string;
	event_type: EventType;
	payload: Record<string, any>;
	timestamp: string;
}

// API request/response types
export interface CreateLeadRequest {
	name: string;
	email?: string;
	phone?: string;
	metadata?: Record<string, any>;
}

export interface SendMessageRequest {
	lead_id: string;
	channel: MessageChannel;
	content: string;
}

export interface ReplyRequest {
	lead_id: string;
	channel: MessageChannel;
	content: string;
}

export interface AIReplyRequest {
	lead_id: string;
	channel: MessageChannel;
	context?: string;
}

export interface LeadTimelineResponse {
	lead: Lead;
	messages: Message[];
	jobs: Job[];
	events: Event[];
}

// Queue job data types
export interface SendMessageJobData {
	message_id: string;
	lead_id: string;
	channel: MessageChannel;
	content: string;
}

export interface GenerateAIReplyJobData {
	lead_id: string;
	channel: MessageChannel;
	context?: string;
}
