import { useNavigate } from "react-router"
import { cn } from "@/lib/utils"

export interface AnimeCategoryItem {
  id: string
  label: string
  dotColor: "amber" | "purple" | "rose" | "cyan"
  route?: string
}

export const ANIME_CATEGORIES: AnimeCategoryItem[] = [
  { id: "popular", label: "Popular Anime", dotColor: "amber" },
  { id: "top-rated", label: "Top Rated", dotColor: "purple" },
  { id: "airing", label: "Currently Airing", dotColor: "cyan" },
  { id: "movies", label: "Anime Movies", dotColor: "rose" },
  { id: "shonen", label: "Shonen & Action", dotColor: "amber" },
  { id: "fantasy", label: "Fantasy & Isekai", dotColor: "purple" },
  { id: "romance", label: "Romance & Drama", dotColor: "rose" },
  { id: "comedy", label: "Comedy & Slice of Life", dotColor: "amber" },
  { id: "scifi", label: "Sci-Fi & Mecha", dotColor: "cyan" },
  { id: "classics", label: "Classic Legends", dotColor: "purple" },
  { id: "hidden-gems", label: "Hidden Gems", dotColor: "amber" },
  { id: "critically-acclaimed", label: "Critically Acclaimed", dotColor: "purple" },
]

export function getAnimeCategoryFilterParams(categoryId: string) {
  const today = new Date()
  const todayStr = today.toISOString().split("T")[0]

  const past30Days = new Date(today)
  past30Days.setDate(past30Days.getDate() - 30)
  const past30DaysStr = past30Days.toISOString().split("T")[0]

  switch (categoryId) {
    case "popular":
      return {
        sortBy: "popularity.desc",
      }
    case "top-rated":
      return {
        sortBy: "vote_average.desc",
        voteCountGte: 100,
      }
    case "airing":
      return {
        sortBy: "popularity.desc",
        airDateGte: past30DaysStr,
        airDateLte: todayStr,
        format: "tv" as const,
      }
    case "movies":
      return {
        sortBy: "popularity.desc",
        format: "movie" as const,
      }
    case "shonen":
      return {
        sortBy: "popularity.desc",
        withGenres: "10759,28",
      }
    case "fantasy":
      return {
        sortBy: "popularity.desc",
        withGenres: "10765,14",
      }
    case "romance":
      return {
        sortBy: "popularity.desc",
        withGenres: "18,10749",
      }
    case "comedy":
      return {
        sortBy: "popularity.desc",
        withGenres: "35",
      }
    case "scifi":
      return {
        sortBy: "popularity.desc",
        withGenres: "878,10765",
      }
    case "classics":
      return {
        sortBy: "vote_average.desc",
        firstAirDateLte: "2014-12-31",
        releaseDateLte: "2014-12-31",
        voteCountGte: 150,
      }
    case "hidden-gems":
      return {
        sortBy: "vote_average.desc",
        voteAverageGte: 7.5,
        voteCountGte: 30,
        voteCountLte: 600,
      }
    case "critically-acclaimed":
      return {
        sortBy: "vote_average.desc",
        voteAverageGte: 8.2,
        voteCountGte: 250,
      }
    default:
      return {}
  }
}

export function getAnimeCategoryTitle(categoryId: string): string {
  switch (categoryId) {
    case "popular":
      return "Popular Anime"
    case "top-rated":
      return "Top Rated Anime"
    case "airing":
      return "Currently Airing Anime"
    case "movies":
      return "Anime Movies"
    case "shonen":
      return "Shonen & Action Anime"
    case "fantasy":
      return "Fantasy & Isekai Anime"
    case "romance":
      return "Romance & Drama Anime"
    case "comedy":
      return "Comedy & Slice of Life"
    case "scifi":
      return "Sci-Fi & Mecha Anime"
    case "classics":
      return "Classic Anime Legends"
    case "hidden-gems":
      return "Hidden Gem Anime"
    case "critically-acclaimed":
      return "Critically Acclaimed Anime"
    default:
      return "Anime"
  }
}

interface AnimeCategoryBarProps {
  activeCategory: string
  onCategoryChange: (categoryId: string) => void
  className?: string
}

export default function AnimeCategoryBar({
  activeCategory,
  onCategoryChange,
  className,
}: AnimeCategoryBarProps) {
  const navigate = useNavigate()

  const handleCategoryClick = (cat: AnimeCategoryItem) => {
    if (cat.route) {
      navigate(cat.route)
      return
    }
    onCategoryChange(cat.id)
  }

  const getDotClass = (dotColor: AnimeCategoryItem["dotColor"]) => {
    switch (dotColor) {
      case "amber":
        return "bg-amber-400 dark:bg-amber-400"
      case "purple":
        return "bg-purple-500 dark:bg-purple-400"
      case "rose":
        return "bg-rose-500 dark:bg-rose-400"
      case "cyan":
        return "bg-cyan-400 dark:bg-cyan-400"
      default:
        return "bg-purple-400"
    }
  }

  return (
    <div
      className={cn(
        "w-full flex flex-wrap items-center gap-2 sm:gap-2.5 pb-2",
        className
      )}
      role="tablist"
      aria-label="Anime categories"
    >
      {ANIME_CATEGORIES.map((cat) => {
        const isActive = activeCategory === cat.id

        return (
          <button
            key={cat.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => handleCategoryClick(cat)}
            className={cn(
              "group relative inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs sm:text-[13px] font-medium transition-all duration-200 select-none cursor-pointer shrink-0 border",
              isActive
                ? "bg-[#032541] border-[#032541] text-white shadow-sm dark:bg-primary dark:border-primary dark:text-primary-foreground"
                : "bg-card/70 border-border/60 text-foreground/80 hover:bg-muted/80 hover:text-foreground hover:border-border dark:bg-card/40 dark:border-border/40"
            )}
          >
            <span
              className={cn(
                "size-2 sm:size-2.5 rounded-full shrink-0 transition-transform group-hover:scale-110",
                getDotClass(cat.dotColor)
              )}
            />
            <span>{cat.label}</span>
          </button>
        )
      })}
    </div>
  )
}
