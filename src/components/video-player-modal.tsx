import { useState, useEffect, useRef } from "react"
import {
  X,
  Loader2,
  RefreshCw,
  ExternalLink,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  Server,
  Zap,
  Sparkles,
} from "lucide-react"
import {
  STREAMING_SERVERS,
  getStreamingServer,
  getStoredServerId,
  setStoredServerId,
  getMovieEmbedUrl,
  getTvEmbedUrl,
} from "@/lib/streaming-servers"
import StreamingServerSelector from "./streaming-server-selector"
import { cn } from "@/lib/utils"

interface VideoPlayerModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  embedUrl?: string
  mediaType?: "movie" | "tv"
  tmdbId?: number | string
  imdbId?: string | null
  season?: number
  episode?: number
  totalEpisodes?: number
  onEpisodeChange?: (season: number, episode: number) => void
  selectedServerId?: string
  onServerChange?: (serverId: string) => void
}

export default function VideoPlayerModal({
  isOpen,
  onClose,
  title,
  embedUrl,
  mediaType = "movie",
  tmdbId,
  imdbId,
  season = 1,
  episode = 1,
  totalEpisodes,
  onEpisodeChange,
  selectedServerId,
  onServerChange,
}: VideoPlayerModalProps) {
  // Active server resolution: prefer local user selection in modal, then parent prop, then stored preference
  const [localServerId, setLocalServerId] = useState<string>(() => selectedServerId ?? getStoredServerId())

  useEffect(() => {
    if (selectedServerId) {
      setLocalServerId(selectedServerId)
    }
  }, [selectedServerId])

  const activeServerId = localServerId || selectedServerId || getStoredServerId()
  const activeServer = getStreamingServer(activeServerId)

  const [isLoading, setIsLoading] = useState(true)
  const [reloadKey, setReloadKey] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Compute final embed URL
  const currentEmbedUrl = (() => {
    if (tmdbId) {
      if (mediaType === "movie") {
        return getMovieEmbedUrl(activeServerId, { tmdbId, imdbId })
      } else {
        return getTvEmbedUrl(activeServerId, {
          tmdbId,
          imdbId,
          season,
          episode,
        })
      }
    }
    return embedUrl || ""
  })()

  // Handle escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        if (isFullscreen) {
          setIsFullscreen(false)
        } else {
          onClose()
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, isFullscreen, onClose])

  if (!isOpen) return null

  const handleServerSwitch = (newServerId: string) => {
    setLocalServerId(newServerId)
    setStoredServerId(newServerId)
    if (onServerChange) {
      onServerChange(newServerId)
    }
    setIsLoading(true)
    setReloadKey((k) => k + 1)
  }

  const handleReload = () => {
    setIsLoading(true)
    setReloadKey((k) => k + 1)
  }

  const handleExternalOpen = () => {
    if (currentEmbedUrl) {
      window.open(currentEmbedUrl, "_blank", "noopener,noreferrer")
    }
  }

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev)
  }

  const handlePrevEpisode = () => {
    if (episode > 1 && onEpisodeChange) {
      onEpisodeChange(season, episode - 1)
      setIsLoading(true)
    }
  }

  const handleNextEpisode = () => {
    if ((!totalEpisodes || episode < totalEpisodes) && onEpisodeChange) {
      onEpisodeChange(season, episode + 1)
      setIsLoading(true)
    }
  }

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl transition-all duration-300",
        isFullscreen ? "p-0" : "p-2 sm:p-4 md:p-6"
      )}
      onClick={onClose}
    >
      <div
        ref={containerRef}
        className={cn(
          "relative flex flex-col bg-[#0b0d14] border border-white/10 shadow-[0_0_60px_rgba(168,85,247,0.2)] transition-all duration-300",
          isFullscreen
            ? "w-screen h-screen rounded-none overflow-hidden"
            : "w-full max-w-6xl rounded-2xl max-h-[96vh]"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar (High z-index to ensure server dropdown floats above video frame) */}
        <div className="relative z-30 flex flex-wrap items-center justify-between gap-2.5 px-3 sm:px-5 py-3 border-b border-white/10 bg-[#0e111a] rounded-t-2xl shrink-0">
          {/* Left: Title & Season/Episode details */}
          <div className="flex items-center gap-2.5 min-w-0 max-w-full sm:max-w-md">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Sparkles className="size-3.5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-bold text-white truncate">
                {title}
              </h3>
              {mediaType === "tv" && (
                <div className="flex items-center gap-2 text-[10px] text-purple-300 font-semibold">
                  <span>Season {season}</span>
                  <span>•</span>
                  <span>Episode {episode}</span>
                </div>
              )}
            </div>
          </div>

          {/* Center / Actions: Server Selector & TV Episode Controls */}
          <div className="flex items-center gap-2 ml-auto">
            {/* TV Show Episode Skip Buttons */}
            {mediaType === "tv" && onEpisodeChange && (
              <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-0.5">
                <button
                  type="button"
                  onClick={handlePrevEpisode}
                  disabled={episode <= 1}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                  title="Previous Episode"
                >
                  <ChevronLeft className="size-3.5" />
                  <span className="hidden md:inline">Prev</span>
                </button>
                <span className="text-[11px] font-bold text-purple-300 px-1">
                  E{episode}
                </span>
                <button
                  type="button"
                  onClick={handleNextEpisode}
                  disabled={Boolean(totalEpisodes && episode >= totalEpisodes)}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                  title="Next Episode"
                >
                  <span className="hidden md:inline">Next</span>
                  <ChevronRight className="size-3.5" />
                </button>
              </div>
            )}

            {/* Server Dropdown Selector */}
            <StreamingServerSelector
              selectedServerId={activeServerId}
              onServerChange={handleServerSwitch}
              variant="dropdown"
              align="right"
            />

            {/* Reload Stream Button */}
            <button
              type="button"
              onClick={handleReload}
              className="flex size-8 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/80 hover:text-white hover:bg-white/15 hover:border-purple-400/50 transition-all cursor-pointer"
              title="Reload Stream"
              aria-label="Reload Stream"
            >
              <RefreshCw className={cn("size-3.5", isLoading && "animate-spin text-purple-400")} />
            </button>

            {/* Open in New Window */}
            <button
              type="button"
              onClick={handleExternalOpen}
              className="hidden sm:flex size-8 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/80 hover:text-white hover:bg-white/15 hover:border-purple-400/50 transition-all cursor-pointer"
              title="Open stream in new tab"
              aria-label="Open in new tab"
            >
              <ExternalLink className="size-3.5" />
            </button>

            {/* Fullscreen Modal Toggle */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="hidden sm:flex size-8 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/80 hover:text-white hover:bg-white/15 hover:border-purple-400/50 transition-all cursor-pointer"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Theatre"}
              aria-label="Toggle Fullscreen"
            >
              {isFullscreen ? (
                <Minimize2 className="size-3.5" />
              ) : (
                <Maximize2 className="size-3.5" />
              )}
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="flex size-8 items-center justify-center rounded-xl bg-white/10 border border-white/15 text-white hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/40 transition-all cursor-pointer ml-1"
              aria-label="Close player"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Quick Server Switcher Pills Strip (Scrollable) */}
        <div className="relative z-10 flex items-center gap-1.5 px-3 sm:px-5 py-2 bg-[#090b12] border-b border-white/5 overflow-x-auto no-scrollbar shrink-0">
          <div className="flex items-center gap-1 text-[11px] font-semibold text-white/50 shrink-0 mr-1">
            <Server className="size-3 text-purple-400" />
            <span className="hidden sm:inline">Servers:</span>
          </div>

          {STREAMING_SERVERS.map((server, idx) => {
            const isSelected = server.id === activeServer.id
            return (
              <button
                key={server.id}
                type="button"
                onClick={() => handleServerSwitch(server.id)}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium shrink-0 transition-all cursor-pointer",
                  isSelected
                    ? "bg-purple-600 text-white shadow-sm ring-1 ring-purple-400"
                    : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                )}
              >
                <span className="opacity-60 text-[9px]">#{idx + 1}</span>
                <span>{server.name}</span>
                {isSelected && (
                  <Zap className="size-2.5 fill-white text-white" />
                )}
              </button>
            )
          })}
        </div>

        {/* Main Video Frame Container */}
        <div className="relative z-0 w-full aspect-video flex-1 bg-black overflow-hidden flex items-center justify-center">
          {/* Loading overlay */}
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 z-20 gap-3 backdrop-blur-sm">
              <Loader2 className="size-10 animate-spin text-purple-400" />
              <div className="text-center space-y-1">
                <p className="text-sm font-semibold tracking-wide text-purple-200 animate-pulse">
                  Connecting to {activeServer.name}...
                </p>
                <p className="text-xs text-white/40">
                  {activeServer.quality} • {activeServer.speed} Stream
                </p>
              </div>
            </div>
          )}

          {/* Embed Frame */}
          {currentEmbedUrl ? (
            <iframe
              key={`${currentEmbedUrl}-${reloadKey}`}
              src={currentEmbedUrl}
              title={title}
              className="size-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
              allowFullScreen
              onLoad={() => setIsLoading(false)}
            ></iframe>
          ) : (
            <div className="text-center text-white/50 text-sm">
              No stream URL available.
            </div>
          )}
        </div>

        {/* Bottom Helper Bar */}
        <div className="relative z-10 flex items-center justify-between gap-2 px-4 py-2 border-t border-white/5 bg-[#090b12] rounded-b-2xl text-[11px] text-white/50 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>Currently streaming from <strong className="text-purple-300 font-semibold">{activeServer.name}</strong></span>
          </div>
          <span className="hidden sm:inline text-white/40">
            If video stops or shows an error, click another server above
          </span>
        </div>
      </div>
    </div>
  )
}
