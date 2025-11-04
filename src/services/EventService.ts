import { supabase } from '../utils/supabase';
import { logger } from '../utils/logger';
import { EventType } from '../types';

/**
 * EventService: Handles audit logging of all system events
 *
 * This provides a complete audit trail for debugging and analytics.
 * All state changes and actions flow through this service.
 */
export class EventService {
  async logEvent(
    leadId: string,
    eventType: EventType,
    payload: Record<string, any> = {}
  ): Promise<void> {
    try {
      const { error } = await supabase.from('events').insert({
        lead_id: leadId,
        event_type: eventType,
        payload,
        timestamp: new Date().toISOString(),
      });

      if (error) throw error;

      logger.info({
        event: eventType,
        leadId,
        payload,
      }, 'Event logged');
    } catch (error) {
      logger.error({ error, leadId, eventType }, 'Failed to log event');
      // Don't throw - event logging failures shouldn't break the main flow
    }
  }

  async getLeadEvents(leadId: string) {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('lead_id', leadId)
      .order('timestamp', { ascending: false });

    if (error) throw error;
    return data;
  }
}

export const eventService = new EventService();
