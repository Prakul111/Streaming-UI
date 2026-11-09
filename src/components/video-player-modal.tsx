import { useState, useEffect, useRef, useMemo } from "react"
import {
  X,
  Loader2,
  RefreshCw,
  ExternalLink,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  Play,
  Plus,
  Tv,
} from "lucide-react"
import {
  getStreamingServer,
  getStoredServerId,
  setStoredServerId,
} from "@/lib/streaming-servers"
import { useStreamingServers } from "@/hooks/use-streaming-servers"
import StreamingServerSelector from "./streaming-server-selector"
import SubmitServerModal from "./submit-server-modal"
import { cn } from "@/lib/utils"
import { useServerHealth } from "@/context/server-health-context"

import { saveWatchHistoryItem } from "@/lib/watch-history"

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
  posterPath?: string | null
  backdropPath?: string | null
  overview?: string
  voteAverage?: number
  releaseDate?: string
}

const AUTOEMBED_SERVERS = [
  { name: "Max", flag: "🇬🇧" },
  { name: "Vidpro", flag: "🇬🇧" },
  { name: "V2", flag: "🇬🇧" },
  { name: "Premium", flag: "🇺🇸" },
  { name: "4K", flag: "🇬🇧", highlight: true },
  { name: "Vidfast", flag: "🇬🇧" },
  { name: "Nxsha", flag: "🇺🇸" },
  { name: "Super", flag: "🇬🇧" },
  { name: "Vidcore", flag: "🇬🇧" },
  { name: "Rock", flag: "🇬🇧" },
  { name: "Primesrc", flag: "🇦🇺" },
  { name: "2Embed", flag: "🇦🇺" },
  { name: "Cinemaos", flag: "🇺🇸" },
  { name: "Prime", flag: "🇺🇸" },
  { name: "Netflix", flag: "🇺🇸" },
  { name: "Hotstar", flag: "🇮🇳" },
  { name: "Vidnest", flag: "🇬🇧" },
  { name: "Tongo", flag: "🇺🇸" },
  { name: "Echo", flag: "🇺🇸" },
  { name: "Hdmovies", flag: "🇮🇳" },
  { name: "NHD", flag: "🇮🇳" },
  { name: "Mplay", flag: "🇮🇳" },
  { name: "Xpass", flag: "🇺🇸" },
  { name: "Bravo", flag: "🇬🇧" },
  { name: "Vidking", flag: "🇺🇸" },
  { name: "111", flag: "🇬🇧" },
  { name: "Jade", flag: "🇵🇹" },
  { name: "French", flag: "🇫🇷" },
  { name: "Spanish", flag: "🇪🇸" },
  { name: "Hindi", flag: "🇮🇳" },
  { name: "Tamil", flag: "🇮🇳" },
  { name: "Telugu", flag: "🇮🇳" },
  { name: "Arab", flag: "🇸🇦" },
  { name: "French 2", flag: "🇫🇷" },
  { name: "Brazil", flag: "🇧🇷" },
]

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
  selectedServerId: propServerId,
  onServerChange,
  posterPath,
  backdropPath,
  overview,
  voteAverage,
  releaseDate,
}: VideoPlayerModalProps) {
  const [internalServerId, setInternalServerId] = useState<string>(() => {
    return propServerId || getStoredServerId()
  })

  const [isLoading, setIsLoading] = useState(true)
  const [reloadKey, setReloadKey] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [loadTimeout, setLoadTimeout] = useState(false)
  const [forceIframe, setForceIframe] = useState(false)
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const { servers } = useStreamingServers()
  const { healthMap, getRankedServers } = useServerHealth()

  // Track playback in watch history when modal is active
  useEffect(() => {
    if (isOpen && tmdbId) {
      const parsedId = typeof tmdbId === "string" ? parseInt(tmdbId, 10) : tmdbId
      if (!isNaN(parsedId)) {
        saveWatchHistoryItem({
          tmdbId: parsedId,
          mediaType,
          title,
          posterPath: posterPath ?? null,
          backdropPath: backdropPath ?? null,
          overview,
          voteAverage,
          releaseDate,
          season: mediaType === "tv" ? season : undefined,
          episode: mediaType === "tv" ? episode : undefined,
          totalEpisodes: mediaType === "tv" ? totalEpisodes : undefined,
          serverId: propServerId || internalServerId,
        })
      }
    }
  }, [
    isOpen,
    tmdbId,
    mediaType,
    title,
    posterPath,
    backdropPath,
    overview,
    voteAverage,
    releaseDate,
    season,
    episode,
    totalEpisodes,
    propServerId,
    internalServerId,
  ])

  // Use prop if provided, otherwise internal state
  const activeServerId = propServerId || internalServerId

  // Sort available servers by verified health/latency
  const sortedServers = useMemo(() => {
    return getRankedServers(servers)
  }, [servers, healthMap, getRankedServers])

  // Active server object
  const activeServer = useMemo(() => {
    return (
      servers.find((s) => s.id === activeServerId) ||
      getStreamingServer(activeServerId)
    )
  }, [servers, activeServerId])

  // Top curated premier servers for the quick switcher
  const quickServers = useMemo(() => {
    const curatedIds = ["vidlink", "autoembed", "cinesrc", "vidsrc-pm", "videasy", "2embed"]
    const list: typeof sortedServers = []

    for (const id of curatedIds) {
      const found = sortedServers.find((s) => s.id === id)
      if (found) list.push(found)
    }

    // Keep active server visible if user picked one outside the top 6
    if (!list.some((s) => s.id === activeServer.id)) {
      list.push(activeServer)
    }

    return list
  }, [sortedServers, activeServer])

  // Suggested next server for quick failover
  const nextServer = useMemo(() => {
    const currentIndex = sortedServers.findIndex((s) => s.id === activeServer.id)
    if (currentIndex >= 0 && currentIndex + 1 < sortedServers.length) {
      return sortedServers[currentIndex + 1]
    }
    return sortedServers.find((s) => s.id !== activeServer.id)
  }, [sortedServers, activeServer])

  // Compute current embed URL based on active server
  const currentEmbedUrl = useMemo(() => {
    if (embedUrl) return embedUrl

    if (tmdbId) {
      if (mediaType === "movie") {
        return activeServer.getMovieUrl({ tmdbId, imdbId })
      } else {
        return activeServer.getTvUrl({
          tmdbId,
          imdbId,
          season,
          episode,
        })
      }
    }

    return ""
  }, [embedUrl, tmdbId, imdbId, mediaType, season, episode, activeServer])

  // Sync prop changes
  useEffect(() => {
    if (propServerId && propServerId !== internalServerId) {
      setInternalServerId(propServerId)
    }
  }, [propServerId, internalServerId])

  // Reset loading on URL or reload change
  useEffect(() => {
    if (isOpen) {
      if (activeServer.id === "autoembed" && !forceIframe) {
        setIsLoading(false)
        setLoadTimeout(false)
      } else {
        setIsLoading(true)
        setLoadTimeout(false)
      }
    }
  }, [currentEmbedUrl, reloadKey, isOpen, activeServer.id, forceIframe])

  // Failover detector: after 6.5s if still loading, offer help
  useEffect(() => {
    if (!isLoading || !isOpen || (activeServer.id === "autoembed" && !forceIframe)) return

    const timer = setTimeout(() => {
      setLoadTimeout(true)
    }, 6500)

    return () => clearTimeout(timer)
  }, [isLoading, isOpen, currentEmbedUrl, activeServer.id, forceIframe])

  // ESC key listener & body scroll lock
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isFullscreen) {
          setIsFullscreen(false)
        } else {
          onClose()
        }
      }
    }

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown)
      document.body.style.overflow = "hidden"
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = "auto"
    }
  }, [isOpen, onClose, isFullscreen])

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [])

  if (!isOpen) return null

  const handleServerSwitch = (serverId: string) => {
    setInternalServerId(serverId)
    setStoredServerId(serverId)
    setForceIframe(false)
    setIsLoading(true)
    setLoadTimeout(false)
    if (onServerChange) {
      onServerChange(serverId)
    }
  }

  const handleReload = () => {
    setIsLoading(true)
    setLoadTimeout(false)
    setReloadKey((prev) => prev + 1)
  }

  const handleExternalOpen = () => {
    if (currentEmbedUrl) {
      window.open(currentEmbedUrl, "_blank", "noopener,noreferrer")
    }
  }

  const toggleFullscreen = () => {
    if (!containerRef.current) return

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {
        setIsFullscreen(!isFullscreen)
      })
    } else {
      document.exitFullscreen().catch(() => {
        setIsFullscreen(false)
      })
    }
  }

  const handlePrevEpisode = () => {
    if (episode > 1 && onEpisodeChange) {
      onEpisodeChange(season, episode - 1)
      setIsLoading(true)
      setLoadTimeout(false)
    }
  }

  const handleNextEpisode = () => {
    if ((!totalEpisodes || episode < totalEpisodes) && onEpisodeChange) {
      onEpisodeChange(season, episode + 1)
      setIsLoading(true)
      setLoadTimeout(false)
    }
  }

  const isAutoEmbedTheater = activeServer.id === "autoembed" && !forceIframe

  return (
    <>
      {/* Backdrop */}
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
            "relative flex flex-col bg-[#0b0c10] border border-white/10 shadow-2xl transition-all duration-300",
            isFullscreen
              ? "w-screen h-screen rounded-none overflow-hidden"
              : "w-full max-w-6xl rounded-2xl max-h-[96vh]"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Top Bar */}
          <div className="relative z-30 flex flex-wrap items-center justify-between gap-2.5 px-3 sm:px-5 py-3 border-b border-white/10 bg-[#0e1017] rounded-t-2xl shrink-0">
            {/* Left: Title & Season/Episode details */}
            <div className="flex items-center gap-2.5 min-w-0 max-w-full sm:max-w-md">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white border border-white/15">
                <Play className="size-3.5 fill-white text-white" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs sm:text-sm font-bold text-white truncate">
                  {title}
                </h3>
                {mediaType === "tv" && (
                  <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-semibold">
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
                  <span className="text-[11px] font-bold px-1.5 text-zinc-300">
                    E{episode}
                  </span>
                  <button
                    type="button"
                    onClick={handleNextEpisode}
                    disabled={totalEpisodes !== undefined && episode >= totalEpisodes}
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
                servers={sortedServers}
                variant="dropdown"
                align="right"
                onOpenSubmitModal={() => setIsSubmitModalOpen(true)}
              />

              {/* Reload Stream Button */}
              <button
                type="button"
                onClick={handleReload}
                className="flex size-8 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/80 hover:text-white hover:bg-white/15 transition-all cursor-pointer"
                title="Reload Stream"
                aria-label="Reload Stream"
              >
                <RefreshCw className={cn("size-3.5", isLoading && "animate-spin text-white")} />
              </button>

              {/* Open in New Window */}
              <button
                type="button"
                onClick={handleExternalOpen}
                className="flex size-8 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/80 hover:text-white hover:bg-white/15 transition-all cursor-pointer"
                title="Open stream in new tab"
                aria-label="Open in new tab"
              >
                <ExternalLink className="size-3.5" />
              </button>

              {/* Fullscreen Modal Toggle */}
              <button
                type="button"
                onClick={toggleFullscreen}
                className="hidden sm:flex size-8 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/80 hover:text-white hover:bg-white/15 transition-all cursor-pointer"
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

          {/* Quick Primary Server Strip */}
          <div className="relative z-10 flex items-center justify-between gap-2 px-3 sm:px-5 py-2 bg-[#090b10] border-b border-white/5 shrink-0">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <span className="text-[11px] font-semibold text-zinc-400 shrink-0 mr-1">
                Source:
              </span>
              {quickServers.map((server) => {
                const isSelected = server.id === activeServer.id

                return (
                  <button
                    key={server.id}
                    type="button"
                    onClick={() => handleServerSwitch(server.id)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium shrink-0 transition-all cursor-pointer border",
                      isSelected
                        ? "bg-white text-black font-semibold border-white shadow-sm"
                        : "bg-white/5 text-zinc-300 hover:text-white hover:bg-white/10 border-white/10"
                    )}
                  >
                    <span>{server.name}</span>
                  </button>
                )
              })}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsSubmitModalOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 shrink-0 transition-all cursor-pointer"
              >
                <Plus className="size-3" />
                <span className="hidden sm:inline">Add Server</span>
              </button>
            </div>
          </div>

          {/* Main Video Frame Container */}
          <div className="relative z-0 w-full aspect-video flex-1 bg-black overflow-hidden flex items-center justify-center">
            {/* AutoEmbed v2 Multi-Server Theater Interface */}
            {isAutoEmbedTheater ? (
              <div className="size-full flex flex-col items-center justify-between p-4 sm:p-6 overflow-y-auto no-scrollbar bg-gradient-to-b from-[#0b0c10] via-[#0e1017] to-black">
                {/* Header Banner */}
                <div className="w-full max-w-3xl flex flex-col items-center text-center gap-1.5 mt-1 sm:mt-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] text-zinc-300 font-medium">
                    <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>AutoEmbed v2 • 36 High-Speed Streaming Mirrors</span>
                  </div>
                  <h2 className="text-base sm:text-xl font-bold text-white tracking-tight">
                    Now Watching: {title}
                  </h2>
                  <p className="text-xs text-zinc-400 max-w-lg">
                    Please switch to other servers if default server doesn&apos;t work. Supports 4K adaptive playback, multi-subs, and custom audio tracks.
                  </p>
                </div>

                {/* Primary Launch Action */}
                <div className="my-3 sm:my-4 flex flex-col items-center gap-2">
                  <button
                    type="button"
                    onClick={handleExternalOpen}
                    className="flex items-center gap-2.5 px-6 py-3 rounded-xl bg-white text-black font-bold text-sm sm:text-base hover:bg-zinc-200 transition-all cursor-pointer shadow-lg hover:shadow-white/20 active:scale-95 group"
                  >
                    <Play className="size-4 fill-black text-black group-hover:scale-110 transition-transform" />
                    <span>Launch AutoEmbed v2 Player</span>
                    <ExternalLink className="size-4 opacity-70" />
                  </button>
                  <span className="text-[11px] text-zinc-400">
                    Opens watch-v2.autoembed.app with full player controls &amp; 36 server picker
                  </span>
                </div>

                {/* 36-Server Matrix Preview */}
                <div className="w-full max-w-3xl bg-[#13151e]/80 border border-white/10 rounded-2xl p-3 sm:p-4 backdrop-blur-md">
                  <div className="flex items-center justify-between mb-2.5 px-1">
                    <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                      <Tv className="size-3.5 text-zinc-400" />
                      Integrated Mirrors ({AUTOEMBED_SERVERS.length})
                    </span>
                    <span className="text-[11px] text-zinc-400 font-mono">
                      UK • US • AU • IN • EU
                    </span>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-1.5">
                    {AUTOEMBED_SERVERS.map((srv) => (
                      <button
                        key={srv.name}
                        type="button"
                        onClick={handleExternalOpen}
                        className={cn(
                          "flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium border transition-all cursor-pointer truncate",
                          srv.highlight
                            ? "bg-white text-black border-white font-bold shadow-sm"
                            : "bg-white/5 hover:bg-white/15 text-zinc-300 hover:text-white border-white/10"
                        )}
                        title={`Stream with ${srv.name}`}
                      >
                        <span className="text-sm shrink-0">{srv.flag}</span>
                        <span className="truncate">{srv.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* In-Modal Alternative & Bypass Options */}
                <div className="w-full max-w-3xl flex flex-wrap items-center justify-between gap-2 mt-3 pt-3 border-t border-white/5 text-[11px] text-zinc-400">
                  <div className="flex items-center gap-2">
                    <span>Prefer watching directly inside this popup?</span>
                    <button
                      type="button"
                      onClick={() => handleServerSwitch("vidlink")}
                      className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white font-medium border border-white/10 transition-all cursor-pointer"
                    >
                      Switch to VidLink
                    </button>
                    <button
                      type="button"
                      onClick={() => handleServerSwitch("cinesrc")}
                      className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white font-medium border border-white/10 transition-all cursor-pointer"
                    >
                      CineSRC
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setForceIframe(true)
                      setIsLoading(true)
                    }}
                    className="text-zinc-400 hover:text-zinc-200 underline transition-all cursor-pointer"
                  >
                    Try loading inside iframe anyway
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Loading overlay */}
                {isLoading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 z-20 gap-3 backdrop-blur-sm">
                    <Loader2 className="size-8 animate-spin text-zinc-400" />
                    <div className="text-center space-y-1">
                      <p className="text-sm font-semibold tracking-wide text-zinc-200">
                        Connecting to {activeServer.name}...
                      </p>
                      <p className="text-xs text-zinc-500">
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
                    referrerPolicy="no-referrer"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                    allowFullScreen
                    onLoad={() => {
                      setIsLoading(false)
                      setLoadTimeout(false)
                    }}
                  ></iframe>
                ) : (
                  <div className="text-center text-white/50 text-sm">
                    No stream URL available.
                  </div>
                )}
              </>
            )}

            {/* Failover / Browser Security Helper Notification */}
            {isLoading && loadTimeout && (
              <div className="absolute inset-x-3 sm:inset-x-6 bottom-4 sm:bottom-6 z-30 flex flex-col sm:flex-row items-center justify-between gap-3 p-3 sm:p-4 bg-zinc-900/95 backdrop-blur-md border border-white/15 rounded-xl shadow-2xl text-xs animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div className="flex items-center gap-2.5 text-zinc-200">
                  <div className="size-2 rounded-full bg-amber-400 shrink-0" />
                  <div>
                    <p className="font-semibold text-white">Playback taking longer than expected to load?</p>
                    <p className="text-[11px] text-zinc-400">
                      Privacy-focused browsers (Zen, Firefox, Brave) may restrict third-party iframes.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {nextServer && nextServer.id !== activeServer.id && (
                    <button
                      type="button"
                      onClick={() => handleServerSwitch(nextServer.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-zinc-200 text-black font-semibold transition-all cursor-pointer shadow-sm active:scale-95"
                    >
                      <RefreshCw className="size-3" />
                      <span>Switch to {nextServer.name}</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleExternalOpen}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium border border-white/10 transition-all cursor-pointer active:scale-95"
                  >
                    <ExternalLink className="size-3.5" />
                    <span>Open in New Tab</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-5 py-2.5 border-t border-white/10 bg-[#0e1017] rounded-b-2xl text-xs text-zinc-400 shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className={cn(
                  "size-2 rounded-full shrink-0",
                  healthMap[activeServer.id]?.status === "offline"
                    ? "bg-red-400"
                    : healthMap[activeServer.id]?.status === "slow"
                    ? "bg-amber-400"
                    : "bg-emerald-400"
                )}
              />
              <span className="truncate">
                Currently streaming from{" "}
                <strong className="text-zinc-200 font-semibold">{activeServer.name}</strong>
                {healthMap[activeServer.id] && (
                  <span className="ml-1.5 font-mono text-[10px] text-zinc-400">
                    ({healthMap[activeServer.id]?.status === "offline" ? "Degraded" : `${healthMap[activeServer.id]?.latencyMs}ms`})
                  </span>
                )}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExternalOpen}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer font-medium"
                title="Open stream in a new tab"
              >
                <ExternalLink className="size-3" />
                <span>Open in Tab</span>
              </button>

              {nextServer && nextServer.id !== activeServer.id && (
                <button
                  type="button"
                  onClick={() => handleServerSwitch(nextServer.id)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer font-medium"
                  title={`Switch to ${nextServer.name}`}
                >
                  <ChevronRight className="size-3 text-zinc-400" />
                  <span className="hidden sm:inline">Try</span>
                  <span>{nextServer.name}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Community / Local Server Submission Modal */}
      <SubmitServerModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
      />
    </>
  )
}
