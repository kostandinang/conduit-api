# Architecture Diagram - Rendering Guide

The architecture diagram is available in Mermaid format at `docs/ARCHITECTURE_DIAGRAM.mermaid`.

## How to Render the Diagram

### Option 1: GitHub (Automatic)

GitHub automatically renders `.mermaid` files. Just open the file in GitHub and it will display the diagram.

### Option 2: Mermaid Live Editor (Recommended for Loom)

1. Go to https://mermaid.live
2. Copy the contents of `ARCHITECTURE_DIAGRAM.mermaid`
3. Paste into the editor
4. Click "Actions" -> "PNG" or "SVG" to export
5. Use the exported image in your presentation

### Option 3: VS Code Extension

1. Install "Markdown Preview Mermaid Support" extension
2. Create a markdown file with:
   ````markdown
   ```mermaid
   [paste mermaid code here]
   ```
   ````
3. Preview the markdown file
4. Right-click diagram -> Copy Image

### Option 4: Mermaid CLI

```bash
npm install -g @mermaid-js/mermaid-cli
mmdc -i docs/ARCHITECTURE_DIAGRAM.mermaid -o architecture.png
```

### Option 5: Online Converters

- https://mermaid.ink - URL-based rendering
- https://kroki.io - REST API for diagrams

## For the Loom Video

**Best approach**: Export as high-res PNG from mermaid.live

**Alternative**: Use a simple whiteboard/Excalidraw version with boxes and arrows:

```
Frontend (Blue)
    ↓
API Layer (Green)
    ↓
Services (Orange) -> Events (Gray)
    ↓
Queue System (Purple)
    ↓
Workers (Pink) -> External APIs (Gray)
    ↓
Database (Teal)
```

## Simple ASCII Version (for README)

```
┌──────────┐
│ Frontend │
└─────┬────┘
      ↓
┌─────────────┐
│  API Layer  │
└─────┬───────┘
      ↓
┌─────────────────┐
│ Service Layer   │─────-> Events
│ (Lead, Message, │
│  AI, Event)     │
└─────┬───────────┘
      ↓
┌─────────────────┐
│  Queue System   │
│   (pg-boss)     │
└─────┬───────────┘
      ↓
┌─────────────────┐
│    Workers      │─────-> External APIs
│ (Send, AI Gen)  │       (WhatsApp, Email...)
└─────┬───────────┘
      ↓
┌──────────────────────────┐
│   Database (Supabase)    │
│ Leads | Messages | Jobs  │
└──────────────────────────┘
```

## Colors & Meaning

- **Blue (Frontend)**: User-facing layer
- **Green (API)**: HTTP request handling
- **Orange (Services)**: Business logic
- **Purple (Queue)**: Async job processing
- **Pink (Workers)**: Background job execution
- **Teal (Database)**: Data persistence
- **Gray (External)**: Third-party integrations

## Key Flows to Highlight

### 1. Send Message Flow

```
Frontend -> API -> MessageService -> Queue -> Worker -> External API -> Database
```

### 2. Inbound Reply Flow

```
External API (webhook) -> API -> MessageService -> LeadService -> EventService -> Database
```

### 3. AI Reply Flow

```
API -> AIService -> Queue -> AI Worker -> OpenAI API -> MessageService -> Queue -> Send Worker
```

## Tips for Presentation

1. **Start high-level**: Show the full diagram first
2. **Zoom into flows**: Highlight one path at a time
3. **Use a pointer**: Cursor or digital pen to trace paths
4. **Explain colors**: "Blue is frontend, green is API, etc."
5. **Show bidirectional arrows**: Database reads/writes

## Editing the Diagram

If you need to modify the Mermaid diagram:

1. Open `ARCHITECTURE_DIAGRAM.mermaid`
2. Edit in Mermaid Live Editor for instant preview
3. Save when satisfied
