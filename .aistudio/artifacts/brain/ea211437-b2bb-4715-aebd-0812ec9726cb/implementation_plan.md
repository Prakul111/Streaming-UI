# Watch History & Continue Watching Architecture

A seamless, client-side watch history and "Continue Watching" system for Streaming UI that tracks user playback, episode progression, and timestamps across movies and TV series without requiring an account.

## User Review & Critical Decisions

> [!IMPORTANT]
> The architectural direction below is grounded in your confirmed preferences from Phase 1.

- **Confirmed Storage**: Local browser storage (`localStorage`) for instant zero-latency tracking without mandatory authentication or sign-in walls.
- **Confirmed UI Placements**: Dual presentation featuring an interactive "Continue Watching" row on the Home page (directly below the Hero carousel) and a dedicated `/history` management page.
- **Confirmed Tracking Scope**: Comprehensive media metadata (title, poster, backdrop, media type, TMDB ID), last-watched timestamp, and TV series season/episode numbers with quick-resume capabilities.

---

## 1. Overview & Core Concept

- **What It Does**: Automatically captures whenever a user plays a movie or TV show episode in the `VideoPlayerModal`, stores the playback record locally, and presents an interactive "Continue Watching" shelf on the home screen as well as a full `/history` gallery.
- **Target Persona**: Streaming enthusiasts and casual viewers who want instant resumption of TV series episodes and movies across sessions on their device.
- **Key Value**: Eliminates the frustration of remembering which season and episode was last watched; enables 1-click resumption with active streaming server persistence.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Automatic Tracking on Stream Launch**:
   - User clicks "Watch Movie" or any TV Episode in `MovieDetails` or `TvDetails`.
   - `VideoPlayerModal` opens and records an upserted history item with timestamp, TMDB ID, title, artwork, and season/episode.
   - If the user steps between episodes inside the player using the `Next` or `Prev` controls, the history record seamlessly advances to the new episode.

2. **Home Screen "Continue Watching" Shelf**:
   - If history exists, a prominent "Continue Watching" row appears right below the main Hero Banner.
   - Cards display widescreen (16:9) backdrops, active episode badges (`S1 E4`), last watched relative time (`2 hours ago`), a direct **Resume** button that immediately pops open the `VideoPlayerModal`, and a quiet dismiss button (`X`) to remove finished titles.
   - If no history exists, the shelf is cleanly omitted to maintain layout cleanliness.

3. **Dedicated Watch History Page (`/history`)**:
   - Accessible via the top navigation bar and mobile drawer.
   - Filterable by type: `All`, `Movies`, `TV Shows`.
   - In-page search bar to filter history by title.
   - Action controls: "Clear All History" with a safety confirmation modal.
   - Card actions: 1-click **Resume Stream**, **View Details**, and **Remove from History**.
   - Empty state: Clean cinematic typography with an invitation to browse trending movies and TV shows.

### Visual Identity & Theme Alignment

- **Aesthetic Direction**: Cinematic dark mode adhering to the app's established design language (deep zinc/neutral-950 surfaces, hairline borders `border-white/10`, glossy specular hover effects).
- **Color Palette**: Dark canvas (`#0b0c10` and `oklch(0.141 0.005 285.823)`), pure white accents for primary playback triggers, and muted zinc typography (`text-zinc-400` / `text-zinc-500`).
- **Typography & Formatting**: Clean typographic separators (`·` and `/`) for metadata (e.g. `TV Show · Season 2 · Episode 5 · 3h ago`). Zero pill-badge clutter on static metadata cards.
- **Interactive Feedback**: Smooth card hover elevation, spring animations for item dismissal using Motion, and instant optimistic UI updates on delete.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Client-Side Storage (`localStorage`) vs. Remote Database**
  - *Chosen Approach*: `localStorage` with a reactive custom hook (`useWatchHistory`) and `storage` event synchronization.
  - *Why*: Instant access, zero configuration, zero latency, privacy-respecting, and fully operational even if remote servers or networks are intermittent.
  - *Alternatives Considered*: Supabase backend sync was considered, but requires user sign-in and remote schema setup; keeping local-first provides an immediate out-of-the-box experience while allowing future cloud sync as an optional add-on.

