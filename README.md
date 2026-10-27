# 🎬 Streaming UI

A high-performance, cinematic streaming web application interface built with **React 19**, **TypeScript**, **Vite 8**, **Tailwind CSS v4**, and **Supabase**. Powered by the TMDB API, it features a **44+ multi-server streaming engine**, dynamic **server discovery**, live **sandbox testing**, and an **automated health-probe bot**.

---

## 🌟 Key Features

### ⚡ 44+ Multi-Server Streaming Engine
- **Instant Server Failover**: Switch seamlessly between 44+ high-speed streaming mirrors (AutoEmbed, CineSRC, 2embed, VidSrc, SuperEmbed, etc.) with 4K, 1080p, and HD resolution options.
- **Smart Quality & Speed Badging**: Filter and identify servers by network latency ratings (**Ultra**, **Fast**, **Stable**) and resolution tags (**4K**, **1080p**, **HD**).
- **Embedded Theater Player**: Custom branded video player modal with automated episode advancement, fullscreen controls, and instant server switching.

### 🌐 Server Discovery & Community Moderation
- **Global & Local Dual Mode**:
  - **Submit to Community**: Submit streaming mirrors to the global Supabase moderation queue for automated verification.
  - **Save to My Browser**: Save custom servers instantly to local browser storage (`localStorage`) with zero database wait times.
- **Dynamic Template Parser**: Universal URL template engine supporting `{tmdbId}`, `{imdbId}`, `{season}`, and `{episode}` tokens.
- **Interactive Embed Sandbox**: Built-in test sandbox that evaluates live URL templates and renders an instant iframe player preview before saving.

### 🤖 Automated Server Discovery & Health Probe Bot
- **Scheduled Daily Health Checks**: GitHub Action bot (`scripts/server-discovery-bot.js`) runs daily at `04:00 UTC` to test streaming mirrors for HTTP availability, `X-Frame-Options` embedding compatibility, and round-trip network latency.
- **Automated Queue Approval**: Passes working candidate servers and approves them directly into the global database.

### 🎭 CinemaOS Hero & Responsive UI
- **Unobstructed Mobile Art**: Mobile-first cinematic hero section with intelligent gradient masking (`h-28` top navbar fade + bottom-anchored content) keeping the backdrop artwork clear and vivid.
- **Floating Metadata Strip**: Clean floating metadata card displaying series status, original language, air dates, season/episode counts, and network branding without blocking background art.
- **Triple Episode View Modes**: Interactive episode browser with 3 toggleable layout modes:
  - 🎠 **Carousel Cards**: Smooth horizontal snap carousel with still thumbnails and episode progress.
  - ⊞ **Grid View**: Compact 2-column or 3-column media grid.
  - ☰ **Compact List**: Dense vertical list for fast season skimming.

