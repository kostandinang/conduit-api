# Conduit API: Architecture Decisions

## Architecture Overview

![Conduit API Architecture](architecture-diagram.png)

_The diagram above shows the complete system architecture with API layer, service layer, queue system, workers, database, and external integrations._

## Core Technology Choices

### Queue System: pg-boss

- **Why**: Works with existing Supabase PostgreSQL, atomic transactions, built-in retries
- **Trade-off**: Slightly slower than Redis (~5ms vs 1ms per job)

### Database: Four-table schema

- Tables: leads, messages, jobs, events
- **Why**: Clean separation, channel abstraction, audit trail
- **Trade-off**: More joins for complex queries

### Architecture: Separate API + Workers

- **Why**: Independent scaling, fault isolation, resource optimization
- **Trade-off**: More complex deployment

## Key Patterns

### Event Sourcing

- Log all state changes to events table
- **Benefits**: Debugging, compliance, analytics, rollback capability
- **Cost**: 10-20% extra writes

### Error Handling

- Retry with exponential backoff (1s, 2s, 4s delays)
- Dead letter queue for manual review after 3 failures
- **Benefits**: Handles transient API failures gracefully

### Channel Abstraction

```typescript
interface ChannelAdapter {
  send(message: Message): Promise<void>;
  validate(content: string): boolean;
  formatContent(content: string): string;
}
```

- **Benefits**: Easy to add channels (~30 lines), consistent API
- **Trade-off**: Less channel-specific control initially

## Infrastructure Decisions

### Supabase vs Self-hosted

- **Choice**: Managed Supabase
- **Why**: Faster development, built-in features, automatic scaling
- **Trade-off**: Vendor dependency (mitigated: standard PostgreSQL)

### AI Integration

- OpenAI API with mock fallback for development
- **Benefits**: Cost control, provider flexibility, context-aware responses
- **Future**: Prompt optimization and safety filters in weeks 5-6

### Development Stack

- **TypeScript**: Type safety, better tooling, self-documenting
- **Pino Logging**: JSON-structured, searchable, high performance

## Scaling Improvements & Better Tooling

### Current → Future Tooling Progression

#### Monitoring & Observability

- **Current**: Basic Pino logs
- **Scale**: Add Datadog/New Relic APM, Sentry error tracking
- **Benefits**: Performance insights, error aggregation, alerting
- **Timeline**: Month 2-3 when handling 1k+ daily requests

#### Queue Management

- **Current**: pg-boss with basic retry logic
- **Scale**: Bull Dashboard or custom admin panel for queue monitoring
- **Benefits**: Visual job tracking, manual retry, queue health metrics
- **Timeline**: When managing 100+ jobs/hour

#### Database Optimization

- **Current**: Simple Supabase setup
- **Scale**: Connection pooling (PgBouncer), read replicas, query optimization
- **Benefits**: Handle 10x more concurrent connections, faster reads
- **Timeline**: 50k+ records or 100+ concurrent users

#### Container Orchestration

- **Current**: Simple deployment
- **Scale**: Docker + Kubernetes/ECS for auto-scaling
- **Benefits**: Zero-downtime deployments, automatic scaling, resource limits
- **Timeline**: Multiple environments or 10+ workers needed

#### Testing Infrastructure

- **Current**: Basic unit tests
- **Scale**: Integration tests, load testing (k6), E2E automation
- **Benefits**: Catch regressions, performance benchmarks, confidence in deploys
- **Timeline**: Month 2 when feature velocity increases

#### CI/CD Pipeline

- **Current**: Manual deployment
- **Scale**: GitHub Actions with staging/prod environments, automated rollbacks
- **Benefits**: Faster, safer deployments, environment parity
- **Timeline**: Multiple developers or weekly releases

#### Configuration Management

- **Current**: Environment variables
- **Scale**: Vault/AWS Secrets Manager, feature flags (LaunchDarkly)
- **Benefits**: Secure secret rotation, gradual feature rollouts
- **Timeline**: Production deployment or multiple environments

#### API Gateway & Rate Limiting

- **Current**: Express.js direct
- **Scale**: Kong/AWS API Gateway with rate limiting, caching
- **Benefits**: DDoS protection, analytics, API versioning
- **Timeline**: Public API or 1k+ requests/minute

## When to Reconsider

| Decision             | Trigger                      |
| -------------------- | ---------------------------- |
| pg-boss              | 10k+ jobs/second needed      |
| Separate API/workers | Never (best practice)        |
| Event sourcing       | Low-compliance requirements  |
| Supabase             | 1M+ records or cost concerns |
| AI integration       | Week 5-6 optimization phase  |
