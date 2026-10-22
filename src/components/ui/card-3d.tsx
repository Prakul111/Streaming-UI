import { Link } from "react-router"
import { cn } from "@/lib/utils"

export interface Card3DProps {
  id: number
  title: string
  image: string
  type: "movie" | "tv"
  year?: string | number
  rating?: number | string
  rank?: number
  badge?: string
  className?: string
  widthClassName?: string
}

function RankNumber({ rank }: { rank: number }) {
  const isTen = rank === 10
  const viewBoxWidth = isTen ? 78 : 50

  return (
    <div className="shrink-0 -mr-4 sm:-mr-5 md:-mr-6 z-0 select-none pointer-events-none">
      <svg
        viewBox={`0 0 ${viewBoxWidth} 100`}
        className="h-24 sm:h-28 md:h-34 w-auto overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <text
          x={isTen ? "48%" : "50%"}
          y="56%"
          textAnchor="middle"
          dominantBaseline="central"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.2"
          strokeLinejoin="round"
          className="text-white/40 dark:text-white/35 font-black text-[96px] italic tracking-tighter"
          style={{
            fontFamily: "Inter, system-ui, -apple-system, sans-serif",
            filter: "drop-shadow(0 4px 10px rgba(0, 0, 0, 0.5))",
          }}
        >
          {rank}
        </text>
      </svg>
    </div>
  )
}

export function Card3D({
  id,
  title,
  image,
  type,
  year,
  rating,
  rank,
  badge,
  className,
  widthClassName = "w-[220px] sm:w-[260px] md:w-[300px]",
}: Card3DProps) {
  const isMovie = type === "movie"
  const detailUrl = isMovie ? `/movie-details/${id}` : `/tv-details/${id}`

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    const rect = el.getBoundingClientRect()
    if (!rect.width || !rect.height) return
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    // Continuous proportional tilt (up to ±7deg for buttery smooth feel)
    const rx = ((0.5 - y) * 14).toFixed(2)
    const ry = ((x - 0.5) * 14).toFixed(2)
    el.setAttribute("data-tracking", "true")
    el.style.setProperty("--rx", `${rx}deg`)
    el.style.setProperty("--ry", `${ry}deg`)
    el.style.setProperty("--scale", "1.04")
    el.style.setProperty("--shine", `${(x * 100).toFixed(1)}% ${(y * 100).toFixed(1)}%`)
    el.style.setProperty("--shine-opacity", "1")
    el.style.setProperty("--duration", "160ms")
    el.style.setProperty("--ease", "cubic-bezier(0.25, 1, 0.5, 1)")
  }

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    el.removeAttribute("data-tracking")
    el.style.setProperty("--rx", "0deg")
    el.style.setProperty("--ry", "0deg")
    el.style.setProperty("--scale", "1")
    el.style.setProperty("--shine-opacity", "0")
    el.style.setProperty("--duration", "480ms")
    el.style.setProperty("--ease", "cubic-bezier(0.16, 1, 0.3, 1)")
  }

  return (
    <div className={cn("group/card flex items-center shrink-0", className)}>
      {rank !== undefined && <RankNumber rank={rank} />}

      <Link
        to={detailUrl}
        className={cn("z-10 block space-y-2.5 focus:outline-none", widthClassName)}
      >
        {/* 3D Hover Card conforming to DaisyUI 5 hover-3d */}
        <div
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="hover-3d w-full aspect-[16/9]"
        >
          <figure className="w-full h-full rounded-2xl overflow-hidden relative border border-white/10 bg-muted/20">
            <img
              src={image}
              alt={title}
              loading="lazy"
              decoding="async"
              className="size-full object-cover"
              onError={(e) => {
                ; (e.currentTarget as HTMLImageElement).src =
                  "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600"
              }}
            />
            {badge && (
              <span className="absolute top-2.5 right-2.5 z-10 px-2 py-0.5 rounded-full bg-white/95 text-black text-[10px] font-black uppercase tracking-wider shadow">
                {badge}
              </span>
            )}
          </figure>

          {/* 8 empty divs needed for the 3D effect */}
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>

        {/* Info below card matching Screenshot 1, 2, 3 */}
        <div className="space-y-1 px-1">
          <h3 className="font-bold text-sm sm:text-base text-foreground truncate group-hover/card:text-purple-400 transition-colors">
            {title}
          </h3>
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white/90 border border-white/10">
                {isMovie ? "MOVIE" : "SERIES"}
              </span>
              {year && (
                <span className="text-muted-foreground font-medium">
                  {year}
                </span>
              )}
            </div>
            {rating && (
              <div className="flex items-center gap-1 text-xs font-semibold text-foreground">
                <span className="text-amber-400">★</span>
                <span>{rating}</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  )
}

export function Card3DSkeleton({
  count = 5,
  withRank = false,
  widthClassName = "w-[220px] sm:w-[260px] md:w-[300px]",
}: {
  count?: number
  withRank?: boolean
  widthClassName?: string
}) {
  return (
    <div className="flex gap-4 sm:gap-6 overflow-hidden py-2 px-1">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center shrink-0">
          {withRank && (
            <div className="w-12 sm:w-14 h-24 sm:h-28 -mr-4 shrink-0 opacity-20 bg-muted/40 rounded-xl" />
          )}
          <div className={cn("space-y-2.5", widthClassName)}>
            <div className="w-full aspect-[16/9] rounded-2xl bg-muted/40 animate-pulse border border-border/30" />
            <div className="space-y-1 px-1">
              <div className="h-4 w-3/4 rounded-md bg-muted/50 animate-pulse" />
              <div className="flex justify-between items-center">
                <div className="h-3 w-16 rounded bg-muted/40 animate-pulse" />
                <div className="h-3 w-10 rounded bg-muted/40 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
