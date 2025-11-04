-- Conduit: Multi-channel automation platform
-- Initial database schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Leads table
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  status VARCHAR(20) NOT NULL DEFAULT 'new',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT leads_status_check CHECK (status IN ('new', 'contacted', 'replied', 'engaged')),
  CONSTRAINT leads_contact_check CHECK (email IS NOT NULL OR phone IS NOT NULL)
);

-- Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  channel VARCHAR(20) NOT NULL,
  direction VARCHAR(10) NOT NULL,
  content TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'queued',
  error TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT messages_channel_check CHECK (channel IN ('email', 'whatsapp', 'voice', 'linkedin', 'ads')),
  CONSTRAINT messages_direction_check CHECK (direction IN ('inbound', 'outbound')),
  CONSTRAINT messages_status_check CHECK (status IN ('queued', 'sent', 'failed', 'delivered'))
);

-- Jobs table (mirrors pg-boss jobs for API visibility)
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  job_name VARCHAR(100) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,

  CONSTRAINT jobs_status_check CHECK (status IN ('active', 'completed', 'failed', 'retry'))
);

-- Events table (audit log)
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  payload JSONB DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT events_type_check CHECK (event_type IN (
    'lead_created',
    'lead_status_changed',
    'message_queued',
    'message_sent',
    'message_failed',
    'reply_received',
    'ai_reply_generated'
  ))
);

-- Indexes for performance
CREATE INDEX idx_messages_lead_id ON messages(lead_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_jobs_lead_id ON jobs(lead_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_events_lead_id ON events(lead_id);
CREATE INDEX idx_events_timestamp ON events(timestamp DESC);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_phone ON leads(phone);

-- Updated_at trigger for leads
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE leads IS 'Core lead/prospect records';
COMMENT ON TABLE messages IS 'All inbound and outbound messages across channels';
COMMENT ON TABLE jobs IS 'Queue job tracking for observability';
COMMENT ON TABLE events IS 'Audit log of all system events';
