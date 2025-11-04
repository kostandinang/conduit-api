# Postman Collection Guide

## Import Instructions

1. Open Postman
2. Click **Import** button (top left)
3. Select `Conduit.postman_collection.json`
4. Collection will appear in your workspace

## Collection Overview

The collection includes **11 endpoints** organized into 5 folders:

### 1. Health Checks
- Basic Health Check
- Detailed Health Check (includes uptime, memory)

### 2. Lead Management
- Create Lead (auto-saves lead ID)
- Get Lead Timeline (complete history)

### 3. Messaging
- Send Message (queue outbound message)
- Simulate Inbound Reply (webhook simulation)
- Generate AI Reply (AI-powered response)

### 4. Admin & Monitoring
- View All Jobs (filter by status)
- Get Job Statistics (counts, recent failures)
- Get Specific Job (detailed job info)

### 5. Complete Flow Example
- 6-step workflow showing full lead lifecycle

## Collection Variables

The collection uses variables that are automatically managed:

- `baseUrl`: API base URL (default: `http://localhost:3000`)
- `leadId`: Automatically saved when you create a lead
- `jobId`: Automatically saved when jobs are created

**To change the base URL:**
1. Click on the collection name
2. Go to **Variables** tab
3. Update `baseUrl` value
4. Click **Save**

## Quick Start

### Option 1: Test Individual Endpoints

1. **Create a Lead**
   - Go to `Lead Management` → `Create Lead`
   - Click **Send**
   - Lead ID is automatically saved ✓

2. **Send a Message**
   - Go to `Messaging` → `Send Message`
   - Click **Send** (uses saved lead ID)

3. **Check Timeline**
   - Go to `Lead Management` → `Get Lead Timeline`
   - Click **Send**

### Option 2: Run Complete Flow

The **Complete Flow Example** folder has a 6-step workflow:

1. Create Lead
2. Send Initial Message
3. Simulate Prospect Reply
4. Generate AI Response
5. Check Complete Timeline
6. Monitor Jobs

**Run all steps:**
- Right-click the folder
- Select **Run folder**
- Click **Run Conduit API**

Wait a few seconds between steps for workers to process jobs.

## Example Requests

### Create a Lead
```json
POST /lead
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "phone": "+1234567890",
  "metadata": {
    "source": "website",
    "campaign": "spring-2024"
  }
}
```

### Send Message
```json
POST /lead/send
{
  "lead_id": "{{leadId}}",
  "channel": "email",
  "content": "Hi John, thanks for your interest!"
}
```

**Channels:** `email`, `whatsapp`, `voice`, `linkedin`, `ads`

### Generate AI Reply
```json
POST /lead/ai/reply
{
  "lead_id": "{{leadId}}",
  "channel": "email",
  "context": "They asked about pricing. Emphasize value."
}
```

## Monitoring Jobs

### View Active Jobs
```
GET /admin/jobs?status=active&limit=50
```

### Get Statistics
```
GET /admin/jobs/stats
```

Returns:
```json
{
  "byState": {
    "completed": 45,
    "active": 3,
    "failed": 2
  },
  "byName": {
    "send-message": 30,
    "generate-ai-reply": 20
  },
  "recentFailures": [...]
}
```

## State Machine

Track lead progression through states:

```
new → contacted → replied → engaged
```

- **new**: Lead created
- **contacted**: First message sent
- **replied**: Prospect responded
- **engaged**: AI reply generated

## Auto-Save Scripts

The collection includes test scripts that automatically save IDs:

**Create Lead** - Saves lead ID:
```javascript
if (pm.response.code === 201) {
    const jsonData = pm.response.json();
    pm.collectionVariables.set('leadId', jsonData.data.id);
}
```

**Send Message** - Saves job ID:
```javascript
if (pm.response.code === 200) {
    const jsonData = pm.response.json();
    pm.collectionVariables.set('jobId', jsonData.data.job_id);
}
```

## Tips

1. **Always start by creating a lead** - This sets the `leadId` variable
2. **Wait for workers** - If testing queue jobs, wait 2-3 seconds for workers to process
3. **Check timeline** - Use `GET /lead/:id` to see complete history
4. **Monitor jobs** - Use admin endpoints to track job processing
5. **Run folder** - Right-click any folder to run all requests in sequence

## Troubleshooting

### "Lead not found" error
- Make sure you created a lead first
- Check that `leadId` variable is set (Collection → Variables)

### Jobs not processing
- Ensure worker process is running: `npm run worker`
- Check job status: `GET /admin/jobs/stats`

### Invalid UUID error
- The saved `leadId` might be empty
- Manually create a lead and copy the ID

## Environment Setup

If deploying to staging/production, create environments:

1. Click **Environments** (left sidebar)
2. Create new environment (e.g., "Production")
3. Add variable: `baseUrl` = `https://your-domain.com`
4. Select environment from dropdown (top right)

## Next Steps

- Import the collection
- Start the API: `npm run dev`
- Start workers: `npm run worker`
- Run the **Complete Flow Example**
- Watch the logs to see jobs processing

Happy testing! 🚀
