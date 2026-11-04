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

  return (
    <div className={cn("group/card flex items-center shrink-0", className)}>
      {rank !== undefined && <RankNumber rank={rank} />}

      <Link
        to={detailUrl}
        className={cn("z-10 block space-y-2.5 focus:outline-none", widthClassName)}
      >
        <figure className="w-full aspect-[16/9] rounded-2xl overflow-hidden relative border border-white/10 bg-zinc-900/60 transition-all duration-300 ease-out group-hover/card:scale-[1.03] group-hover/card:border-white/30 group-hover/card:shadow-[0_20px_35px_-10px_rgba(0,0,0,0.8)]">
          <img
            src={image}
            alt={title}
            loading="lazy"
            decoding="async"
            className="size-full object-cover transition-transform duration-500 ease-out group-hover/card:scale-105"
            onError={(e) => {
              ;(e.currentTarget as HTMLImageElement).src =
                "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600"
            }}
          />
          {badge && (
            <span className="absolute top-2.5 right-2.5 z-10 px-2 py-0.5 rounded-full bg-white/95 text-black text-[10px] font-black uppercase tracking-wider shadow">
              {badge}
            </span>
          )}
        </figure>

        {/* Card info below image */}
        <div className="space-y-1 px-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <div className="flex items-center gap-2">
              {year && <span>{year}</span>}
              {year && type && <span>•</span>}
              <span className="capitalize">{type}</span>
            </div>
            {rating && (
              <div className="flex items-center gap-1 font-semibold text-foreground">
                <span className="text-amber-400">★</span>
                <span>{rating}</span>
              </div>
            )}
          </div>
          <h3 className="font-bold text-sm text-foreground truncate group-hover/card:text-white transition-colors">
            {title}
          </h3>
        </div>
      </Link>
    </div>
  )
}
export default Card3D

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
