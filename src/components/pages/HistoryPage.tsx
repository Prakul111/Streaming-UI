import { useState, useMemo } from "react"
import { Link } from "react-router"
import {
  Clock,
  Trash2,
  Play,
  Film,
  Tv,
  Search,
  X,
  ExternalLink,
  AlertTriangle,
  Filter,
} from "lucide-react"
import { useWatchHistory } from "@/hooks/use-watch-history"
import type { WatchHistoryItem } from "@/lib/watch-history"
import VideoPlayerModal from "../video-player-modal"
import { cn } from "@/lib/utils"

function formatRelativeTime(timestamp: number): string {
  const diffMs = Date.now() - timestamp
  const diffSec = Math.floor(diffMs / 1000)
  if (diffSec < 60) return "Just now"
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHours = Math.floor(diffMin / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays}d ago`
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export default function HistoryPage() {
  const { history, remove, clear, hasHistory } = useWatchHistory()
  const [filterType, setFilterType] = useState<"all" | "movie" | "tv">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false)
  const [activePlayItem, setActivePlayItem] = useState<WatchHistoryItem | null>(null)

  // Filter and search history items
  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      const matchesType =
        filterType === "all" ? true : item.mediaType === filterType
      const matchesSearch =
        !searchQuery.trim() ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase().trim())
      return matchesType && matchesSearch
    })
  }, [history, filterType, searchQuery])

  const movieCount = useMemo(
    () => history.filter((i) => i.mediaType === "movie").length,
    [history]
  )
  const tvCount = useMemo(
    () => history.filter((i) => i.mediaType === "tv").length,
    [history]
  )

  const handleClearAll = () => {
    clear()
    setIsConfirmClearOpen(false)
  }

  return (
    <div className="w-full min-h-[85vh] pt-24 sm:pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <div className="flex size-9 items-center justify-center rounded-xl bg-white/10 border border-white/15 text-white shadow-sm">
              <Clock className="size-5 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Watch History
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-muted dark:bg-white/10 text-muted-foreground dark:text-zinc-300 border border-border dark:border-white/10">
              {history.length}
            </span>
          </div>
          <p className="text-sm text-muted-foreground max-w-xl">
            Keep track of movies and episodes you&apos;ve watched. Resume instantly from any device session.
          </p>
        </div>

        {/* Clear All Trigger */}
        {hasHistory && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsConfirmClearOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 transition-all cursor-pointer"
            >
              <Trash2 className="size-3.5" />
              <span>Clear History</span>
            </button>
          </div>
        )}
      </div>

      {/* Controls Bar: Filters & Search */}
      {hasHistory && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-6 pb-6">
          {/* Segmented Filter Controls */}
          <div className="flex items-center gap-1 p-1 bg-muted/60 dark:bg-white/5 rounded-xl border border-border/50 dark:border-white/10 w-fit">
            <button
              type="button"
              onClick={() => setFilterType("all")}
              className={cn(
                "px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer",
                filterType === "all"
                  ? "bg-background dark:bg-white text-foreground dark:text-black font-semibold shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              All ({history.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType("movie")}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer",
                filterType === "movie"
                  ? "bg-background dark:bg-white text-foreground dark:text-black font-semibold shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Film className="size-3" />
              <span>Movies ({movieCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterType("tv")}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer",
                filterType === "tv"
                  ? "bg-background dark:bg-white text-foreground dark:text-black font-semibold shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Tv className="size-3" />
              <span>TV Shows ({tvCount})</span>
            </button>
          </div>

          {/* In-History Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search history..."
              className="w-full pl-8 pr-8 py-1.5 rounded-xl text-xs bg-muted/50 dark:bg-white/5 border border-border dark:border-white/10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Content Area */}
      {!hasHistory ? (
        /* Empty Zero State */
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 sm:p-12 my-12 border border-dashed border-border/80 dark:border-white/15 rounded-3xl bg-muted/20 dark:bg-white/[0.02]">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-muted dark:bg-white/10 text-muted-foreground dark:text-white mb-4 shadow-inner">
            <Clock className="size-8" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
            No watch history yet
          </h2>
          <p className="text-sm text-muted-foreground max-w-md mb-6">
            Whenever you stream a movie or TV show, it will be automatically saved here so you can pick up anytime.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/movie"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs sm:text-sm hover:opacity-90 transition-all shadow-md"
            >
              <Film className="size-4" />
              <span>Explore Movies</span>
            </Link>
            <Link
              to="/tv-shows"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-muted dark:bg-white/10 hover:bg-muted/80 dark:hover:bg-white/20 text-foreground dark:text-white font-semibold text-xs sm:text-sm transition-all border border-border dark:border-white/15"
            >
              <Tv className="size-4" />
              <span>Browse TV Shows</span>
            </Link>
          </div>
        </div>
      ) : filteredHistory.length === 0 ? (
        /* Search / Filter Empty State */
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 my-8 border border-border/50 rounded-2xl bg-muted/10">
          <Filter className="size-8 text-muted-foreground mb-3" />
          <h3 className="text-base font-semibold text-foreground mb-1">
            No matching titles found
          </h3>
          <p className="text-xs text-muted-foreground mb-4">
            Try adjusting your search query or switching filters.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("")
              setFilterType("all")
            }}
            className="px-4 py-2 rounded-xl bg-muted dark:bg-white/10 hover:bg-muted/80 text-xs font-semibold text-foreground transition-all cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        /* History Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 pt-2">
          {filteredHistory.map((item) => {
            const imageSrc = item.backdropPath
              ? `https://image.tmdb.org/t/p/w780${item.backdropPath}`
              : item.posterPath
              ? `https://image.tmdb.org/t/p/w500${item.posterPath}`
              : "/public/screenshots/01-home-hero.png"

            const detailUrl =
              item.mediaType === "tv"
                ? `/tv-details/${item.tmdbId}`
                : `/movie-details/${item.tmdbId}`

            return (
              <div
                key={item.id}
                className="group relative flex flex-col rounded-2xl overflow-hidden bg-[#12141c] border border-white/10 shadow-lg hover:border-white/30 hover:shadow-2xl transition-all duration-300"
              >
                {/* Visual Thumbnail */}
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-black/60">
                  <img
                    src={imageSrc}
                    alt={item.title}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />

                  {/* Top Badges: Media Type & Delete Button */}
                  <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between z-20">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-bold text-zinc-300 border border-white/10">
                      {item.mediaType === "tv" ? (
                        <>
                          <Tv className="size-3 text-zinc-400" />
                          <span>TV Series</span>
                        </>
                      ) : (
                        <>
                          <Film className="size-3 text-zinc-400" />
                          <span>Movie</span>
                        </>
                      )}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        remove(item.id)
                      }}
                      className="flex size-7 items-center justify-center rounded-full bg-black/70 text-zinc-400 hover:text-red-400 hover:bg-black border border-white/15 transition-all cursor-pointer shadow-md"
                      title="Remove from history"
                      aria-label={`Remove ${item.title} from history`}
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>

                  {/* Centered Resume Play Button Overlay */}
                  <button
                    type="button"
                    onClick={() => setActivePlayItem(item)}
                    className="absolute inset-0 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
                    aria-label={`Resume watching ${item.title}`}
                  >
                    <div className="flex size-11 items-center justify-center rounded-full bg-white text-black shadow-xl hover:scale-110 active:scale-95 transition-transform">
                      <Play className="size-4 fill-black ml-0.5" />
                    </div>
                  </button>

                  {/* Bottom Image Progress/Episode Tag */}
                  {item.mediaType === "tv" && (
                    <div className="absolute bottom-2 left-2.5 z-20">
                      <span className="px-2 py-0.5 rounded bg-white/20 backdrop-blur-md text-[11px] font-bold text-white border border-white/20">
                        Season {item.season ?? 1} · Ep {item.episode ?? 1}
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Content & Action Bar */}
                <div className="p-3.5 flex flex-col flex-1 justify-between gap-2.5 bg-[#0e1017]">
                  <div>
                    <Link
                      to={detailUrl}
                      className="text-sm font-bold text-white hover:underline line-clamp-1"
                      title={item.title}
                    >
                      {item.title}
                    </Link>

                    <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-1">
                      <span>Watched {formatRelativeTime(item.lastWatchedAt)}</span>
                      {item.voteAverage && (
                        <>
                          <span>•</span>
                          <span className="font-semibold text-amber-400">
                            ★ {item.voteAverage.toFixed(1)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                    <button
                      type="button"
                      onClick={() => setActivePlayItem(item)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-98"
                    >
                      <Play className="size-3 fill-black text-black" />
                      <span>Resume</span>
                    </button>

                    <Link
                      to={detailUrl}
                      className="flex size-8 items-center justify-center rounded-xl bg-white/5 hover:bg-white/15 text-zinc-300 hover:text-white border border-white/10 transition-all"
                      title="View Details"
                      aria-label="View Details"
                    >
                      <ExternalLink className="size-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Confirmation Modal for Clear All */}
      {isConfirmClearOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setIsConfirmClearOpen(false)}
        >
          <div
            className="w-full max-w-md bg-[#12141c] border border-white/15 rounded-2xl p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-amber-400">
              <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20">
                <AlertTriangle className="size-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Clear Watch History?</h3>
                <p className="text-xs text-zinc-400">
                  This will remove all {history.length} recorded items from this browser.
                </p>
              </div>
            </div>

            <p className="text-xs text-zinc-300">
              Your &quot;Continue Watching&quot; recommendations will also be cleared. This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmClearOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-300 hover:bg-white/10 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-500 text-white transition-all cursor-pointer shadow-md active:scale-95"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Integrated Resume Player Modal */}
      {activePlayItem && (
        <VideoPlayerModal
          isOpen={Boolean(activePlayItem)}
          onClose={() => setActivePlayItem(null)}
          title={
            activePlayItem.mediaType === "tv"
              ? `${activePlayItem.title} S${activePlayItem.season ?? 1} E${activePlayItem.episode ?? 1}`
              : activePlayItem.title
          }
          mediaType={activePlayItem.mediaType}
          tmdbId={activePlayItem.tmdbId}
          season={activePlayItem.season ?? 1}
          episode={activePlayItem.episode ?? 1}
          totalEpisodes={activePlayItem.totalEpisodes}
          selectedServerId={activePlayItem.serverId}
          posterPath={activePlayItem.posterPath}
          backdropPath={activePlayItem.backdropPath}
          overview={activePlayItem.overview}
          voteAverage={activePlayItem.voteAverage}
          releaseDate={activePlayItem.releaseDate}
          onEpisodeChange={(newSeason, newEpisode) => {
            setActivePlayItem((prev) =>
              prev
                ? {
                    ...prev,
                    season: newSeason,
                    episode: newEpisode,
                  }
                : null
            )
          }}
        />
      )}
    </div>
  )
}
