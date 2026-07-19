# 🎬 Reusable Streaming UI

A premium, feature-rich, and highly responsive cinematic streaming web application interface built with **React**, **TypeScript**, **Vite**, and **Tailwind CSS**. It fetches dynamic media details directly from the TMDB database and embeds high-quality streaming players.

Made with ♥️ by [Prakul](https://github.com/Prakul111).

---

## 🌟 Key Features

### 📺 Integrated Media Player (Vixsrc API)
- Implemented standard support for the `vixsrc.to` player API.
- **Movies**: Watch movies directly inside a full-theater modal overlay.
- **TV Shows**: Start streaming instantly from the hero card (defaults to S1 E1) or play individual episodes directly from the season episode listings.
- **Custom Player Branding**: Embed parameters customized with a purple theme accent (`#a855f7`) to align with the visual design.
- **Auto-Play & Controls**: Autoplay and episode selector controls are enabled by default for seamless TV series progression.

### 📐 High-Fidelity 3D Hover-Tilt Cards
- Re-implemented the card hover animations from static CSS sectors to **dynamic cursor-tracking math** in React.
- Elements tilt and scale in 3D perspective based on the exact coordinates of your pointer, mirroring premium user interfaces like the Apple TV.
- 100% browser-agnostic (does not rely on `:has()` selectors or grid overlays) to prevent clipping or flickering.

### 🔍 Global Search Functionality
- Integrated search inputs directly into the header navbar.
- Supports native submissions via clicking the search button or pressing the `Enter` key.
- Searches movies and TV shows concurrently via TMDB's `search/multi` endpoint and presents results in a paginated grid.

### 💡 Responsive Layout & Dark/Light Mode
- Features a premium theme toggler in the header with smooth layout transitions.
- Light mode variables are fully polished to maintain high accessibility contrast across badges, episode titles, and highlights.

### 🎥 Cinema-Style 404 Error Page
- A customized 404 page featuring glowing neon purple elements and film iconography.
- Incorporates dynamic "Go back Home" and "Previous Page" navigation options.

---

## 🛠️ Technology Stack

- **Core Framework**: [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler & Tooling**: [Vite](https://vite.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [daisyUI](https://daisyui.com/)
- **Components**: [shadcn/ui](https://ui.shadcn.com/) + [Base UI](https://base-ui.com/)
- **Data Fetching**: [TanStack Query (React Query)](https://tanstack.com/query/latest)
- **Routing**: [React Router](https://reactrouter.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 📁 Project Structure

```text
├── public/
│   ├── _redirects             # Fallback route rules for SPAs (Cloudflare Pages/Netlify)
│   └── vite.svg
├── src/
│   ├── api/                   # TMDB query wrappers (fetch-movie, fetch-tv-shows, fetch-search)
│   ├── assets/                # Local SVG assets & image resources
│   ├── components/            # UI components and modules
│   │   ├── pages/             # Page views (MovieDetails, TvDetails, SearchPage, ErrorPage)
│   │   ├── ui/                # Core visual design blocks (buttons, inputs, cards)
│   │   ├── navbar.tsx         # Fixed global header with search and theme togglers
│   │   ├── footer.tsx         # Centered footer with developer credits
│   │   └── video-player-modal.tsx # Iframe player wrapper for Vixsrc streaming embeds
│   ├── lib/                   # Helper functions (utils.ts)
│   ├── App.tsx                # App router declaration & Provider wrappers
│   ├── index.css              # Custom Tailwind theme overrides & global styling rules
│   └── main.tsx               # DOM entrypoint
├── components.json            # shadcn UI config
├── package.json
└── tsconfig.json
```

---

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) and [pnpm](https://pnpm.io/) installed.

### 1. Clone the repository
```bash
git clone https://github.com/Prakul111/Streaming-UI.git
cd Streaming-UI
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory and add your TMDB Read Access API token (Bearer token):
```env
VITE_TMDB_API=your_tmdb_read_access_token_here
```

### 3. Install Dependencies
```bash
pnpm install
```

### 4. Start Development Server
```bash
pnpm dev
```
Open your browser and navigate to `http://localhost:5173`.

---

## 🌐 Deployment

### Cloudflare Pages & Netlify (SPA Fallback)
Vite generates a Single Page Application (SPA) where routing is handled on the client. To prevent `404 Not Found` errors when refreshing routes directly, this project includes a [public/_redirects](file:///home/prakul/Documents/Coding/2026 Coding/Reusable-Streaming-UI/public/_redirects) file.

When deploying to **Cloudflare Pages** or **Netlify**:
1. Connect your repository.
2. Select the **Vite** preset (Build command: `pnpm run build`, output directory: `dist`).
3. Add `VITE_TMDB_API` as an environment variable in the host settings dashboard.
4. Deploy! The redirect rule is applied automatically.
