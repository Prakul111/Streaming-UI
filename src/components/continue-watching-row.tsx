import { useState, useRef } from "react"
import { Link } from "react-router"
import { Play, ChevronLeft, ChevronRight, X, Clock, Tv, Film } from "lucide-react"
import { useWatchHistory } from "@/hooks/use-watch-history"
import type { WatchHistoryItem } from "@/lib/watch-history"
import VideoPlayerModal from "./video-player-modal"

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
  const diffWeeks = Math.floor(diffDays / 7)
  if (diffWeeks < 4) return `${diffWeeks}w ago`
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  })
}

export default function ContinueWatchingRow() {
  const { history, remove, hasHistory } = useWatchHistory()
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [activePlayItem, setActivePlayItem] = useState<WatchHistoryItem | null>(null)

  if (!hasHistory) {
    return null
  }

  const handleScroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return
    const container = scrollContainerRef.current
    const scrollAmount = container.clientWidth * 0.75
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    })
  }

  return (
    <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-xl bg-white/10 border border-white/15 text-white shadow-sm">
            <Clock className="size-4 text-white" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>Continue Watching</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/10 text-zinc-300 border border-white/10">
                {history.length}
              </span>
            </h2>
            <p className="text-xs text-zinc-400">
              Pick up right where you left off
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/history"
            className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-zinc-300 hover:text-white transition-colors mr-2 hover:underline"
          >
            <span>View all</span>
            <ChevronRight className="size-3.5" />
          </Link>

          <button
            type="button"
            onClick={() => handleScroll("left")}
            className="flex size-8 items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/80 hover:text-white hover:bg-white/15 transition-all cursor-pointer"
            aria-label="Scroll left"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => handleScroll("right")}
            className="flex size-8 items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/80 hover:text-white hover:bg-white/15 transition-all cursor-pointer"
            aria-label="Scroll right"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Carousel */}
      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto pb-2 scroll-smooth no-scrollbar snap-x snap-mandatory"
      >
        {history.map((item) => {
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
              className="group relative flex-none w-[270px] sm:w-[310px] md:w-[340px] aspect-[16/9] rounded-2xl overflow-hidden bg-[#12141c] border border-white/10 shadow-lg snap-start transition-all duration-300 hover:border-white/30 hover:shadow-2xl hover:scale-[1.02]"
            >
              {/* Media Thumbnail */}
              <img
                src={imageSrc}
                alt={item.title}
                loading="lazy"
                referrerPolicy="no-referrer"
                className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Scrim Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent pointer-events-none" />

              {/* Dismiss / Remove Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  remove(item.id)
                }}
                className="absolute top-2.5 right-2.5 z-20 flex size-7 items-center justify-center rounded-full bg-black/60 text-zinc-300 hover:text-white hover:bg-black/90 border border-white/15 transition-all opacity-0 group-hover:opacity-100 cursor-pointer shadow-md"
                title="Remove from history"
                aria-label={`Remove ${item.title} from history`}
              >
                <X className="size-3.5" />
              </button>

              {/* Quick Resume Button (Centered on Hover) */}
              <button
                type="button"
                onClick={() => setActivePlayItem(item)}
                className="absolute inset-0 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
                aria-label={`Resume watching ${item.title}`}
              >
                <div className="flex size-12 items-center justify-center rounded-full bg-white text-black shadow-xl hover:scale-110 active:scale-95 transition-transform">
                  <Play className="size-5 fill-black ml-0.5" />
                </div>
              </button>

              {/* Bottom Card Content */}
              <div className="absolute bottom-0 inset-x-0 p-3 sm:p-3.5 z-20 flex flex-col justify-end pointer-events-auto">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-300 mb-1">
                  <span className="inline-flex items-center gap-1">
                    {item.mediaType === "tv" ? (
                      <>
                        <Tv className="size-3 text-zinc-400" />
                        <span>S{item.season ?? 1} · E{item.episode ?? 1}</span>
                      </>
                    ) : (
                      <>
                        <Film className="size-3 text-zinc-400" />
                        <span>Movie</span>
                      </>
                    )}
                  </span>
                  <span>•</span>
                  <span className="text-zinc-400">{formatRelativeTime(item.lastWatchedAt)}</span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <Link
                    to={detailUrl}
                    className="text-xs sm:text-sm font-bold text-white hover:underline truncate"
                    title={item.title}
                  >
                    {item.title}
                  </Link>

                  <button
                    type="button"
                    onClick={() => setActivePlayItem(item)}
                    className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/15 hover:bg-white text-white hover:text-black font-semibold text-[11px] transition-all cursor-pointer border border-white/15"
                  >
                    <Play className="size-2.5 fill-current" />
                    <span>Resume</span>
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Embedded Resume Video Player Modal */}
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
    </section>
  )
}
