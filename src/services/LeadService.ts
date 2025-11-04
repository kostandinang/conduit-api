import { supabase } from '../utils/supabase';
import { logger } from '../utils/logger';
import { eventService } from './EventService';
import { Lead, LeadStatus, CreateLeadRequest, LeadTimelineResponse } from '../types';

/**
 * LeadService: Manages lead lifecycle and state transitions
 * State machine: new -> contacted -> replied -> engaged
 */
export class LeadService {
  async createLead(data: CreateLeadRequest): Promise<Lead> {
    logger.info({ data }, 'Creating lead');

    const { data: lead, error } = await supabase
      .from('leads')
      .insert({
        name: data.name,
        email: data.email,
        phone: data.phone,
        status: 'new',
        metadata: data.metadata || {},
      })
      .select()
      .single();

    if (error) {
      logger.error({ error }, 'Failed to create lead');
      throw error;
    }

    // Log the event
    await eventService.logEvent(lead.id, 'lead_created', {
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
    });

    logger.info({ leadId: lead.id }, 'Lead created successfully');
    return lead;
  }

  async getLead(leadId: string): Promise<Lead | null> {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data;
  }

  async updateLeadStatus(
    leadId: string,
    newStatus: LeadStatus,
    reason?: string
  ): Promise<void> {
    logger.info({ leadId, newStatus, reason }, 'Updating lead status');

    const lead = await this.getLead(leadId);
    if (!lead) throw new Error('Lead not found');

    const oldStatus = lead.status;

    const { error } = await supabase
      .from('leads')
      .update({ status: newStatus })
      .eq('id', leadId);

    if (error) throw error;

    await eventService.logEvent(leadId, 'lead_status_changed', {
      old_status: oldStatus,
      new_status: newStatus,
      reason,
    });

    logger.info({ leadId, oldStatus, newStatus }, 'Lead status updated');
  }

  /**
   * Get complete timeline for a lead: lead info, messages, jobs, events
   * This is what the GET /lead/:id endpoint returns
   */
  async getLeadTimeline(leadId: string): Promise<LeadTimelineResponse> {
    const lead = await this.getLead(leadId);
    if (!lead) throw new Error('Lead not found');

    // Fetch all related data in parallel
    const [messagesResult, jobsResult, eventsResult] = await Promise.all([
      supabase
        .from('messages')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false }),
      supabase
        .from('jobs')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false }),
      supabase
        .from('events')
        .select('*')
        .eq('lead_id', leadId)
        .order('timestamp', { ascending: false }),
    ]);

    if (messagesResult.error) throw messagesResult.error;
    if (jobsResult.error) throw jobsResult.error;
    if (eventsResult.error) throw eventsResult.error;

    return {
      lead,
      messages: messagesResult.data || [],
      jobs: jobsResult.data || [],
      events: eventsResult.data || [],
    };
  }
}

export const leadService = new LeadService();
