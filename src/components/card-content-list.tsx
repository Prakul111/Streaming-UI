import { cn } from "@/lib/utils"
import { Link } from "react-router"
import starIcon from "@/assets/star-svgrepo-com.svg"

interface ContentListProps {
  id?: number
  title: string
  image: string
  rating: number
  year: number
  type: string
  className?: string
  releaseDate?: string
  mediaType?: "movie" | "tv"
}

export default function CardContentList({
  id,
  title,
  image,
  rating,
  year,
  type,
  className,
  releaseDate,
  mediaType,
}: ContentListProps) {
  const isMovie = mediaType ? mediaType === "movie" : type.toLowerCase().includes("movie")
  const detailUrl = isMovie ? `/movie-details/${id}` : `/tv-details/${id}`

  const formattedDate = releaseDate
    ? (() => {
      try {
        const d = new Date(releaseDate)
        return isNaN(d.getTime())
          ? ""
          : d.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
      } catch {
        return ""
      }
    })()
    : ""

  const isFullWidth = className?.includes("w-full")

  const cardContent = (
    <div
      className={cn("w-40 shrink-0 select-none p-1 sm:p-1.5 cursor-pointer group/card", className)}
    >
      <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-zinc-900/60 transition-all duration-300 ease-out group-hover/card:scale-[1.04] group-hover/card:border-white/30 group-hover/card:shadow-[0_20px_35px_-10px_rgba(0,0,0,0.8)]">
        <figure className="w-full overflow-hidden">
          <img
            className="aspect-[2/3] w-full rounded-2xl object-cover pointer-events-none transition-transform duration-500 ease-out group-hover/card:scale-105"
            src={image}
            alt={title}
            loading="lazy"
            decoding="async"
            onError={(e) => {
              ;(e.currentTarget as HTMLImageElement).src =
                "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=500"
            }}
          />
        </figure>
      </div>
      <div className="flex items-center justify-between gap-1 sm:gap-1.5 py-1.5 sm:py-2 text-[10px] sm:text-xs text-muted-foreground font-medium">
        <div className="flex items-center justify-center rounded-full bg-muted text-foreground px-1.5 sm:px-2 py-0.5 sm:py-1 whitespace-nowrap">
          <img
            src={starIcon}
            className="h-2.5 pr-0.5"
            alt="star"
          />
          {rating}
        </div>
        <span className="rounded-full bg-muted text-foreground px-1.5 sm:px-2 py-0.5 sm:py-1 whitespace-nowrap">{year}</span>
        <span className="rounded-full bg-muted text-foreground px-1.5 sm:px-2 py-0.5 sm:py-1 whitespace-nowrap truncate max-w-[65px] sm:max-w-none">{type}</span>
      </div>
      <div className="font-semibold px-0.5 sm:px-1 text-xs sm:text-sm leading-snug line-clamp-2 wrap-anywhere group-hover/card:text-white transition-colors">
        {title}
      </div>
      {formattedDate && (
        <div className="px-0.5 sm:px-1 text-[11px] text-muted-foreground mt-0.5 font-normal">
          {formattedDate}
        </div>
      )}
    </div>
  )

  if (id) {
    return (
      <Link
        to={detailUrl}
        className={cn("block no-underline focus:outline-none", isFullWidth ? "w-full" : "w-auto shrink-0")}
      >
        {cardContent}
      </Link>
    )
  }

  return cardContent
}