- **Decision 2: History Keying & Granularity**
  - *Chosen Approach*: Compound key strategy (`movie_{id}` for films; `tv_{id}` for series keeping the latest watched episode pointer).
  - *Why*: Storing a single entry per TV series pointing to the latest watched episode keeps the "Continue Watching" shelf clean (preventing a single 24-episode season from pushing all other shows off the screen).
  - *Alternatives Considered*: Storing every individual episode as a separate row was rejected because it clutters the homepage carousel.

- **Decision 3: Direct Playback Integration in History**
  - *Chosen Approach*: Mount `VideoPlayerModal` directly inside `HistoryPage` and `HomePage` so users can resume watching with a single click without having to navigate back to the details page first.

---

## 4. Technical Architecture & Data Strategy

### System & Component Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                          User Interaction                              │
│       (MovieDetails / TvDetails / HomePage / HistoryPage)              │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ opens player / advances episode
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                         VideoPlayerModal                               │
│  - Emits watch event on playback start / episode navigation            │
│  - Receives backdropPath, posterPath, and media details                │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ calls saveWatchHistoryItem()
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                  Watch History Service & Hook                          │
│                   (src/lib/watch-history.ts)                           │
│                   (src/hooks/use-watch-history.ts)                     │
│  - localStorage manager: "streaming_ui_watch_history"                  │
│  - Reactive event dispatcher (custom event + window storage sync)      │
└───────────────────┬────────────────────────────────┬───────────────────┘
                    │                                │
                    ▼                                ▼
┌──────────────────────────────────────┐  ┌──────────────────────────────┐
│  HomePage: "Continue Watching" Row   │  │    HistoryPage (/history)    │
│  - 16:9 Backdrop cards               │  │  - Category filters          │
│  - Episode badge & relative time     │  │  - Search filter             │
│  - 1-Click Resume trigger            │  │  - Clear all / Single remove │
│  - Quick remove item                 │  │  - Resume playback modal     │
└──────────────────────────────────────┘  └──────────────────────────────┘
```

### Data Model

```typescript
export interface WatchHistoryItem {
  id: string                  // e.g. "movie_550" or "tv_1399"
  tmdbId: number
  mediaType: "movie" | "tv"
  title: string
  posterPath: string | null
  backdropPath: string | null
  overview?: string
  voteAverage?: number
  releaseDate?: string
  // TV Show Specific
  season?: number
  episode?: number
  episodeTitle?: string
  totalEpisodes?: number
  // Playback Context
  lastWatchedAt: number       // Date.now() timestamp
  serverId?: string           // Last selected streaming mirror
}
```

### Key Modules to Create / Update

1. `src/lib/watch-history.ts`: Core storage service with helper functions (`getWatchHistory`, `saveWatchHistoryItem`, `removeWatchHistoryItem`, `clearWatchHistory`).
2. `src/hooks/use-watch-history.ts`: Reactive React hook listening to local storage and window broadcast events.
3. `src/components/pages/HistoryPage.tsx`: Dedicated full watch history page with filters, search, quick resume, and individual deletion.
4. `src/components/continue-watching-row.tsx`: Cinematic carousel component for the home page.
5. `src/components/video-player-modal.tsx`: Enrich props to accept `posterPath` & `backdropPath`, and automatically record/update history on mount and episode switches.
6. `src/components/pages/MovieDetails.tsx` & `TvDetails.tsx`: Pass poster/backdrop paths to `VideoPlayerModal`.
7. `src/components/navbar.tsx` & `navigation-menu-09.tsx`: Add "History" link to the desktop navigation menu and mobile sheet; fix the Base UI `<button>` ref type mismatch.
8. `src/App.tsx`: Register `/history` route in the router configuration.
