# 🚀 Conduit

> **Turn conversations into customers** with AI-powered multi-channel automation

[![Made with ❤️](https://img.shields.io/badge/Made%20with-❤️-red.svg?style=for-the-badge)](https://github.com/kostandinang/conduit-api)
[![AI Powered](https://img.shields.io/badge/🤖-AI%20Powered-blueviolet?style=for-the-badge)](https://openai.com/)
[![Fast Setup](https://img.shields.io/badge/⚡-5%20Min%20Setup-brightgreen?style=for-the-badge)](#-quick-start)

Conduit automatically manages your leads across **WhatsApp, Email, Voice, LinkedIn, and Ads** with intelligent AI responses that feel human.

## ✨ What does Conduit do?

**Think of Conduit as your 24/7 sales assistant that never sleeps.**

🎯 **Captures leads** from anywhere - your website, ads, social media  
💬 **Responds instantly** with personalized AI messages  
🔄 **Follows up automatically** across multiple channels  
📊 **Tracks everything** so you know what's working

### 🏗️ How it works

```mermaid
graph LR
    A[🌐 Lead comes in] --> B[🤖 AI analyzes]
    B --> C[💬 Smart reply sent]
    C --> D[📱 Multi-channel follow-up]
    D --> E[💰 Conversion]
```

---

## 🚀 Quick Start

**Get up and running in 5 minutes:**

### 1️⃣ Get your free database

- Sign up at [supabase.com](https://supabase.com) (takes 30 seconds)
- Create a new project and wait 2 minutes for setup

### 2️⃣ Clone and install

```bash
git clone <your-repo>
cd conduit
npm install
```

### 3️⃣ Connect your database

```bash
npm run setup
```

_Follow the prompts - it'll guide you through everything!_

### 4️⃣ Start the magic

```bash
# Terminal 1 - API Server
npm run dev

# Terminal 2 - AI Workers
npm run worker
```

🎉 **That's it!** Your automation engine is running at `http://localhost:3000`

---

## 🎮 Try It Out

**Let's create your first automated conversation:**

### 1. Create a lead

```bash
curl -X POST http://localhost:3000/lead \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Doe","email":"jane@example.com"}'
```

### 2. Send a welcome message

```bash
curl -X POST http://localhost:3000/send \
  -H "Content-Type: application/json" \
  -d '{"lead_id":"YOUR_LEAD_ID","channel":"email","content":"Hi Jane, welcome!"}'
```

### 3. Simulate customer reply

```bash
curl -X POST http://localhost:3000/reply \
  -H "Content-Type: application/json" \
  -d '{"lead_id":"YOUR_LEAD_ID","channel":"email","content":"Tell me more!"}'
```

### 4. Generate AI response

```bash
curl -X POST http://localhost:3000/ai/reply \
  -H "Content-Type: application/json" \
  -d '{"lead_id":"YOUR_LEAD_ID","channel":"email"}'
```

### 5. See the conversation timeline

```bash
curl http://localhost:3000/lead/YOUR_LEAD_ID
```

**💡 Pro tip:** Use our [Postman collection](Conduit.postman_collection.json) for a visual interface!

---

## 🛠️ What's Under the Hood

**Built with modern, reliable tech:**

- 🔥 **Node.js + TypeScript** - Fast and type-safe
- 🗄️ **Supabase** - Serverless PostgreSQL database
- 🤖 **OpenAI** - Intelligent AI responses
- ⚡ **Express.js** - Lightweight web framework
- 🔄 **PGBoss Queue** - Reliable background processing

**No Docker needed!** Everything runs on cloud services.

---

## 📊 Monitoring & Analytics

Keep track of your automation with built-in dashboards:

```bash
# View active jobs
GET /admin/jobs?status=active

# Get performance stats
GET /admin/jobs/stats

# See what's working
GET /lead/:id
```

---

## 🚀 Ready for Production

**Scale when you're ready:**

- ✅ **Horizontally scalable** - Add more workers as you grow
- ✅ **Built-in retries** - Never lose a message
- ✅ **Complete audit trail** - See every interaction
- ✅ **Multi-channel ready** - WhatsApp, Email, Voice, LinkedIn, Ads

**Deploy anywhere:** Vercel, Railway, AWS, or your favorite platform.

---

## 💡 Need Help?

- 📚 Check out the [detailed docs](docs/)
- 🐛 Found a bug? [Open an issue](https://github.com/kostandinang/conduit-api/issues)
- 💬 Have questions? Let's chat!

---

# Conduit API

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.18-000000?style=flat&logo=express&logoColor=white)](https://expressjs.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat&logo=supabase&logoColor=white)](https://supabase.com/)
[![Queue](https://img.shields.io/badge/Queue-pg--boss-purple?style=flat)](https://github.com/timgit/pg-boss)
[![AI Powered](https://img.shields.io/badge/AI-OpenAI%20Ready-FF6B6B?style=flat&logo=openai&logoColor=white)](https://openai.com/)
[![Code Style](https://img.shields.io/badge/Code%20Style-Biome-60A5FA?style=flat&logo=biome&logoColor=white)](https://biomejs.dev/)

Multi-channel automation with AI-powered responses.

Conduit routes leads through multiple messaging channels (WhatsApp, Email, Voice, LinkedIn, Ads) and communicates with automated AI replies.

## Architecture

![Architecture Diagram](docs/architecture-diagram.png)

### Key Design Decisions

1. **PostgreSQL-based Queue (pg-boss)**: No Redis needed, uses Supabase PostgreSQL for queue storage
2. **Separate API & Workers**: API enqueues jobs, workers process them asynchronously
3. **Channel Abstraction**: Generic message interface makes adding new channels trivial
4. **Event Sourcing**: Complete audit trail via events table
5. **Retry Logic**: Built-in exponential backoff for failed jobs

## Tech Stack

- **Runtime**: Node.js 18+ with TypeScript
- **API**: Express.js
- **Database**: Supabase (PostgreSQL)
- **Queue**: pg-boss (PostgreSQL-based)
- **AI**: OpenAI API (optional, mocked if not configured)
- **Validation**: Zod
- **Logging**: Pino

## Project Structure

```
conduit/
├── src/
│   ├── index.ts         # Server setup & bootstrapping
│   ├── routes/          # API route definitions
│   │   ├── index.ts     # Route aggregator
│   │   ├── health.ts    # Health check endpoints
│   │   ├── leads.ts     # Lead management routes
│   │   └── admin.ts     # Admin/monitoring endpoints
│   ├── controllers/     # Request/response handling
│   │   └── LeadController.ts
│   ├── middleware/      # Express middleware
│   │   ├── requestLogger.ts
│   │   └── errorHandler.ts
│   ├── services/        # Business logic
│   │   ├── LeadService.ts
│   │   ├── MessageService.ts
│   │   ├── AIService.ts
│   │   └── EventService.ts
│   ├── workers/         # Queue job processors
│   ├── queues/          # Queue setup and helpers
│   ├── utils/           # Config, logger, Supabase client
│   └── types/           # TypeScript interfaces
├── migrations/          # Database schema
├── docs/                # Architecture & documentation
├── scripts/             # Setup & utility scripts
├── package.json
├── tsconfig.json
└── .env.example
```

**Architecture**: Clean MVC pattern with middleware

- **Routes**: Define URL patterns and mount to controllers
- **Controllers**: Handle HTTP request/response logic
- **Middleware**: Request logging, error handling, validation
- **Services**: Contain business logic (database, queue operations)
- **Workers**: Process background jobs asynchronously

## Setup Instructions

### 1. Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier works)

### 2. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for database to be provisioned (~2 minutes)
3. Get credentials from Project Settings:
   - API URL
   - Anon key
   - Service role key
   - Database connection string (Settings -> Database -> Connection String -> URI)

### 3. Clone and Install

```bash
git clone <your-repo>
cd conduit
npm install
```

### 4. Configure Environment

**Option A: Interactive Setup (Recommended)**

```bash
npm run setup
```

This will guide you through setting up your .env file step by step.

**Option B: Manual Setup**

```bash
cp .env.example .env
# Edit .env with your Supabase credentials
```

Required environment variables:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=postgresql://postgres:[password]@db.your-project.supabase.co:5432/postgres
```

Optional:

```
OPENAI_API_KEY=sk-your-key  # Uses mocked service anyways
```

**Getting your credentials:**

1. Go to your Supabase project dashboard
2. Settings -> API: Get URL, Anon Key, Service Role Key
3. Settings -> Database -> Connection String:
   - **Recommended**: Use **"Session pooler"** connection string (port 6543)
   - This has the password already URL-encoded
   - Avoids issues with special characters in password

This checks for special characters and provides fix suggestions.

### 5. Run Migrations

In Supabase Studio (your project dashboard):

1. Go to SQL Editor
2. Open `migrations/001_initial_schema.sql`
3. Paste and run the entire file

This creates:

- `leads`, `messages`, `jobs`, `events` tables
- Indexes for performance
- pg-boss will auto-create its own tables on first run

### 6. Start the Application

**Terminal 1 - API Server:**

```bash
npm run dev
```

Server runs on http://localhost:3000

**Terminal 2 - Queue Workers:**

```bash
npm run worker
```

Both processes are required for full functionality.

## API Endpoints

### 1. Create Lead

```bash
POST /lead
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "metadata": {
    "source": "website"
  }
}
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "status": "new",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### 2. Queue Outbound Message

```bash
POST /send
Content-Type: application/json

{
  "lead_id": "uuid",
  "channel": "email",
  "content": "Hi John, thanks for your interest!"
}
```

Channels: `email`, `whatsapp`, `voice`, `linkedin`, `ads`

### 3. Simulate Inbound Reply (Webhook)

```bash
POST /reply
Content-Type: application/json

{
  "lead_id": "uuid",
  "channel": "email",
  "content": "Yes, I'm interested in learning more"
}
```

This updates lead status: `new` or `contacted` -> `replied`

### 4. Generate AI Reply

```bash
POST /ai/reply
Content-Type: application/json

{
  "lead_id": "uuid",
  "channel": "email",
  "context": "They asked about pricing"
}
```

Generates AI response and queues it for sending. Updates status: `replied` -> `engaged`

### 5. Get Lead Timeline

```bash
GET /lead/:id
```

Returns complete timeline:

```json
{
  "success": true,
  "data": {
    "lead": {
      /* lead object */
    },
    "messages": [
      /* all messages */
    ],
    "jobs": [
      /* all queue jobs */
    ],
    "events": [
      /* all events */
    ]
  }
}
```

## Postman Collection

A complete Postman collection is included with **11 pre-configured endpoints** covering all API functionality:

- Health checks and monitoring
- Lead management
- Multi-channel messaging
- AI reply generation
- Admin and queue monitoring
- Complete workflow examples

**Quick Start:**

1. Import `Conduit.postman_collection.json` into Postman
2. Start the API server (`npm run dev`)
3. Start workers (`npm run worker`)
4. Run the "Complete Flow Example" folder

For detailed setup instructions and usage examples, see the [**Postman Guide**](docs/POSTMAN_GUIDE.md).

## Testing the Flow

```bash
# 1. Create a lead
curl -X POST http://localhost:3000/lead \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Doe","email":"jane@example.com"}'

# Save the lead ID from response

# 2. Send a message
curl -X POST http://localhost:3000/send \
  -H "Content-Type: application/json" \
  -d '{
    "lead_id":"YOUR_LEAD_ID",
    "channel":"email",
    "content":"Hi Jane, welcome!"
  }'

# 3. Simulate reply
curl -X POST http://localhost:3000/reply \
  -H "Content-Type: application/json" \
  -d '{
    "lead_id":"YOUR_LEAD_ID",
    "channel":"email",
    "content":"Thanks! Tell me more"
  }'

# 4. Generate AI response
curl -X POST http://localhost:3000/ai/reply \
  -H "Content-Type: application/json" \
  -d '{
    "lead_id":"YOUR_LEAD_ID",
    "channel":"email"
  }'

# 5. Check timeline
curl http://localhost:3000/lead/YOUR_LEAD_ID
```

## Admin Endpoints

For monitoring and debugging the queue system:

### View Jobs

```bash
GET /admin/jobs?status=active&limit=50
```

Query parameters:

- `status`: Filter by job state (active, completed, failed, etc.)
- `limit`: Number of jobs to return (default: 50)

Returns job list and statistics.

### Job Statistics

```bash
GET /admin/jobs/stats
```

Returns:

- Jobs by state (active, completed, failed, etc.)
- Jobs by name (send-message, generate-ai-reply)
- Recent failures with details

### Specific Job

```bash
GET /admin/jobs/:id
```

Returns complete job details including data and output.

**⚠️ Security Note:** In production, these endpoints should be protected with authentication middleware. They are currently open for development convenience.

## State Machine

```
new -> contacted -> replied -> engaged
```

- **new**: Lead created, no outbound messages sent
- **contacted**: First outbound message sent
- **replied**: Prospect has responded
- **engaged**: AI reply generated/sent

## How It Scales

### Adding New Channels

1. Add channel type to `src/types/index.ts`
2. Implement channel adapter in `MessageService.sendViaChannel()`
3. Done! All endpoints automatically support new channel

### High Volume

- **Horizontal scaling**: Run multiple worker processes
- **Queue concurrency**: Adjust `teamSize` in workers
- **Database**: Supabase handles connection pooling
- **Rate limits**: pg-boss handles retry with exponential backoff

### Future Enhancements

- Workflow builder (conditional logic, delays, A/B testing)
- Webhook management (dynamic webhook registration)
- Analytics dashboard (conversion rates, response times)
- Real-time notifications (WebSocket for live updates)

## Development

```bash
# Run in dev mode (auto-reload)
npm run dev
npm run worker

# Build for production
npm run build
npm start

# Type checking
npx tsc --noEmit
```

## Production Deployment

1. **API Server**: Deploy to Vercel, Railway, or AWS
2. **Workers**: Deploy as separate service/container
3. **Environment**: Set production DATABASE_URL with connection pooling
4. **Monitoring**: Use Supabase logs + Pino structured logging

## Architecture Benefits

- **No Docker required**: Everything runs on Supabase
- **Simple deployment**: API + Workers can run anywhere
- **Reliable**: Built-in retry logic, transactional queue
- **Observable**: Complete audit trail via events + jobs tables
- **Extensible**: Add channels/features without refactoring
