import { useState, useRef, useEffect } from "react"
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
  Zap,
  Sparkles,
  Plus,
  Globe,
  RefreshCw,
  AlertTriangle,
  XCircle,
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

  // Find active server from combined available servers, or fallback to default
  const activeServer =
    availableServers.find((s) => s.id === selectedServerId) ||
    getStreamingServer(selectedServerId)

  // Dynamically position dropdown to guarantee it stays inside viewport
  useEffect(() => {
    if (!isOpen || !dropdownRef.current) return

    const updatePosition = () => {
      if (!dropdownRef.current) return
      const rect = dropdownRef.current.getBoundingClientRect()
      const screenWidth = window.innerWidth
      // Optimal width: 320px on desktop/tablet, capped to screenWidth - 24px on mobile
      const idealWidth = Math.min(320, screenWidth - 24)

      const screenHeight = window.innerHeight
      // Determine vertical placement: open upwards if near bottom of screen
      const spaceBelow = screenHeight - rect.bottom
      const spaceAbove = rect.top
      const openUpwards = spaceBelow < 360 && spaceAbove > spaceBelow

      // Determine effective alignment:
      // If "auto", choose right if button is in right half of screen, otherwise left
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
        // Right edge of menu aligns with right edge of button
        const leftEdgeInViewport = rect.right - idealWidth
        if (leftEdgeInViewport < 12) {
          // Overflows left edge: shift right to stay at least 12px from left screen edge
          const overflow = 12 - leftEdgeInViewport
          style.right = `-${overflow}px`
          style.left = "auto"
        } else {
          style.right = "0px"
          style.left = "auto"
        }
      } else {
        // Left edge of menu aligns with left edge of button
        const rightEdgeInViewport = rect.left + idealWidth
        if (rightEdgeInViewport > screenWidth - 12) {
          // Overflows right edge: shift left so it ends 12px from right screen edge
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

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

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

  // Dropdown / Compact Variant (Perfect for player modal header & episodes section)
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
                ? "bg-purple-950/90 border-purple-500 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                : "bg-white/10 hover:bg-white/15 border-white/15 text-white/90 hover:border-purple-400/50"
            )}
            title="Select Streaming Server"
            aria-expanded={isOpen}
            aria-haspopup="true"
          >
            <Server className="size-3.5 text-purple-400 shrink-0" />
            <span className="truncate max-w-[120px] sm:max-w-none">
              {activeServer.name}
            </span>

            {/* Health / Latency Badge on Trigger Button */}
            {activeHealth?.status === 'optimal' && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 flex items-center gap-0.5">
                <Zap className="size-2.5 fill-emerald-300" />
                {activeHealth.latencyMs}ms
              </span>
            )}
            {activeHealth?.status === 'offline' && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-500/25 text-red-300 border border-red-500/40">
                Slow/Offline
              </span>
            )}
            {!activeHealth && (
              <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/30 text-purple-200 border border-purple-500/40">
                {activeServer.quality}
              </span>
            )}

            <ChevronDown
              className={cn(
                "size-3.5 text-white/60 transition-transform duration-200",
                isOpen && "rotate-180 text-purple-400"
              )}
            />
          </button>

          {/* Backdrop to capture clicks over iframe and close dropdown */}
          {isOpen && (
            <div
              className="fixed inset-0 z-40 bg-black/20"
              onClick={(e) => {
                e.stopPropagation()
                setIsOpen(false)
              }}
            />
          )}

          {/* Dropdown Menu with Smart Positioning */}
          {isOpen && (
            <div
              style={menuStyle}
              className="absolute z-[100] rounded-2xl bg-[#0c0e17] border border-white/20 p-2.5 shadow-[0_20px_60px_rgba(0,0,0,0.95)] ring-1 ring-purple-500/30 animate-in fade-in zoom-in-95 duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-2.5 py-2 border-b border-white/10 mb-2 flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                  <Sparkles className="size-3 text-purple-400" />
                  Streaming Servers
                </span>
                
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => runHealthCheck(rawAvailable, true)}
                    disabled={isProbing}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 text-[10px] font-bold cursor-pointer transition-all disabled:opacity-50"
                    title="Benchmark all servers now"
                  >
                    <RefreshCw className={cn("size-2.5", isProbing && "animate-spin")} />
                    <span>{isProbing ? "Testing..." : "Speed Test"}</span>
                  </button>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/70 font-medium">
                    {availableServers.length}
                  </span>
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                {availableServers.map((server, idx) => {
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
                          ? "bg-purple-600/35 border border-purple-500/60 text-white shadow-sm ring-1 ring-purple-500/30"
                          : isOffline
                          ? "opacity-60 hover:opacity-100 hover:bg-red-500/10 text-white/60 border border-transparent"
                          : "hover:bg-white/10 text-white/80 hover:text-white border border-transparent",
                        idx === 0 && isOptimal && !isSelected && "border-emerald-500/30 bg-emerald-500/5"
                      )}
                    >
                      <div
                        className={cn(
                          "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md text-[10px] font-bold transition-colors",
                          isSelected
                            ? "bg-purple-600 text-white"
                            : isOptimal
                            ? "bg-emerald-500/30 text-emerald-300 border border-emerald-500/40"
                            : isOffline
                            ? "bg-red-500/20 text-red-400 border border-red-500/30"
                            : "bg-white/10 text-white/70 group-hover:bg-purple-600/40 group-hover:text-purple-200"
                        )}
                      >
                        {idx + 1}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-bold text-white truncate flex items-center gap-1">
                            {server.name}
                            {isCommunity && (
                              <span title="Community Server" className="inline-flex">
                                <Globe className="size-2.5 text-blue-400 shrink-0" />
                              </span>
                            )}
                            {isCustom && (
                              <span className="text-[9px] text-amber-400 font-normal shrink-0">(Custom)</span>
                            )}
                          </span>

                          <div className="flex items-center gap-1 shrink-0">
                            {/* Health Latency Badge */}
                            {health && (
                              <span
                                className={cn(
                                  "flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded font-mono font-bold tracking-tight border",
                                  isOptimal
                                    ? "bg-emerald-500/25 text-emerald-300 border-emerald-500/40"
                                    : health.status === 'fast'
                                    ? "bg-sky-500/20 text-sky-300 border-sky-500/30"
                                    : isSlow
                                    ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                                    : "bg-red-500/25 text-red-300 border-red-500/40"
                                )}
                              >
                                {isOptimal && <Zap className="size-2 fill-emerald-300" />}
                                {isSlow && <AlertTriangle className="size-2" />}
                                {isOffline && <XCircle className="size-2" />}
                                {isOffline ? "Offline" : `${health.latencyMs}ms`}
                              </span>
                            )}

                            <span
                              className={cn(
                                "text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider",
                                server.quality === "4K"
                                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                  : "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                              )}
                            >
                              {server.quality}
                            </span>
                          </div>
                        </div>

                        <p className="text-[10px] text-white/50 line-clamp-1 mt-0.5">
                          {isOffline
                            ? "⚠️ Not responding or high buffer rate"
                            : isOptimal
                            ? "⚡ Recommended: Lowest latency & verified response"
                            : server.description}
                        </p>
                      </div>

                      {isSelected && (
                        <Check className="size-4 text-purple-400 shrink-0 self-center" />
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Add / Submit Server Action Button */}
              <div className="pt-2 mt-2 border-t border-white/10 px-1 space-y-1.5">
                <button
                  type="button"
                  onClick={handleOpenAddModal}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-semibold transition-all cursor-pointer"
                >
                  <Plus className="size-3.5" />
                  <span>Submit or Add New Server</span>
                </button>
                <p className="text-[10px] text-white/40 text-center">
                  💡 Ranked automatically by real-time connection speed.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Built-in Submit Modal if triggered directly */}
        <SubmitServerModal
          isOpen={isSubmitModalOpen}
          onClose={() => setIsSubmitModalOpen(false)}
        />
      </>
    )
  }

  // Pills Variant (For details page hero / overview section)
  return (
    <>
      <div className={cn("space-y-2.5", className)}>
        {showLabel && (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30 shadow-sm">
                <Server className="size-3.5" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-white/90">
                Select Streaming Server
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Active: {activeServer.name}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => runHealthCheck(rawAvailable, true)}
                disabled={isProbing}
                className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
              >
                <RefreshCw className={cn("size-3", isProbing && "animate-spin")} />
                <span>{isProbing ? "Benchmarking..." : "Speed Test"}</span>
              </button>

              <button
                type="button"
                onClick={handleOpenAddModal}
                className="flex items-center gap-1 text-[11px] font-semibold text-purple-300 hover:text-purple-200 transition-colors cursor-pointer"
              >
                <Plus className="size-3" />
                <span>Add Server</span>
              </button>
            </div>
          </div>
        )}

        {/* Pill buttons grid/row */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {availableServers.map((server, index) => {
            const isSelected = server.id === activeServer.id
            const health = healthMap[server.id]
            const isOptimal = health?.status === 'optimal'
            const isOffline = health?.status === 'offline'

            return (
              <button
                key={server.id}
                type="button"
                onClick={() => handleSelect(server)}
                className={cn(
                  "group relative flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer active:scale-95 border",
                  isSelected
                    ? "bg-purple-600 text-white border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.4)] ring-1 ring-purple-300/50"
                    : isOffline
                    ? "opacity-60 bg-red-500/10 border-red-500/20 text-white/60 hover:opacity-100 hover:text-white"
                    : isOptimal
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-200 hover:bg-emerald-500/20"
                    : "bg-white/5 hover:bg-white/15 text-white/80 hover:text-white border-white/10 hover:border-purple-400/40"
                )}
              >
                <span
                  className={cn(
                    "size-4 rounded text-[9px] font-black flex items-center justify-center",
                    isSelected
                      ? "bg-white text-purple-900"
                      : isOptimal
                      ? "bg-emerald-500 text-black"
                      : "bg-white/10 text-white/70 group-hover:bg-purple-500/30 group-hover:text-purple-300"
                  )}
                >
                  {index + 1}
                </span>

                <span>{server.name}</span>

                {health && (
                  <span
                    className={cn(
                      "text-[9px] px-1 py-0.2 rounded font-mono font-bold",
                      isOptimal
                        ? "text-emerald-300"
                        : isOffline
                        ? "text-red-400"
                        : "text-white/60"
                    )}
                  >
                    {isOffline ? "Offline" : `${health.latencyMs}ms`}
                  </span>
                )}

                <span
                  className={cn(
                    "text-[9px] px-1.5 py-0.2 rounded font-bold uppercase tracking-tight",
                    isSelected
                      ? "bg-white/20 text-white"
                      : "bg-white/10 text-white/60 group-hover:text-purple-200"
                  )}
                >
                  {server.quality}
                </span>
              </button>
            )
          })}

          {/* Plus Add Server Pill */}
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-600/15 hover:bg-purple-600/25 text-purple-300 border border-purple-500/30 transition-all cursor-pointer"
          >
            <Plus className="size-3" />
            <span>Add Server</span>
          </button>
        </div>
      </div>

      <SubmitServerModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
      />
    </>
  )
}