### 🔍 Comprehensive Media Discovery
- **Trending & Featured Carousels**: Cinema banner slider featuring top-rated and trending movies and TV series.
- **Multi-Category Hubs**: Dedicated explorers for **Movies**, **TV Shows**, **Anime**, and **Cast & Crew / People**.
- **Global Search**: Debounced real-time multi-search querying TMDB concurrently for titles, actors, and directors.
- **Dark & Light Mode**: Accessible high-contrast themes powered by Tailwind CSS and daisyUI.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend Framework** | [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| **Build Tool & Bundler** | [Vite 8](https://vite.dev/) |
| **Styling & Design System** | [Tailwind CSS v4](https://tailwindcss.com/) + [daisyUI](https://daisyui.com/) |
| **Backend & Database** | [Supabase](https://supabase.com/) (PostgreSQL + PostgREST + Row Level Security) |
| **State & Data Fetching** | [TanStack React Query v5](https://tanstack.com/query/latest) |
| **Routing** | [React Router v7](https://reactrouter.com/) |
| **Animations & UI Primitives** | [Motion](https://motion.dev/) + [Embla Carousel](https://www.embla-carousel.com/) + [Base UI](https://base-ui.com/) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **CI/CD** | [GitHub Actions](https://github.com/features/actions) |

---

## 📁 Project Structure

```text
├── .github/
│   └── workflows/
│       ├── ci-cd.yml              # Quality gate (typecheck + build) & Vercel deployment
│       └── server-bot.yml         # Daily automated streaming server probe bot
├── public/
│   ├── _redirects                 # SPA client-side routing fallback rule
│   └── vite.svg
├── scripts/
│   └── server-discovery-bot.js    # Node.js server health checker and mirror probe
├── src/
│   ├── api/                       # TMDB API query hooks (fetch-movie, fetch-tv-shows, fetch-anime)
│   ├── components/                # UI components
│   │   ├── pages/                 # Full-page routes (HomePage, MovieDetails, TvDetails, Anime, Search)
│   │   ├── ui/                    # Reusable UI primitives (buttons, inputs, cards)
│   │   ├── navbar.tsx             # Global navigation with search and theme toggle
│   │   ├── footer.tsx             # Application footer
│   │   ├── streaming-server-selector.tsx # Multi-server dropdown & auto-aligning picker
│   │   ├── submit-server-modal.tsx       # Dual-mode server submission & test sandbox
│   │   └── video-player-modal.tsx        # Theater streaming player modal
│   ├── hooks/                     # Custom React hooks (useStreamingServers, useDebounce)
│   ├── lib/                       # Utilities, server fixtures, parser, and Supabase client
│   ├── App.tsx                    # Route definitions and provider wraps
│   ├── index.css                  # Global styles & Tailwind v4 theme configuration
│   └── main.tsx                   # Application DOM mount
├── supabase/
│   └── schema.sql                 # SQL schema, RLS policies, and starter server seeds
├── package.json
├── pnpm-lock.yaml
└── tsconfig.json
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (version 20 or higher recommended)
- [pnpm](https://pnpm.io/) (version 10+)

### 1. Clone the Repository
```bash
git clone https://github.com/Prakul111/Streaming-UI.git
cd Streaming-UI
```

### 2. Configure Environment Variables
Create a `.env` file in the project root:
```bash
cp .env.example .env
```

Add your API credentials:
```env
# TMDB API Read Access Token (Bearer Token)
# Get from: https://www.themoviedb.org/settings/api
VITE_TMDB_API=your_tmdb_read_access_token_here

# Supabase Project URL & Anon Public Key
# Get from: Supabase Dashboard -> Settings -> API
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 3. Install Dependencies
```bash
pnpm install
```

### 4. Start Local Development Server
```bash
pnpm dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🗄️ Database Setup (Supabase)

To enable global community server submissions and automated health checks:

1. Open your project in the [Supabase Dashboard](https://supabase.com/dashboard).
2. Go to **SQL Editor** → **New query**.
3. Copy and paste the contents of [`supabase/schema.sql`](supabase/schema.sql).
4. Click **Run**.

This creates:
- The `streaming_servers` table with indexing.
- **Row Level Security (RLS)** policies allowing public reads for `approved` servers and public submissions for `pending` servers.
- Initial seed streaming mirrors.

---

## 🤖 Running the Server Discovery Bot Locally

You can test streaming mirrors and probe pending community submissions on demand:

```bash
node --env-file=.env scripts/server-discovery-bot.js
```

---

## 🔄 CI/CD & Deployment

### Automated GitHub Actions Pipeline
The repository includes automated workflows in `.github/workflows/`:
1. **`ci-cd.yml`**: Triggers on pull requests and pushes to `main`. Verifies TypeScript types (`tsc -b`), validates the Vite production bundle, and deploys directly to Vercel.
2. **`server-bot.yml`**: Daily cron job running the server discovery probe bot against candidate servers.

### GitHub Repository Secrets
Configure these in **GitHub → Settings → Secrets and variables → Actions**:

| Secret Name | Description |
| :--- | :--- |
| `VITE_TMDB_API` | TMDB API Read Access Token |
| `VITE_SUPABASE_URL` | Supabase Project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase Anon Public Key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role Secret Key *(for server bot)* |
| `VERCEL_TOKEN` | Vercel Access Token *(for automated deployment)* |

---

## 📜 Available Scripts

| Command | Action |
| :--- | :--- |
| `pnpm dev` | Starts the Vite development server with Hot Module Replacement (HMR) |
| `pnpm build` | Compiles TypeScript (`tsc -b`) and bundles for production with Vite |
| `pnpm preview` | Serves the production build locally for verification |
| `pnpm typecheck` | Validates TypeScript types across the project (`tsc --noEmit`) |
| `pnpm lint` | Runs ESLint checks |
| `pnpm format` | Formats code with Prettier and Tailwind CSS class sorting |

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
