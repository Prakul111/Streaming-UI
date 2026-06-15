import { useState } from "react"
import { X, Loader2 } from "lucide-react"

interface VideoPlayerModalProps {
  isOpen: boolean
  onClose: () => void
  embedUrl: string
  title: string
}

export default function VideoPlayerModal({
  isOpen,
  onClose,
  embedUrl,
  title,
}: VideoPlayerModalProps) {
  const [isLoading, setIsLoading] = useState(true)

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 md:p-8 animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-6xl aspect-video rounded-2xl bg-black overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(168,85,247,0.15)] scale-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 cursor-pointer flex size-10 items-center justify-center rounded-full bg-black/60 text-white border border-white/10 hover:bg-black/90 hover:scale-105 hover:border-purple-400/50 transition-all active:scale-95 group"
          aria-label="Close player"
        >
          <X className="size-5 group-hover:text-purple-400 transition-colors" />
        </button>

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10 gap-3">
            <Loader2 className="size-10 animate-spin text-purple-400" />
            <p className="text-sm font-semibold tracking-wide text-purple-200/80 animate-pulse">
              Loading Player...
            </p>
          </div>
        )}

        {/* Embed Frame */}
        <iframe
          src={embedUrl}
          title={title}
          className="size-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          onLoad={() => setIsLoading(false)}
        ></iframe>
      </div>
    </div>
  )
}
