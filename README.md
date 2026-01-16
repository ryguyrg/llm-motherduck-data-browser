# Mash - LLM MotherDuck Data Browser

A conversational data analysis interface powered by Gemini that connects to MotherDuck databases through the Model Context Protocol (MCP). Built with Next.js and deployable to Vercel.

## Features

### Data Analysis
- Powered by **Gemini 3 Flash** via OpenRouter
- Natural language queries to explore and analyze data
- Automatic SQL generation and execution

### Data Visualization

- **HTML Reports**: Tufte-style visualizations rendered in iframes
- **Interactive Charts**: Line, bar, pie, and XmR charts via Recharts
- **Interactive Maps**: Geographic visualizations with Leaflet
- **Sparklines**: Inline mini-charts in markdown tables
- **Markdown**: Standard markdown with GitHub-flavored extensions

### Sharing

- **Shareable Reports**: HTML reports can be shared via unique URLs
- **30-day Expiration**: Shared reports expire after 30 days
- **Follow-up Questions**: Users can ask follow-up questions from shared reports
- **Context Preservation**: Follow-up questions include the original report as context

### Other Features

- **Mobile Support**: Responsive layout with mobile-optimized reports
- **Metadata Caching**: Database schema metadata for faster queries
- **Request Cancellation**: Clear chat stops backend model execution
- **Retry Logic**: Automatic retries for transient API errors

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
│  Next.js React App (ChatInterface.tsx)                      │
└─────────────────────┬───────────────────────────────────────┘
                      │ SSE Stream
┌─────────────────────▼───────────────────────────────────────┐
│                     API Route                                │
│  /api/chat/route.ts                                         │
│  - Prompt composition from markdown files                   │
│  - Tool execution                                           │
│  - HTML content storage                                     │
└─────────────────────┬───────────────────────────────────────┘
                      │
        ┌─────────────┴─────────────┐
        ▼                           ▼
┌───────────────────┐    ┌─────────────────────┐
│   OpenRouter      │    │   MCP Server        │
│   (Gemini API)    │    │   (MotherDuck)      │
│                   │    │   - query           │
│                   │    │   - list_tables     │
│                   │    │   - list_columns    │
└───────────────────┘    └─────────────────────┘
```

## Database

### PostgreSQL (via Neon)

Stores shared HTML reports:

```sql
CREATE TABLE shares (
  id VARCHAR(255) PRIMARY KEY,
  html_content TEXT NOT NULL,
  model VARCHAR(255),
  is_mobile BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL
);
```

### MotherDuck (via MCP)

Analytics database accessed through the Model Context Protocol.

## Environment Variables

```bash
# OpenRouter API (for LLM access)
OPENROUTER_API_KEY=sk-or-...

# MotherDuck (for MCP database access)
MOTHERDUCK_TOKEN=...

# PostgreSQL (for shared reports storage)
PLANETSCALE_DATABASE_URL=postgresql://...
```

## Development

```bash
# Install dependencies
npm install

# Initialize database (first time only)
npm run db:init

# Start development server
npm run dev

# Build for production
npm run build
```

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── chat/route.ts      # Main chat API endpoint
│   │   └── db/route.ts        # Database operations
│   ├── components/
│   │   └── ChatInterface.tsx  # Main chat UI component
│   ├── share/[id]/route.ts    # Shared report viewer
│   ├── globals.css            # Global styles
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Home page
├── lib/
│   ├── mcp-client.ts          # MCP client for MotherDuck
│   └── planetscale.ts         # PostgreSQL client
├── prompts/                   # All prompt markdown files
├── scripts/
│   └── init-db.ts             # Database initialization
└── eastlake_metadata.md       # Database schema metadata
```

## License

MIT
