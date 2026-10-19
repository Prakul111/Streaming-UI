import { useState, useRef, useEffect } from "react"
import {
  STREAMING_SERVERS,
  type StreamingServer,
  getStreamingServer,
  setStoredServerId,
} from "@/lib/streaming-servers"
import { cn } from "@/lib/utils"
import { Server, ChevronDown, Check, Zap, Sparkles } from "lucide-react"

interface StreamingServerSelectorProps {
  selectedServerId: string
  onServerChange: (serverId: string) => void
  onDirectPlay?: (serverId: string) => void
  variant?: "pills" | "dropdown" | "compact"
  align?: "left" | "right"
  className?: string
  showLabel?: boolean
}

export default function StreamingServerSelector({
  selectedServerId,
  onServerChange,
  onDirectPlay,
  variant = "pills",
  align = "right",
  className,
  showLabel = true,
}: StreamingServerSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const activeServer = getStreamingServer(selectedServerId)

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

  // Dropdown / Compact Variant (Perfect for player modal header)
  if (variant === "dropdown" || variant === "compact") {
    return (
      <div className={cn("relative inline-block text-left", className)} ref={dropdownRef}>
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
          <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/30 text-purple-200 border border-purple-500/40">
            {activeServer.quality}
          </span>
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

        {/* Dropdown Menu */}
        {isOpen && (
          <div
            className={cn(
              "absolute z-50 mt-2 w-72 sm:w-80 rounded-2xl bg-[#0c0e17] border border-white/20 p-2.5 shadow-[0_20px_60px_rgba(0,0,0,0.95)] ring-1 ring-purple-500/30 animate-in fade-in zoom-in-95 duration-150",
              align === "left" ? "left-0 right-auto" : "right-0 left-auto"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-2.5 py-2 border-b border-white/10 mb-2 flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                <Sparkles className="size-3 text-purple-400" />
                Select Streaming Server
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/70 font-medium">
                {STREAMING_SERVERS.length} Available
              </span>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
              {STREAMING_SERVERS.map((server, idx) => {
                const isSelected = server.id === activeServer.id
                return (
                  <button
                    key={server.id}
                    type="button"
                    onClick={() => handleSelect(server)}
                    className={cn(
                      "w-full flex items-start gap-2.5 p-2 rounded-xl text-left transition-all cursor-pointer group",
                      isSelected
                        ? "bg-purple-600/35 border border-purple-500/60 text-white shadow-sm ring-1 ring-purple-500/30"
                        : "hover:bg-white/10 text-white/80 hover:text-white border border-transparent"
                    )}
                  >
                    <div
                      className={cn(
                        "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md text-[10px] font-bold transition-colors",
                        isSelected
                          ? "bg-purple-600 text-white"
                          : "bg-white/10 text-white/70 group-hover:bg-purple-600/40 group-hover:text-purple-200"
                      )}
                    >
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-white truncate">
                          {server.name}
                        </span>
                        <div className="flex items-center gap-1 shrink-0">
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
                          <span className="flex items-center gap-0.5 text-[9px] text-emerald-400 font-semibold">
                            <Zap className="size-2.5 fill-emerald-400" />
                            {server.speed}
                          </span>
                        </div>
                      </div>
                      <p className="text-[10px] text-white/50 line-clamp-1 mt-0.5">
                        {server.description}
                      </p>
                    </div>
                    {isSelected && (
                      <Check className="size-4 text-purple-400 shrink-0 self-center" />
                    )}
                  </button>
                )
              })}
            </div>
            <div className="pt-2 mt-2 border-t border-white/10 px-2 text-[10px] text-white/40 text-center">
              💡 If a server buffers or stops, select another server above.
            </div>
          </div>
        )}
      </div>
    )
  }

  // Pills Variant (For details page hero / overview section)
  return (
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

          <span className="text-[11px] text-white/50 hidden sm:inline-flex items-center gap-1">
            <Zap className="size-3 text-emerald-400" />
            Pick another server if video buffers or doesn't start
          </span>
        </div>
      )}

      {/* Pill buttons grid/row */}
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        {STREAMING_SERVERS.map((server, index) => {
          const isSelected = server.id === activeServer.id
          return (
            <button
              key={server.id}
              type="button"
              onClick={() => handleSelect(server)}
              className={cn(
                "group relative flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer active:scale-95 border",
                isSelected
                  ? "bg-purple-600 text-white border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.4)] ring-1 ring-purple-300/50"
                  : "bg-white/5 hover:bg-white/15 text-white/80 hover:text-white border-white/10 hover:border-purple-400/40"
              )}
            >
              <span
                className={cn(
                  "size-4 rounded text-[9px] font-black flex items-center justify-center",
                  isSelected
                    ? "bg-white text-purple-900"
                    : "bg-white/10 text-white/70 group-hover:bg-purple-500/30 group-hover:text-purple-300"
                )}
              >
                {index + 1}
              </span>
              <span>{server.name}</span>
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
      </div>
    </div>
  )
}
