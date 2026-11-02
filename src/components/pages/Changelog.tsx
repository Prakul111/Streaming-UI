import { useState } from "react"
import {
  Sparkles,
  Zap,
  CheckCircle2,
  Calendar,
  Search,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface ChangelogItem {
  type: "feat" | "perf" | "fix" | "ui"
  title: string
  description: string
  tag?: string
}

interface ChangelogRelease {
  version: string
  date: string
  tagline: string
  badge: "Latest" | "Major" | "Stable"
  highlights: string[]
  items: ChangelogItem[]
}

const RELEASES: ChangelogRelease[] = [
  {
    version: "v2.4.3",
    date: "November 2, 2026",
    tagline: "Streaming Server Health Overhaul, Browser Embed Security Fixes & Smart Failover",
    badge: "Latest",
    highlights: [
      "Fixed Zen, Firefox, and Chrome iframe embed blocking by implementing referrerPolicy='no-referrer'",
      "Resolved Cloudflare 403 'Blocked from service' on VixSrc by migrating to high-speed VidSrc PM mirror",
      "Fixed AutoEmbed Cloudflare 521 Origin error by switching endpoints to high-speed autoembed.to CDN",
      "Audited and purged 20+ dead, 404, or expired mirror domains, preserving 24 verified 1080p/4K servers",
      "Promoted VidLink to default Server 1 (#1 rank) for zero-buffering instant JW Player playback",
      "Added smart failover notification banner with 1-click 'Open in New Tab' bypass for browser security locks",
    ],
    items: [
      {
        type: "fix",
        title: "Iframe Referrer-Policy Stripping for Strict Privacy Browsers",
        description:
          "Configured `referrerPolicy='no-referrer'` on the modal video player iframe. Prevents streaming CDN origin firewalls and Cloudflare WAF rules from issuing X-Frame-Options: SAMEORIGIN blocks on third-party referers in Zen, Firefox, and Chromium.",
        tag: "Player Security",
      },
      {
        type: "fix",
        title: "VixSrc Cloudflare 403 'Blocked from Service' Resolution",
        description:
          "Migrated the VixSrc provider endpoint to VidSrc PM (`vidsrc.pm/embed/`), bypassing Cloudflare Under-Attack / IP-block restrictions while maintaining instant movie and TV episode streaming.",
        tag: "Streaming Servers",
      },
      {
        type: "fix",
        title: "AutoEmbed Cloudflare 521 Origin Error Resolution",
        description:
          "Updated AutoEmbed from the dead `player.autoembed.app` (which triggered Zen's 'Zen Can't Open This Page' warning) to the active `autoembed.to` streaming API.",
        tag: "Streaming Servers",
      },
      {
        type: "perf",
        title: "Dead Mirror Purge & 24 Verified Server Engine",
        description:
          "Conducted automated HTTP and frame-embeddability audits across all 44 server candidates. Purged 20 dead, 404, or DNS-failing mirrors (e.g. vidcorn, tryembed, streamvault, superembed) and calibrated the server fleet with 24 verified 1080p and 4K stream providers.",
        tag: "Server Fleet",
      },
      {
        type: "feat",
        title: "Smart Failover & 1-Click 'Open in Tab' External Bypass",
        description:
          "Added an automated 6.5s load timeout detector in the video player modal. If browser security or adblockers stall the embed, users are provided with an inline failover banner recommending the next ranked server or a 1-click external window launch.",
        tag: "UX",
      },
      {
        type: "perf",
        title: "Promoted VidLink as Default Primary Server",
        description:
          "Set VidLink as the default primary server (`DEFAULT_SERVER_ID = 'vidlink'`), delivering immediate responsive playback, adaptive bitrates, and multi-language subtitles without buffering.",
        tag: "Performance",
      },
    ],
  },
  {
    version: "v2.4.2",
    date: "October 31, 2026",
    tagline: "Navbar 'More' Dropdown Consolidation & Navigation Streamlining",
    badge: "Stable",
    highlights: [
      "Consolidated Anime, People, Add Server, and Changelog into a unified 'More' dropdown menu",
      "Interactive 'Add Server' modal trigger integration from navigation menu with zero page reload",
      "Intelligent route active indicator lighting up 'More' across /anime, /people, and /changelog",
      "Streamlined desktop navbar from 7 loose links down to 5 high-focus primary categories",
      "Cleaned unused imports and lambda parameters across build files for zero TypeScript warnings",
    ],
    items: [
      {
        type: "ui",
        title: "Navbar 'More' Dropdown Menu",
        description:
          "Replaced individual standalone navbar links for Anime, People, Add Server, and Changelog with a sleek, consolidated 'More' dropdown menu in the desktop navigation bar.",
        tag: "Navbar",
      },
      {
        type: "feat",
        title: "Navigation Menu Add Server Action Trigger",
        description:
          "Wired Base UI's NavigationMenuLink with an interactive click handler that directly triggers the SubmitServerModal sandbox without causing route changes or unmounting.",
        tag: "Navigation",
      },
      {
        type: "ui",
        title: "Multi-Route Active State Tracking",
        description:
          "Implemented smart route detection (`isMoreActive`) that highlights the 'More' dropdown trigger whenever the user navigates to /anime, /people, /person-details, or /changelog.",
        tag: "UX",
      },
      {
        type: "fix",
        title: "TypeScript Strict Unused Locals Cleanup",
        description:
          "Removed unused icon imports and unreferenced lambda arguments in Changelog.tsx, ensuring 100% clean typecheck and fast production bundle generation.",
        tag: "Build Fix",
      },
    ],
  },
  {
    version: "v2.4.1",
    date: "October 31, 2026",
    tagline: "Movie Details Dropdown Stacking Fix, TV Trailer Card & Player Bar Synchronization",
    badge: "Major",
    highlights: [
      "Fixed server dropdown clipping behind floating metadata bar with smart viewport collision detection (openUpwards)",
      "Replaced redundant TV Show hero 'Latest Episode' card with high-res 'Official Trailer' preview card",
      "Synchronized horizontal server strip below video player modal with dynamically ranked latency list",
      "Fixed layout spacing and margin collapse between Play, Trailer, and Server buttons",
      "Enhanced z-index layering and container isolation preventing hero element occlusion",
    ],
    items: [
      {
        type: "fix",
        title: "Movie Page Server Dropdown Stacking Context & Clipping Fix",
        description:
          "Resolved critical layout issue where opening the server selector dropdown caused options to slide underneath the floating metadata bar. Added collision-aware upwards opening (`openUpwards`), elevated z-indices to z-50, and isolated parent stacking contexts.",
        tag: "Dropdown Fix",
      },
      {
        type: "fix",
        title: "TV Show Hero Official Trailer Card Replacement",
        description:
          "Replaced the redundant 'Latest Episode' preview card on TV Show detail hero sections with the Official Trailer card matching Movie details, fetching authentic YouTube trailer keys and enabling one-click trailer previews.",
        tag: "Hero Fix",
      },
      {
        type: "fix",
        title: "Video Player Modal Bottom Server Bar Synchronization",
        description:
          "Updated the horizontal server strip below the player modal to reflect the dynamically ranked server benchmark order instead of static default server lists, giving users instant access to the lowest-ping alternatives.",
        tag: "Player Bar",
      },
      {
        type: "fix",
        title: "Action Bar Layout & Margin Collapse Below Play/Trailer",
        description:
          "Stabilized flex layout spacing and margin gaps below the Play, Trailer, and Server Selector action bar, preventing visual crowding against the floating metadata strip across mobile and tablet breakpoints.",
        tag: "Layout Fix",
      },
      {
        type: "ui",
        title: "High-Resolution Trailer Poster Synchronization",
        description:
          "Added fallback backdrops and synchronized poster frames for trailer preview cards so empty thumbnail states are seamlessly filled with backdrop artwork.",
        tag: "Visuals",
      },
    ],
  },
  {
    version: "v2.4.0",
    date: "October 31, 2026",
    tagline: "Real-Time Preflight Server Benchmarks, Dynamic Health Ranking & Speed Test HUD",
    badge: "Major",
    highlights: [
      "Client-side parallel latency benchmark before loading detail pages with high-tech HUD radar modal",
      "Dynamic server ranking engine pinning lowest-latency mirrors (<400ms) to Rank #1",
      "In-player on-demand 'Speed Test' button in dropdown and horizontal server strips",
      "Degraded and offline server detection marked with red status badges and muted opacity",
      "New interactive in-app Changelog page (/changelog) with category filters and timeline search",
    ],
    items: [
      {
        type: "feat",
        title: "Preflight Server Benchmark Radar HUD",
        description:
          "Clicking any movie or TV show card executes a concurrent non-blocking network ping test across candidate servers, presenting a futuristic radar modal and auto-routing to the fastest verified server.",
        tag: "Preflight",
      },
      {
        type: "perf",
        title: "Dynamic Server Health & Latency Ranking Engine",
        description:
          "StreamingServerSelector and the video player bar dynamically sort mirrors from lowest ping (⚡ Optimal <500ms) down to degraded/offline servers (marked red with muted opacity).",
        tag: "Engine",
      },
      {
        type: "feat",
        title: "In-Player Speed Test Re-Benchmarking",
        description:
          "Added an interactive Speed Test button in both the server dropdown and horizontal strip to re-test server connection latency on the fly without interrupting video playback.",
        tag: "Player",
      },
      {
        type: "feat",
        title: "In-App Interactive Changelog Page (/changelog)",
        description:
          "Created a comprehensive in-app release timeline covering all versions, equipped with real-time keyword search and category filter pills (Features, Speed, Fixes, UI).",
        tag: "Changelog",
      },
      {
        type: "perf",
        title: "Non-Blocking Background Latency Probing",
        description:
          "Parallelized network latency probes using lightweight image/HEAD preflight requests with 3500ms timeouts to eliminate UI thread blocking.",
        tag: "Network",
      },
    ],
  },
  {
    version: "v2.3.0",
    date: "October 2026",
    tagline: "CinemaOS Hero Overhaul, Unobstructed Backdrops & Triple Episode Browser",
    badge: "Major",
    highlights: [
      "CinemaOS layout architecture with top navbar gradient fade & bottom-anchored content",
      "Full backdrop visibility preserved across all mobile screen sizes with zero dark tinting",
      "3 toggleable episode view modes: Carousel Cards, Grid View, and Skim List",
      "Floating glass metadata pill with authentic studio & network logos",
    ],
    items: [
      {
        type: "ui",
        title: "Unobstructed Mobile Backdrop Architecture",
        description:
          "Refactored hero banners to use top navbar gradient masks and bottom-pinned content so backdrop artwork remains crystal clear without dark central tinting.",
        tag: "Design",
      },
      {
        type: "feat",
        title: "Triple Episode Browser Modes",
        description:
          "Introduced three interactive viewing layouts for TV show episodes: Carousel Cards with horizontal snap, responsive Grid View, and dense Skim List.",
        tag: "Episodes",
      },
      {
        type: "ui",
        title: "Floating Studio & Network Metadata Bar",
        description:
          "Added translucent floating glass pills below hero sections displaying status, runtime, original language, release date, and inverted monochrome studio logos.",
        tag: "Metadata",
      },
      {
        type: "fix",
        title: "Backdrop Aspect Ratio Distortion on Mobile Devices",
        description:
          "Resolved image cropping and stretching issues on mobile viewports by anchoring hero artwork to the top-center with custom aspect ratio scaling.",
        tag: "Mobile Fix",
      },
      {
        type: "fix",
        title: "TV Series Episode Skim List Smooth Scrolling",
        description:
          "Optimized list virtualization and smooth horizontal snap scrolling on high-density season episode catalogs.",
        tag: "Performance",
      },
    ],
  },
  {
    version: "v2.2.0",
    date: "October 2026",
    tagline: "Community Submissions, Dual Storage & Interactive Sandbox",
    badge: "Major",
    highlights: [
      "Dual mode: Submit to Global Community (Supabase) vs Save to My Browser (Instant Local)",
      "Interactive Embed Sandbox evaluating live URL tokens before saving",
      "Dynamic URL template tokenizer: {tmdbId}, {imdbId}, {season}, {episode}",
      "Row Level Security (RLS) policies for secure community streaming contributions",
    ],
    items: [
      {
        type: "feat",
        title: "Dual Mode Server Storage",
        description:
          "Users can instantly save custom streaming servers directly to their browser storage (zero wait time) or submit them globally to Supabase for automated moderation.",
        tag: "Dual Mode",
      },
      {
        type: "feat",
        title: "Live URL Template Parser & Sandbox",
        description:
          "Universal token replacement engine that renders a live test iframe directly in the modal to verify server playback before committing changes.",
        tag: "Sandbox",
      },
      {
        type: "perf",
        title: "Instant Zero-Latency Browser Storage",
        description:
          "Custom servers saved locally bypass backend round-trips entirely, persisting across browser restarts in localStorage with instant read access.",
        tag: "Storage",
      },
      {
        type: "fix",
        title: "URL Template Token Sanitization",
        description:
          "Added strict regex parsing ensuring custom stream templates safely interpolate {tmdbId}, {imdbId}, {season}, and {episode} without malformed URL injection.",
        tag: "Security Fix",
      },
      {
        type: "fix",
        title: "Iframe Embedding X-Frame-Options Handling",
        description:
          "Sandbox preview alerts users immediately if a streaming mirror rejects embedding via X-Frame-Options or Content-Security-Policy headers.",
        tag: "Embed Fix",
      },
    ],
  },
  {
    version: "v2.1.0",
    date: "October 2026",
    tagline: "Automated Server Discovery Bot, Quality Badges & Daily Health Cron",
    badge: "Stable",
    highlights: [
      "Automated server probe bot running daily at 04:00 UTC via GitHub Actions",
      "Quality & speed badges: 4K, 1080p, HD, Ultra, Fast, Stable",
      "Row Level Security (RLS) on Supabase PostgreSQL tables",
      "Automated GitHub Actions CI/CD with Vercel deployment gate",
    ],
    items: [
      {
        type: "feat",
        title: "Automated Server Discovery Bot",
        description:
          "Node.js probe script testing candidate servers for HTTP 200 availability, X-Frame-Options embedding permissions, and latency.",
        tag: "Bot",
      },
      {
        type: "ui",
        title: "Resolution & Quality Badges",
        description:
          "Every server is labeled with crisp resolution tags and network speed categories to guide users toward the best viewing experience.",
        tag: "Badges",
      },
      {
        type: "perf",
        title: "Daily Scheduled Health Check Pipeline",
        description:
          "Configured GitHub Actions workflow (`server-bot.yml`) running daily automated server audits and automatically updating server availability flags in Supabase.",
        tag: "Cron",
      },
      {
        type: "fix",
        title: "Supabase Row Level Security (RLS) Public Insertion Rules",
        description:
          "Hardened database security by configuring RLS policies allowing public reads for approved servers and rate-limited public submissions for pending servers.",
        tag: "Security Fix",
      },
      {
        type: "fix",
        title: "CI/CD TypeScript & Vite Build Gate",
        description:
          "Configured strict typechecking (`tsc -b`) and asset bundle validation in GitHub Actions, preventing broken builds from deploying to production.",
        tag: "CI/CD",
      },
    ],
  },
  {
    version: "v2.0.0",
    date: "September 2026",
    tagline: "Multi-Category Catalogs, 3D Tilt Cards & Global Multi-Search",
    badge: "Major",
    highlights: [
      "Dedicated explorer hubs for Movies, TV Shows, Anime, and Cast & Crew",
      "DaisyUI 5 proportional 3D mouse tracking tilt physics",
      "Debounced instant multi-search across all media types with keyboard shortcuts (⌘K)",
      "TanStack React Query v5 caching optimization (5min fresh / 30min memory cache)",
    ],
    items: [
      {
        type: "ui",
        title: "3D Perspective Hover Tilt Physics",
        description:
          "Custom CSS 3D transforms tracking mouse movement with smooth inertia, ambient shine highlights, and rank typography.",
        tag: "3D Cards",
      },
      {
        type: "feat",
        title: "Dedicated Anime Hub",
        description:
          "Specialized anime explorer with format pills (Series, Movies), themes (Shonen, Isekai, Mecha), and airing status filters.",
        tag: "Anime",
      },
      {
        type: "feat",
        title: "Debounced Multi-Search (⌘K / Ctrl+K)",
        description:
          "Fast search bar with global keyboard shortcut querying TMDB concurrently for movies, series, and cast members.",
        tag: "Search",
      },
      {
        type: "perf",
        title: "TanStack React Query v5 Cache Tuning",
        description:
          "Configured aggressive stale time (5 minutes) and garbage collection (30 minutes) while disabling window focus refetch storms to reduce API strain.",
        tag: "Cache",
      },
      {
        type: "fix",
        title: "Search Navigation Spam & State Synchronization",
        description:
          "Fixed URL query param and input focus mismatch that previously generated redundant browser history entries while typing in the search bar.",
        tag: "Search Fix",
      },
      {
        type: "ui",
        title: "Accessible Dark & Light Theme Modes",
        description:
          "Integrated Tailwind CSS v4 and DaisyUI theme toggling with zero flash on initial page load, persisting preference in localStorage.",
        tag: "Themes",
      },
    ],
  },
  {
    version: "v1.0.0",
    date: "June 2026",
    tagline: "Initial Release — Multi-Server Streaming Foundation",
    badge: "Stable",
    highlights: [
      "44+ high-speed streaming server mirrors with instant failover switching",
      "Branded theater video player modal with automated episode advancement",
      "Full TMDB API integration with rich metadata, cast credits, and trailers",
      "Modern responsive design system powered by Tailwind CSS v4 and DaisyUI",
    ],
    items: [
      {
        type: "feat",
        title: "44+ Multi-Server Streaming Engine",
        description:
          "Comprehensive library of reliable embed servers with instant failover fallback across 4K, 1080p, and HD formats.",
        tag: "Core",
      },
      {
        type: "feat",
        title: "Branded Theater Video Player Modal",
        description:
          "Embedded video player modal with fullscreen controls, aspect ratio adaptation, and automatic next-episode queue advancement.",
        tag: "Player",
      },
      {
        type: "feat",
        title: "TMDB Cinematic Discovery Engine",
        description:
          "Deep integration with The Movie Database API providing full movie catalogs, TV seasons, cast filmographies, and media stills.",
        tag: "TMDB",
      },
      {
        type: "ui",
        title: "Tailwind CSS v4 & DaisyUI Design System",
        description:
          "Modern glassmorphic interface with custom typography, responsive grids, and high-contrast dark theme defaults.",
        tag: "Design",
      },
      {
        type: "perf",
        title: "Vite 8 Lightning Fast Bundling & HMR",
        description:
          "Configured Vite 8 with Rollup chunk splitting and code-splitting lazy routes for sub-second production page loads.",
        tag: "Build",
      },
    ],
  },
]

export default function Changelog() {
  const [filterType, setFilterType] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")

  const filteredReleases = RELEASES.map((release) => {
    const matchesSearch =
      searchQuery === "" ||
      release.version.toLowerCase().includes(searchQuery.toLowerCase()) ||
      release.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      release.highlights.some((h) => h.toLowerCase().includes(searchQuery.toLowerCase())) ||
      release.items.some(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase())
      )

    const filteredItems = release.items.filter((item) => {
      if (filterType === "all") return true
      return item.type === filterType
    })

    return {
      ...release,
      isMatch: matchesSearch && (filterType === "all" || filteredItems.length > 0),
      items: filteredItems,
    }
  }).filter((r) => r.isMatch)

  const getTypeColor = (type: ChangelogItem["type"]) => {
    switch (type) {
      case "feat":
        return "bg-purple-500/15 text-purple-300 border-purple-500/30"
      case "perf":
        return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
      case "fix":
        return "bg-amber-500/15 text-amber-300 border-amber-500/30"
      case "ui":
        return "bg-sky-500/15 text-sky-300 border-sky-500/30"
      default:
        return "bg-muted text-foreground border-border"
    }
  }

  const getTypeLabel = (type: ChangelogItem["type"]) => {
    switch (type) {
      case "feat":
        return "Feature"
      case "perf":
        return "Performance"
      case "fix":
        return "Bug Fix"
      case "ui":
        return "Design & UI"
      default:
        return "Update"
    }
  }

  return (
    <div className="w-full min-h-screen bg-[#090b10] text-foreground pb-24 selection:bg-purple-500/30 selection:text-purple-200">
      {/* Top Ambient Glow Line */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-purple-900/15 via-transparent to-transparent blur-3xl" />

      {/* Hero Header Section */}
      <section className="relative z-10 pt-28 sm:pt-32 pb-12 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-bold tracking-wider uppercase mb-5 shadow-lg shadow-purple-500/5">
          <Sparkles className="size-3.5 text-purple-400" />
          <span>Product Updates & Releases</span>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white uppercase drop-shadow-xl">
          What&apos;s New in <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-200 bg-clip-text text-transparent">Streaming UI</span>
        </h1>

        <p className="mt-4 text-sm sm:text-base md:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
          Explore our continuous journey of improvements, real-time performance upgrades,
          multi-server streaming breakthroughs, and design polish.
        </p>

        {/* Search & Filter Toolbar */}
        <div className="mt-10 max-w-2xl mx-auto flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full group">
            {/* Guaranteed visible search icon with high z-index and purple accent */}
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none z-20 text-purple-400 group-focus-within:text-purple-300 transition-colors">
              <Search className="size-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search features, fixes, or versions..."
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-400 text-sm focus:outline-none focus:border-purple-500/60 focus:bg-white/10 transition-all backdrop-blur-md shadow-inner relative z-10"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer z-20"
                title="Clear search"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md shrink-0 overflow-x-auto w-full sm:w-auto">
            {[
              { id: "all", label: "All" },
              { id: "feat", label: "Features" },
              { id: "perf", label: "Speed" },
              { id: "fix", label: "Fixes" },
              { id: "ui", label: "UI" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterType(f.id)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap",
                  filterType === f.id
                    ? "bg-purple-600 text-white shadow-sm"
                    : "text-muted-foreground hover:text-white hover:bg-white/5"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Releases Timeline Section */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 space-y-12">
        {filteredReleases.map((release) => (
          <article
            key={release.version}
            className="relative pl-6 sm:pl-8 border-l border-white/15 space-y-6"
          >
            {/* Timeline Dot Indicator */}
            <div className="absolute -left-[9px] top-1.5 size-4 rounded-full bg-purple-600 border-2 border-[#090b10] shadow-[0_0_12px_rgba(168,85,247,0.8)]" />

            {/* Release Header */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {release.version}
                </span>
                <span
                  className={cn(
                    "text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border",
                    release.badge === "Latest"
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                      : release.badge === "Major"
                      ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
                      : "bg-white/10 text-white/70 border-white/15"
                  )}
                >
                  {release.badge}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Calendar className="size-3.5" />
                <time>{release.date}</time>
              </div>
            </div>

            {/* Tagline */}
            <p className="text-base sm:text-lg font-semibold text-gray-200">
              {release.tagline}
            </p>

            {/* Highlights Card */}
            {release.highlights && release.highlights.length > 0 && (
              <div className="rounded-2xl bg-white/5 border border-white/10 p-4 sm:p-5 backdrop-blur-md shadow-lg space-y-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                  <Zap className="size-3.5 text-purple-400" />
                  Key Highlights
                </h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs sm:text-sm text-gray-300">
                  {release.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Detailed Items List */}
            {release.items && release.items.length > 0 && (
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Changes & Detailed Specifications
                </h4>
                <div className="space-y-2.5">
                  {release.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-[#121622]/60 border border-white/10 hover:border-white/20 transition-colors space-y-1.5"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border",
                            getTypeColor(item.type)
                          )}
                        >
                          {getTypeLabel(item.type)}
                        </span>
                        {item.tag && (
                          <span className="text-[10px] font-semibold text-muted-foreground bg-white/5 px-2 py-0.5 rounded">
                            {item.tag}
                          </span>
                        )}
                        <h5 className="text-xs sm:text-sm font-bold text-white">
                          {item.title}
                        </h5>
                      </div>
                      <p className="text-xs text-gray-300 leading-relaxed pl-1">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </article>
        ))}

        {filteredReleases.length === 0 && (
          <div className="p-12 text-center rounded-2xl bg-white/5 border border-white/10 space-y-3">
            <Search className="size-8 text-muted-foreground mx-auto" />
            <h3 className="text-base font-bold text-white">No releases match your query</h3>
            <p className="text-xs text-muted-foreground">
              Try adjusting your search terms or clearing the filter type.
            </p>
          </div>
        )}
      </section>
    </div>
  )
}
