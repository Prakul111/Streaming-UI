import { useState } from "react"
import {
  Sparkles,
  Zap,
  Film,
  CheckCircle2,
  Calendar,
  Search,
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
  screenshot?: {
    src: string
    caption: string
  }
}

const RELEASES: ChangelogRelease[] = [
  {
    version: "v2.4.0",
    date: "October 31, 2026",
    tagline: "Real-Time Preflight Server Benchmarks, Dynamic Health Ranking & TV Trailer Cards",
    badge: "Latest",
    highlights: [
      "Client-side latency benchmark before loading detail pages with high-tech HUD radar modal",
      "Dynamic server ranking with lowest-latency mirrors pinned to Rank #1",
      "In-player on-demand 'Speed Test' button in dropdown and horizontal server strips",
      "Official trailer card integration for TV Show hero sections",
      "Smart upwards/downwards dropdown positioning resolving hero stacking conflicts",
    ],
    screenshot: {
      src: "/screenshots/08-video-player-modal.png",
      caption: "Live theater player with real-time latency badges and Speed Test re-benchmarking",
    },
    items: [
      {
        type: "feat",
        title: "Preflight Server Benchmark HUD",
        description:
          "Clicking any movie or show card benchmarks candidate servers in parallel with an interactive radar modal, automatically routing to the fastest available streaming server.",
        tag: "Preflight",
      },
      {
        type: "perf",
        title: "Dynamic Server Ranking Engine",
        description:
          "StreamingServerSelector and the video player bar dynamically sort mirrors from lowest ping (⚡ Optimal <500ms) down to degraded/offline servers (marked red with muted opacity).",
        tag: "Engine",
      },
      {
        type: "feat",
        title: "In-Player Speed Test Button",
        description:
          "Added an interactive Speed Test button in both the server dropdown and horizontal strip to re-test server connection latency on the fly without interrupting video playback.",
        tag: "Player",
      },
      {
        type: "ui",
        title: "TV Show Hero Official Trailer Card",
        description:
          "Replaced the redundant 'Latest Episode' card in TV Show heroes with the Official Trailer preview card matching Movie details, featuring high-res YouTube thumbnails and one-click trailer playback.",
        tag: "Hero",
      },
      {
        type: "fix",
        title: "Hero Stacking Context & Stacking Resolution",
        description:
          "Fixed server dropdown clipping behind the floating metadata bar by introducing smart vertical detection (openUpwards) and raising hero section z-indexes.",
        tag: "UI Fix",
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
      "Full backdrop visibility preserved across all mobile screen sizes",
      "3 toggleable episode view modes: Carousel Cards, Grid View, and Skim List",
      "Floating glass metadata pill with authentic studio & network logos",
    ],
    screenshot: {
      src: "/screenshots/07-movie-details.png",
      caption: "CinemaOS Movie Details with unobstructed hero artwork and studio branding",
    },
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
    ],
    screenshot: {
      src: "/screenshots/01-home-hero.png",
      caption: "Streaming UI Home Hero with UP NEXT carousel and instant navigation",
    },
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
      "Debounced instant multi-search across all media types",
    ],
    screenshot: {
      src: "/screenshots/02-top10-rankings.png",
      caption: "Interactive 3D ranking cards with custom numbered typography",
    },
    items: [
      {
        type: "ui",
        title: "3D Perspective Hover Tilt",
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
        title: "Debounced Multi-Search",
        description:
          "Fast search bar with keyboard shortcut (Cmd+K) querying TMDB concurrently for movies, series, and cast members.",
        tag: "Search",
      },
    ],
  },
  {
    version: "v1.0.0",
    date: "June 2026",
    tagline: "Initial Release — Multi-Server Streaming Foundation",
    badge: "Stable",
    highlights: [
      "44+ high-speed streaming server mirrors with instant switching",
      "Theater video player modal with automated episode advancement",
      "Full TMDB API integration with dark/light themes",
    ],
    items: [
      {
        type: "feat",
        title: "44+ Streaming Mirrors",
        description:
          "Comprehensive library of reliable embed servers with instant failover fallback.",
        tag: "Core",
      },
      {
        type: "ui",
        title: "Modern Dark/Light Themes",
        description:
          "Accessible high-contrast styling powered by Tailwind CSS v4 and DaisyUI.",
        tag: "Theme",
      },
    ],
  },
]

export default function Changelog() {
  const [filterType, setFilterType] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

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
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search features, fixes, or versions..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-muted-foreground text-sm focus:outline-none focus:border-purple-500/60 transition-colors backdrop-blur-md"
            />
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

      {/* Visual Showcase Quick Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 mb-16">
        <div className="p-4 sm:p-6 rounded-2xl bg-[#0f131e]/70 border border-white/10 backdrop-blur-xl shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Film className="size-4 text-purple-400" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                Visual Showcase Highlights
              </h2>
            </div>
            <span className="text-xs text-muted-foreground">Click any screenshot to zoom</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {[
              { src: "/screenshots/01-home-hero.png", title: "CinemaOS Hero Banner" },
              { src: "/screenshots/08-video-player-modal.png", title: "Ranked Server Player" },
              { src: "/screenshots/07-movie-details.png", title: "Movie Details & Trailer" },
              { src: "/screenshots/02-top10-rankings.png", title: "3D Perspective Cards" },
            ].map((item, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedImage(item.src)}
                className="group relative aspect-video rounded-xl overflow-hidden border border-white/10 bg-black/60 cursor-pointer shadow-lg hover:border-purple-500/50 transition-all hover:scale-[1.02]"
              >
                <img
                  src={item.src}
                  alt={item.title}
                  className="size-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />
                <div className="absolute bottom-2 inset-x-2 text-left">
                  <span className="text-[11px] font-bold text-white drop-shadow truncate block">
                    {item.title}
                  </span>
                </div>
              </div>
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

            {/* Optional Embedded Release Screenshot */}
            {release.screenshot && (
              <div
                onClick={() => setSelectedImage(release.screenshot!.src)}
                className="group relative rounded-2xl overflow-hidden border border-white/15 bg-black/60 shadow-2xl cursor-pointer hover:border-purple-500/50 transition-all"
              >
                <img
                  src={release.screenshot.src}
                  alt={release.screenshot.caption}
                  className="w-full object-cover group-hover:scale-[1.01] transition-transform duration-500 max-h-96"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-3 inset-x-4 flex items-center justify-between text-xs text-white/90">
                  <span className="font-medium drop-shadow">{release.screenshot.caption}</span>
                  <span className="text-[11px] bg-black/60 px-2 py-0.5 rounded border border-white/15">
                    Click to Expand
                  </span>
                </div>
              </div>
            )}

            {/* Detailed Items List */}
            {release.items && release.items.length > 0 && (
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Changes & Details
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

      {/* Lightbox Image Preview Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 sm:p-8 animate-in fade-in duration-200"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-6xl max-h-[92vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 text-white/80 hover:text-white text-xs font-semibold cursor-pointer"
            >
              Close (Esc) ✕
            </button>
            <img
              src={selectedImage}
              alt="Preview"
              className="max-h-[85vh] max-w-full rounded-2xl border border-white/15 shadow-2xl object-contain"
            />
          </div>
        </div>
      )}
    </div>
  )
}
