import { Zap, Activity, FastForward, CheckCircle2 } from 'lucide-react'
import { useServerHealth } from '@/context/server-health-context'

export default function PreflightServerModal() {
  const { preflightModal, cancelPreflight } = useServerHealth()

  if (!preflightModal || !preflightModal.isOpen) return null

  const progressPercent = Math.min(
    100,
    Math.round((preflightModal.testedCount / Math.max(1, preflightModal.totalCount)) * 100)
  )

  const isCompleted = progressPercent >= 100

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Finding Optimal Server"
    >
      <div className="relative w-full max-w-md bg-[#0c0e17] border border-purple-500/40 rounded-3xl p-6 sm:p-7 shadow-[0_0_60px_rgba(168,85,247,0.35)] overflow-hidden text-center">
        {/* Ambient Top Glow */}
        <div className="absolute -top-20 inset-x-0 h-40 bg-gradient-to-b from-purple-600/30 via-purple-500/10 to-transparent blur-2xl pointer-events-none" />

        {/* Skip button top-right */}
        <button
          type="button"
          onClick={cancelPreflight}
          className="cursor-pointer absolute top-4 right-4 flex items-center gap-1 px-3 py-1 rounded-full bg-white/5 border border-white/10 hover:bg-white/15 text-white/70 hover:text-white text-[11px] font-semibold transition-all"
        >
          <span>Skip</span>
          <FastForward className="size-3 text-purple-400" />
        </button>

        {/* Central Pulsing Radar / Speed Icon */}
        <div className="relative mx-auto size-16 mb-4 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-purple-500/20 animate-ping opacity-60" />
          <div className="relative size-14 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 border border-purple-400/50 flex items-center justify-center text-white shadow-[0_0_25px_rgba(168,85,247,0.6)]">
            <Zap className="size-7 fill-white text-white animate-pulse" />
          </div>
        </div>

        {/* Title & Status Header */}
        <div className="space-y-1 mb-5">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-purple-400 flex items-center justify-center gap-1.5">
            <Activity className="size-3 text-purple-400 animate-spin" />
            Live Pre-Flight Probe
          </span>
          <h3 className="text-base sm:text-lg font-bold text-white truncate px-2">
            Optimizing Stream for {preflightModal.title}
          </h3>
          <p className="text-xs text-white/60">
            {isCompleted
              ? 'Fastest server selected! Loading player...'
              : `Pinging top streaming mirrors for low buffer & instant playback...`}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2 mb-5">
          <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden p-0.5 border border-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-500 via-indigo-500 to-emerald-400 transition-all duration-200 shadow-[0_0_12px_rgba(168,85,247,0.8)]"
              style={{ width: `${Math.max(8, progressPercent)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-white/70 px-1">
            <span>
              {preflightModal.testedCount} / {preflightModal.totalCount} servers checked
            </span>
            <span className="text-purple-300 font-bold">{progressPercent}%</span>
          </div>
        </div>

        {/* Real-time Ticker Feed */}
        <div className="p-3 rounded-2xl bg-black/50 border border-white/10 text-left flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5 truncate">
            {isCompleted ? (
              <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
            ) : (
              <div className="size-2 rounded-full bg-purple-400 animate-ping shrink-0" />
            )}
            <span className="text-white/80 font-medium truncate">
              {isCompleted
                ? `Optimal server locked: ${preflightModal.bestServerFound || 'CineSRC'}`
                : `Testing: ${preflightModal.latestTestedServer || 'AutoEmbed'}`}
            </span>
          </div>

          {preflightModal.latestLatency && !isCompleted && (
            <span className="text-[11px] font-mono font-bold text-emerald-400 shrink-0">
              {preflightModal.latestLatency}ms
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
