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
  Server,
  Zap,
  Sparkles,
  Plus,
  Globe,
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
  const { servers } = useStreamingServers()
  const { healthMap, getRankedServers, isProbing, runHealthCheck, bestServerId } = useServerHealth()

  // Dynamically sort servers with best performing at the top (Rank 1)
  const sortedServers = useMemo(() => {
    return getRankedServers(servers)
  }, [servers, getRankedServers, healthMap])

  // Active server resolution: prefer local user selection in modal, then parent prop, then stored preference
  const [localServerId, setLocalServerId] = useState<string>(() => selectedServerId ?? getStoredServerId())
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false)

  useEffect(() => {
    if (selectedServerId) {
      setLocalServerId(selectedServerId)
    }
  }, [selectedServerId])

  useEffect(() => {
    if (bestServerId && !selectedServerId) {
      setLocalServerId(bestServerId)
    }
  }, [bestServerId, selectedServerId])

  // If the active server is marked offline and we have a verified best server, auto-switch
  useEffect(() => {
    if (bestServerId && healthMap[localServerId]?.status === "offline") {
      setLocalServerId(bestServerId)
      if (onServerChange) onServerChange(bestServerId)
    }
  }, [bestServerId, healthMap, localServerId, onServerChange])

  const activeServerId = localServerId || selectedServerId || getStoredServerId()
  const activeServer =
    servers.find((s) => s.id === activeServerId) || getStreamingServer(activeServerId)

  // Identify next ranked server for quick 1-click failover
  const nextServer = useMemo(() => {
    const currentIndex = sortedServers.findIndex((s) => s.id === activeServer.id)
    if (currentIndex >= 0 && currentIndex < sortedServers.length - 1) {
      return sortedServers[currentIndex + 1]
    }
    return sortedServers[0]
  }, [sortedServers, activeServer.id])

  const [isLoading, setIsLoading] = useState(true)
  const [loadTimeout, setLoadTimeout] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Compute final embed URL dynamically using the active server
  const currentEmbedUrl = (() => {
    if (tmdbId && activeServer) {
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
    return embedUrl || ""
  })()

  // Track slow loading or browser iframe blocking (e.g., Zen / Firefox strict mode / Cloudflare)
  useEffect(() => {
    setLoadTimeout(false)
    setIsLoading(true)
    const timer = setTimeout(() => {
      setLoadTimeout(true)
    }, 6500)
    return () => clearTimeout(timer)
  }, [currentEmbedUrl, reloadKey])

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
    setLoadTimeout(false)
    setReloadKey((k) => k + 1)
  }

  const handleReload = () => {
    setIsLoading(true)
    setLoadTimeout(false)
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

  return (
    <>
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
                servers={sortedServers}
                variant="dropdown"
                align="right"
                onOpenSubmitModal={() => setIsSubmitModalOpen(true)}
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
                className="flex size-8 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/80 hover:text-white hover:bg-white/15 hover:border-purple-400/50 transition-all cursor-pointer"
                title="Open stream in new tab (bypasses browser iframe restrictions)"
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

          {/* Quick Server Switcher Pills Strip (Scrollable & Ordered by Health) */}
          <div className="relative z-10 flex items-center gap-1.5 px-3 sm:px-5 py-2 bg-[#090b12] border-b border-white/5 overflow-x-auto no-scrollbar shrink-0">
            <div className="flex items-center gap-2 text-[11px] font-semibold text-white/60 shrink-0 mr-1">
              <div className="flex items-center gap-1">
                <Server className="size-3 text-purple-400" />
                <span className="hidden sm:inline">Ranked ({sortedServers.length}):</span>
              </div>
              <button
                type="button"
                onClick={() => runHealthCheck(servers, true)}
                disabled={isProbing}
                className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-md active:scale-95"
                title="Re-benchmark server latency"
              >
                <RefreshCw className={cn("size-2.5", isProbing && "animate-spin")} />
                <span>{isProbing ? "Testing..." : "Speed Test"}</span>
              </button>
            </div>

            {sortedServers.map((server, idx) => {
              const isSelected = server.id === activeServer.id
              const isCommunity = server.id.startsWith("db-")
              const isCustom = server.id.startsWith("local-")
              const health = healthMap[server.id]
              const isOptimal = health?.status === "optimal"
              const isFast = health?.status === "fast"
              const isSlow = health?.status === "slow"
              const isOffline = health?.status === "offline"

              return (
                <button
                  key={server.id}
                  type="button"
                  onClick={() => handleServerSwitch(server.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium shrink-0 transition-all cursor-pointer border",
                    isSelected
                      ? "bg-purple-600 text-white shadow-sm ring-1 ring-purple-400 border-purple-400"
                      : isOptimal
                      ? "bg-emerald-500/10 text-emerald-200 border-emerald-500/30 hover:bg-emerald-500/20"
                      : isOffline
                      ? "bg-red-500/10 text-white/50 border-red-500/20 opacity-60 hover:opacity-100 hover:text-white"
                      : isSlow
                      ? "bg-amber-500/10 text-amber-200/90 border-amber-500/20 hover:bg-amber-500/20"
                      : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border-transparent"
                  )}
                >
                  <span
                    className={cn(
                      "text-[9px] px-1 py-0.2 rounded font-black",
                      isSelected
                        ? "bg-white text-purple-900"
                        : isOptimal
                        ? "bg-emerald-500 text-black font-bold"
                        : isOffline
                        ? "bg-red-500/20 text-red-300"
                        : "opacity-60"
                    )}
                  >
                    #{idx + 1}
                  </span>
                  <span className="font-semibold">{server.name}</span>
                  {health && (
                    <span
                      className={cn(
                        "text-[9px] px-1 py-0.2 rounded font-mono font-bold",
                        isSelected
                          ? "bg-purple-700/80 text-white"
                          : isOptimal
                          ? "text-emerald-300"
                          : isFast
                          ? "text-sky-300"
                          : isSlow
                          ? "text-amber-300"
                          : "text-red-400"
                      )}
                    >
                      {isOffline ? "Offline" : `${health.latencyMs}ms`}
                    </span>
                  )}
                  {isCommunity && (
                    <span title="Community Server" className="inline-flex"><Globe className="size-2 text-blue-400 shrink-0" /></span>
                  )}
                  {isCustom && (
                    <span className="text-[9px] text-amber-400 font-bold shrink-0">⚡</span>
                  )}
                  {isSelected && (
                    <Zap className="size-2.5 fill-white text-white" />
                  )}
                </button>
              )
            })}

            {/* Quick Add Server Pill */}
            <button
              type="button"
              onClick={() => setIsSubmitModalOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-purple-300 bg-purple-600/20 hover:bg-purple-600/35 border border-purple-500/30 shrink-0 transition-all cursor-pointer"
            >
              <Plus className="size-3" />
              <span>Add Server</span>
            </button>
          </div>

          {/* Main Video Frame Container */}
          <div className="relative z-0 w-full aspect-video flex-1 bg-black overflow-hidden flex items-center justify-center">
            {/* AutoEmbed v2 Direct Multi-Server Theater Pill */}
            {activeServer.id === "autoembed" && (
              <div className="absolute top-3 left-3 z-30 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0e111a]/90 backdrop-blur-md border border-purple-500/40 text-xs shadow-lg animate-in fade-in duration-200">
                <span className="flex size-2 rounded-full bg-purple-400 animate-pulse" />
                <span className="font-semibold text-purple-200">AutoEmbed v2 (30+ Servers)</span>
                <button
                  type="button"
                  onClick={handleExternalOpen}
                  className="flex items-center gap-1 ml-1 px-2 py-0.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium text-[11px] transition-all cursor-pointer shadow-sm active:scale-95"
                  title="Launch AutoEmbed v2 multi-server player in a clean external window"
                >
                  <ExternalLink className="size-3" />
                  <span>Open 30+ Server Theater</span>
                </button>
              </div>
            )}

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

            {/* Failover / Browser Security Helper Notification */}
            {isLoading && loadTimeout && (
              <div className="absolute inset-x-3 sm:inset-x-6 bottom-4 sm:bottom-6 z-30 flex flex-col sm:flex-row items-center justify-between gap-3 p-3 sm:p-4 bg-[#0e111a]/95 backdrop-blur-md border border-purple-500/40 rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.8)] text-xs animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div className="flex items-center gap-2.5 text-white/90">
                  <div className="size-2.5 rounded-full bg-amber-400 animate-ping shrink-0" />
                  <div>
                    <p className="font-semibold text-white">Stream taking longer than expected to load?</p>
                    <p className="text-[11px] text-white/60">
                      Privacy-focused browsers (Zen, Firefox, Brave) may block third-party iframes.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {nextServer && nextServer.id !== activeServer.id && (
                    <button
                      type="button"
                      onClick={() => handleServerSwitch(nextServer.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold transition-all cursor-pointer shadow-sm active:scale-95"
                    >
                      <Zap className="size-3.5" />
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

          {/* Bottom Helper Bar */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-2.5 px-3 sm:px-5 py-2.5 border-t border-white/5 bg-[#090b12] rounded-b-2xl text-[11px] text-white/60 shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className={cn(
                  "size-2 rounded-full shrink-0",
                  healthMap[activeServer.id]?.status === "offline"
                    ? "bg-red-500"
                    : healthMap[activeServer.id]?.status === "slow"
                    ? "bg-amber-400"
                    : "bg-emerald-400"
                )}
              />
              <span className="truncate">
                Currently streaming from{" "}
                <strong className="text-purple-300 font-semibold">{activeServer.name}</strong>
                {healthMap[activeServer.id] && (
                  <span
                    className={cn(
                      "ml-1.5 font-mono text-[10px] px-1.5 py-0.5 rounded border",
                      healthMap[activeServer.id]?.status === "optimal"
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                        : healthMap[activeServer.id]?.status === "offline"
                        ? "bg-red-500/20 text-red-300 border-red-500/30"
                        : "bg-white/10 text-white/60 border-white/10"
                    )}
                  >
                    {healthMap[activeServer.id]?.status === "offline"
                      ? "⚠️ Degraded"
                      : `⚡ ${healthMap[activeServer.id]?.latencyMs}ms`}
                  </span>
                )}
              </span>
            </div>

            {/* Quick Actions for Browser Security / Failover Bypass */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExternalOpen}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-purple-300 hover:text-white bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/25 transition-all cursor-pointer font-medium"
                title="If browser blocks embed (X-Frame-Options/CSP), open stream in a new tab"
              >
                <ExternalLink className="size-3" />
                <span>Open in Tab</span>
              </button>

              {nextServer && nextServer.id !== activeServer.id && (
                <button
                  type="button"
                  onClick={() => handleServerSwitch(nextServer.id)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer font-medium"
                  title={`Quick switch to next ranked server: ${nextServer.name}`}
                >
                  <ChevronRight className="size-3 text-purple-400" />
                  <span className="hidden sm:inline">Try</span>
                  <span>{nextServer.name}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsSubmitModalOpen(true)}
                className="hidden md:inline text-purple-400 hover:text-purple-300 underline font-medium cursor-pointer ml-1"
              >
                Submit Server
              </button>
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
