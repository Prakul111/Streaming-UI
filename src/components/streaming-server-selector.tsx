import { useState, useRef, useEffect, useMemo } from "react"
import {
  type StreamingServer,
  getStreamingServer,
  setStoredServerId,
} from "@/lib/streaming-servers"
import { useStreamingServers } from "@/hooks/use-streaming-servers"
import { useServerHealth } from "@/context/server-health-context"
import SubmitServerModal from "./submit-server-modal"
import { cn } from "@/lib/utils"
import {
  Server,
  ChevronDown,
  Check,
  Plus,
  Globe,
  RefreshCw,
} from "lucide-react"

interface StreamingServerSelectorProps {
  selectedServerId: string
  onServerChange: (serverId: string) => void
  onDirectPlay?: (serverId: string) => void
  variant?: "pills" | "dropdown" | "compact"
  align?: "left" | "right" | "auto"
  className?: string
  showLabel?: boolean
  servers?: StreamingServer[]
  onOpenSubmitModal?: () => void
}

export default function StreamingServerSelector({
  selectedServerId,
  onServerChange,
  onDirectPlay,
  variant = "pills",
  align = "auto",
  className,
  showLabel = true,
  servers: propServers,
  onOpenSubmitModal,
}: StreamingServerSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false)
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({})
  const dropdownRef = useRef<HTMLDivElement>(null)

  const { servers: hookServers } = useStreamingServers()
  const { healthMap, isProbing, runHealthCheck, getRankedServers } = useServerHealth()

  const rawAvailable = propServers || hookServers
  const availableServers = getRankedServers(rawAvailable)

  // Find active server
  const activeServer =
    availableServers.find((s) => s.id === selectedServerId) ||
    getStreamingServer(selectedServerId)

  // Curate primary servers for pills layout
  const primaryServers = useMemo(() => {
    const curatedIds = ["vidlink", "autoembed", "cinesrc", "vidsrc-pm", "videasy", "2embed"]
    const list: typeof availableServers = []

    for (const id of curatedIds) {
      const found = availableServers.find((s) => s.id === id)
      if (found) list.push(found)
    }

    if (!list.some((s) => s.id === activeServer.id)) {
      list.push(activeServer)
    }
    return list
  }, [availableServers, activeServer])

  const secondaryServers = useMemo(() => {
    const primaryIds = new Set(primaryServers.map((s) => s.id))
    return availableServers.filter((s) => !primaryIds.has(s.id))
  }, [availableServers, primaryServers])

  // Dropdown position calculator
  useEffect(() => {
    if (!isOpen || !dropdownRef.current) return

    const updatePosition = () => {
      if (!dropdownRef.current) return
      const rect = dropdownRef.current.getBoundingClientRect()
      const screenWidth = window.innerWidth
      const idealWidth = Math.min(320, screenWidth - 24)

      const screenHeight = window.innerHeight
      const spaceBelow = screenHeight - rect.bottom
      const spaceAbove = rect.top
      const openUpwards = spaceBelow < 360 && spaceAbove > spaceBelow

      let effectiveAlign = align
      if (effectiveAlign === "auto") {
        effectiveAlign = rect.left > screenWidth / 2 ? "right" : "left"
      }

      const style: React.CSSProperties = {
        width: `${idealWidth}px`,
        maxWidth: "calc(100vw - 1.5rem)",
      }

      if (openUpwards) {
        style.bottom = "calc(100% + 8px)"
        style.top = "auto"
      } else {
        style.top = "calc(100% + 8px)"
        style.bottom = "auto"
      }

      if (effectiveAlign === "right") {
        const leftEdgeInViewport = rect.right - idealWidth
        if (leftEdgeInViewport < 12) {
          const overflow = 12 - leftEdgeInViewport
          style.right = `-${overflow}px`
          style.left = "auto"
        } else {
          style.right = "0px"
          style.left = "auto"
        }
      } else {
        const rightEdgeInViewport = rect.left + idealWidth
        if (rightEdgeInViewport > screenWidth - 12) {
          const overflow = rightEdgeInViewport - (screenWidth - 12)
          style.left = `-${overflow}px`
          style.right = "auto"
        } else {
          style.left = "0px"
          style.right = "auto"
        }
      }

      setMenuStyle(style)
    }

    updatePosition()
    window.addEventListener("resize", updatePosition)
    window.addEventListener("scroll", updatePosition, true)

    return () => {
      window.removeEventListener("resize", updatePosition)
      window.removeEventListener("scroll", updatePosition, true)
    }
  }, [isOpen, align])

  const handleSelect = (server: StreamingServer) => {
    setStoredServerId(server.id)
    onServerChange(server.id)
    setIsOpen(false)
    if (onDirectPlay) {
      onDirectPlay(server.id)
    }
  }

  const handleOpenAddModal = () => {
    setIsOpen(false)
    if (onOpenSubmitModal) {
      onOpenSubmitModal()
    } else {
      setIsSubmitModalOpen(true)
    }
  }

  // Dropdown / Compact Variant
  if (variant === "dropdown" || variant === "compact") {
    const activeHealth = healthMap[activeServer.id]

    return (
      <>
        <div className={cn("relative inline-block text-left", isOpen ? "z-50" : "z-20", className)} ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all text-xs font-semibold backdrop-blur-md cursor-pointer",
              isOpen
                ? "bg-muted border-border text-foreground shadow-lg dark:bg-zinc-800 dark:border-white/30 dark:text-white"
                : "bg-muted/70 hover:bg-muted border-border/70 text-foreground dark:bg-white/10 dark:hover:bg-white/15 dark:border-white/15 dark:text-white/90"
            )}
            title="Select Streaming Server"
            aria-expanded={isOpen}
            aria-haspopup="true"
          >
            <Server className="size-3.5 text-zinc-400 shrink-0" />
            <span className="truncate max-w-[120px] sm:max-w-none">
              {activeServer.name}
            </span>

            {activeHealth?.status === 'optimal' && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {activeHealth.latencyMs}ms
              </span>
            )}
            {activeHealth?.status === 'offline' && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/30">
                Slow
              </span>
            )}
            {!activeHealth && (
              <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-white/10 text-zinc-300">
                {activeServer.quality}
              </span>
            )}

            <ChevronDown
              className={cn(
                "size-3.5 text-white/60 transition-transform duration-200",
                isOpen && "rotate-180 text-white"
              )}
            />
          </button>

          {isOpen && (
            <div
              className="fixed inset-0 z-40 bg-black/30"
              onClick={(e) => {
                e.stopPropagation()
                setIsOpen(false)
              }}
            />
          )}

          {isOpen && (
            <div
              style={menuStyle}
              className="absolute z-[100] rounded-2xl bg-popover border border-border text-popover-foreground dark:bg-[#0f1118] dark:border-white/15 p-2.5 shadow-2xl ring-1 ring-black/10 dark:ring-black/50 animate-in fade-in zoom-in-95 duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-2.5 py-2 border-b border-border/50 dark:border-white/10 mb-2 flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-foreground dark:text-zinc-300 flex items-center gap-1.5">
                  <Server className="size-3 text-zinc-400" />
                  Streaming Servers
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => runHealthCheck(rawAvailable, true)}
                    disabled={isProbing}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-muted hover:bg-muted/80 text-foreground border border-border dark:bg-white/10 dark:hover:bg-white/20 dark:text-zinc-200 dark:border-white/10 text-[10px] font-semibold cursor-pointer transition-all disabled:opacity-50"
                    title="Check latency"
                  >
                    <RefreshCw className={cn("size-2.5", isProbing && "animate-spin")} />
                    <span>{isProbing ? "Testing..." : "Test Speed"}</span>
                  </button>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-zinc-400 font-medium">
                    {availableServers.length}
                  </span>
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                {availableServers.map((server) => {
                  const isSelected = server.id === activeServer.id
                  const isCommunity = server.id.startsWith("db-")
                  const isCustom = server.id.startsWith("local-")
                  const health = healthMap[server.id]

                  const isOptimal = health?.status === 'optimal'
                  const isSlow = health?.status === 'slow'
                  const isOffline = health?.status === 'offline'

                  return (
                    <button
                      key={server.id}
                      type="button"
                      onClick={() => handleSelect(server)}
                      className={cn(
                        "w-full flex items-start gap-2.5 p-2 rounded-xl text-left transition-all cursor-pointer group",
                        isSelected
                          ? "bg-primary/10 border border-primary/20 text-primary dark:bg-white/15 dark:border-white/25 dark:text-white"
                          : isOffline
                          ? "opacity-60 hover:opacity-100 hover:bg-muted/50 text-muted-foreground border border-transparent"
                          : "hover:bg-muted text-foreground dark:text-zinc-200 dark:hover:bg-white/10 dark:hover:text-white border border-transparent"
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-semibold text-foreground dark:text-white truncate flex items-center gap-1">
                            {server.name}
                            {isCommunity && (
                              <span title="Community Server" className="inline-flex">
                                <Globe className="size-2.5 text-sky-400 shrink-0" />
                              </span>
                            )}
                            {isCustom && (
                              <span className="text-[9px] text-zinc-400 font-normal shrink-0">(Custom)</span>
                            )}
                          </span>

                          <div className="flex items-center gap-1 shrink-0">
                            {health && (
                              <span
                                className={cn(
                                  "text-[9px] px-1.5 py-0.5 rounded font-mono font-medium border",
                                  isOptimal
                                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                                    : isSlow
                                    ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                                    : isOffline
                                    ? "bg-red-500/20 text-red-300 border-red-500/30"
                                    : "bg-white/5 text-zinc-400 border-white/10"
                                )}
                              >
                                {isOffline ? "Offline" : `${health.latencyMs}ms`}
                              </span>
                            )}

                            <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider bg-white/10 text-zinc-300">
                              {server.quality}
                            </span>
                          </div>
                        </div>

                        <p className="text-[10px] text-zinc-400 line-clamp-1 mt-0.5">
                          {isOffline
                            ? "High latency or degraded response"
                            : isOptimal
                            ? "Fast verified stream"
                            : server.description}
                        </p>
                      </div>

                      {isSelected && (
                        <Check className="size-4 text-white shrink-0 self-center" />
                      )}
                    </button>
                  )
                })}
              </div>

              <div className="pt-2 mt-2 border-t border-white/10 px-1">
                <button
                  type="button"
                  onClick={handleOpenAddModal}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-zinc-200 border border-white/10 text-xs font-semibold transition-all cursor-pointer"
                >
                  <Plus className="size-3.5" />
                  <span>Submit or Add Server</span>
                </button>
              </div>
            </div>
          )}
        </div>

        <SubmitServerModal
          isOpen={isSubmitModalOpen}
          onClose={() => setIsSubmitModalOpen(false)}
        />
      </>
    )
  }

  // Pills Variant
  return (
    <>
      <div className={cn("space-y-2.5", className)}>
        {showLabel && (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-lg bg-muted dark:bg-white/10 text-foreground dark:text-white border border-border dark:border-white/15 shadow-sm">
                <Server className="size-3.5" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                Streaming Sources
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-muted dark:bg-white/10 text-muted-foreground dark:text-zinc-300 border border-border dark:border-white/10">
                Active: {activeServer.name}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => runHealthCheck(rawAvailable, true)}
                disabled={isProbing}
                className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground dark:text-zinc-400 dark:hover:text-white transition-colors cursor-pointer"
              >
                <RefreshCw className={cn("size-3", isProbing && "animate-spin")} />
                <span>{isProbing ? "Testing..." : "Speed Test"}</span>
              </button>

              <button
                type="button"
                onClick={handleOpenAddModal}
                className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground dark:text-zinc-400 dark:hover:text-white transition-colors cursor-pointer"
              >
                <Plus className="size-3" />
                <span>Add Server</span>
              </button>
            </div>
          </div>
        )}

        {/* Primary Server Pills */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {primaryServers.map((server) => {
            const isSelected = server.id === activeServer.id

            return (
              <button
                key={server.id}
                type="button"
                onClick={() => handleSelect(server)}
                className={cn(
                  "group relative flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer active:scale-95 border",
                  isSelected
                    ? "bg-primary text-primary-foreground font-semibold border-primary shadow-sm dark:bg-white dark:text-black dark:border-white"
                    : "bg-muted/70 hover:bg-muted text-foreground border-border/70 dark:bg-white/5 dark:hover:bg-white/10 dark:text-zinc-300 dark:hover:text-white dark:border-white/10"
                )}
              >
                <span>{server.name}</span>
                <span
                  className={cn(
                    "text-[9px] px-1.5 py-0.2 rounded font-bold uppercase tracking-tight",
                    isSelected
                      ? "bg-black/10 text-black"
                      : "bg-white/10 text-zinc-400"
                  )}
                >
                  {server.quality}
                </span>
              </button>
            )
          })}

          {/* More Mirrors Trigger */}
          {secondaryServers.length > 0 && (
            <div className="relative inline-block" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-muted/70 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/70 dark:bg-white/5 dark:hover:bg-white/10 dark:text-zinc-400 dark:hover:text-white dark:border-white/10 transition-all cursor-pointer"
              >
                <span>More Mirrors ({secondaryServers.length})</span>
                <ChevronDown className={cn("size-3 transition-transform", isOpen && "rotate-180")} />
              </button>

              {isOpen && (
                <div
                  className="absolute left-0 mt-2 z-50 w-64 rounded-2xl bg-popover border border-border text-popover-foreground dark:bg-[#0f1118] dark:border-white/15 p-2 shadow-2xl max-h-64 overflow-y-auto custom-scrollbar"
                  onClick={(e) => e.stopPropagation()}
                >
                  {secondaryServers.map((server) => (
                    <button
                      key={server.id}
                      type="button"
                      onClick={() => handleSelect(server)}
                      className={cn(
                        "w-full flex items-center justify-between p-2 rounded-xl text-xs text-left transition-colors cursor-pointer",
                        server.id === activeServer.id
                          ? "bg-white/15 text-white font-semibold"
                          : "text-foreground/80 hover:bg-muted dark:text-zinc-300 dark:hover:bg-white/10 dark:hover:text-white"
                      )}
                    >
                      <span className="truncate">{server.name}</span>
                      <span className="text-[10px] text-zinc-500 uppercase">{server.quality}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <SubmitServerModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
      />
    </>
  )
}
