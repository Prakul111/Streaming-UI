import { useNavigate } from "react-router"
import { cn } from "@/lib/utils"

export interface CategoryItem {
  id: string
  label: string
  type: "movie" | "tv"
  dotColor: "amber" | "purple"
  route?: string
}

export const CATEGORIES: CategoryItem[] = [
  { id: "popular", label: "Popular", type: "movie", dotColor: "amber", route: "/movie" },
  { id: "in-theatres", label: "In Theatres", type: "movie", dotColor: "amber", route: "/movie?category=in-theatres" },
  { id: "coming-soon", label: "Coming Soon", type: "movie", dotColor: "amber" },
  { id: "for-rent", label: "For Rent", type: "movie", dotColor: "amber" },
  { id: "new-on-streaming", label: "New on Streaming", type: "movie", dotColor: "amber" },
  { id: "new-on-netflix", label: "New on Netflix", type: "movie", dotColor: "amber" },
  { id: "new-on-prime", label: "New on Prime", type: "movie", dotColor: "amber" },
  { id: "airing-tonight", label: "Airing Tonight", type: "tv", dotColor: "purple", route: "/tv-shows?category=airing-tonight" },
  { id: "new-series", label: "New Series", type: "tv", dotColor: "purple", route: "/tv-shows?category=new-series" },
  { id: "returning-this-week", label: "Returning This Week", type: "tv", dotColor: "purple", route: "/tv-shows?category=returning-this-week" },
  { id: "currently-airing", label: "Currently Airing", type: "tv", dotColor: "purple", route: "/tv-shows?category=currently-airing" },
  { id: "free-to-watch", label: "Free to Watch", type: "movie", dotColor: "amber" },
  { id: "top-rated", label: "Top Rated", type: "movie", dotColor: "amber", route: "/movie?category=top-rated" },
  { id: "hidden-gems", label: "Hidden Gems", type: "movie", dotColor: "amber" },
  { id: "critically-acclaimed", label: "Critically Acclaimed", type: "movie", dotColor: "amber" },
]

export const MOVIE_CATEGORIES = CATEGORIES

export function getCategoryFilterParams(categoryId: string) {
  const today = new Date()
  const todayStr = today.toISOString().split("T")[0]

  const past45Days = new Date(today)
  past45Days.setDate(past45Days.getDate() - 45)
  const past45DaysStr = past45Days.toISOString().split("T")[0]

  const next180Days = new Date(today)
  next180Days.setDate(next180Days.getDate() + 180)
  const next180DaysStr = next180Days.toISOString().split("T")[0]

  switch (categoryId) {
    case "popular":
      return {
        sortBy: "popularity.desc",
      }
    case "in-theatres":
      return {
        sortBy: "popularity.desc",
        releaseDateGte: past45DaysStr,
        releaseDateLte: todayStr,
      }
    case "coming-soon":
      return {
        sortBy: "popularity.desc",
        releaseDateGte: todayStr,
        releaseDateLte: next180DaysStr,
      }
    case "for-rent":
      return {
        sortBy: "popularity.desc",
        withWatchMonetizationTypes: "rent",
        watchRegion: "US",
      }
    case "new-on-streaming":
      return {
        sortBy: "popularity.desc",
        withWatchMonetizationTypes: "flatrate",
        watchRegion: "US",
      }
    case "new-on-netflix":
      return {
        sortBy: "popularity.desc",
        withWatchProviders: "8",
        watchRegion: "US",
      }
    case "new-on-prime":
      return {
        sortBy: "popularity.desc",
        withWatchProviders: "9",
        watchRegion: "US",
      }
    case "free-to-watch":
      return {
        sortBy: "popularity.desc",
        withWatchMonetizationTypes: "free",
        watchRegion: "US",
      }
    case "top-rated":
      return {
        sortBy: "vote_average.desc",
        voteCountGte: 300,
      }
    case "hidden-gems":
      return {
        sortBy: "vote_average.desc",
        voteAverageGte: 7.5,
        voteCountGte: 100,
        voteCountLte: 2500,
      }
    case "critically-acclaimed":
      return {
        sortBy: "vote_average.desc",
        voteAverageGte: 8.0,
        voteCountGte: 1000,
      }
    default:
      return {}
  }
}

export function getCategoryTitle(categoryId: string): string {
  switch (categoryId) {
    case "popular":
      return "Popular Movies"
    case "in-theatres":
      return "In Theatres"
    case "coming-soon":
      return "Coming Soon"
    case "for-rent":
      return "Movies For Rent"
    case "new-on-streaming":
      return "New on Streaming"
    case "new-on-netflix":
      return "New on Netflix"
    case "new-on-prime":
      return "New on Prime Video"
    case "free-to-watch":
      return "Free to Watch Movies"
    case "top-rated":
      return "Top Rated Movies"
    case "hidden-gems":
      return "Hidden Gems"
    case "critically-acclaimed":
      return "Critically Acclaimed Movies"
    default:
      return "Movies"
  }
}

export function getTvCategoryFilterParams(categoryId: string) {
  const today = new Date()
  const todayStr = today.toISOString().split("T")[0]

  const past7Days = new Date(today)
  past7Days.setDate(past7Days.getDate() - 7)
  const past7DaysStr = past7Days.toISOString().split("T")[0]

  const next7Days = new Date(today)
  next7Days.setDate(next7Days.getDate() + 7)
  const next7DaysStr = next7Days.toISOString().split("T")[0]

  const past14Days = new Date(today)
  past14Days.setDate(past14Days.getDate() - 14)
  const past14DaysStr = past14Days.toISOString().split("T")[0]

  const past90Days = new Date(today)
  past90Days.setDate(past90Days.getDate() - 90)
  const past90DaysStr = past90Days.toISOString().split("T")[0]

  switch (categoryId) {
    case "popular":
      return {
        sortBy: "popularity.desc",
      }
    case "new-series":
      return {
        sortBy: "popularity.desc",
        firstAirDateGte: past90DaysStr,
        firstAirDateLte: todayStr,
      }
    case "returning-this-week":
      return {
        sortBy: "popularity.desc",
        airDateGte: past7DaysStr,
        airDateLte: next7DaysStr,
      }
    case "currently-airing":
      return {
        sortBy: "popularity.desc",
        airDateGte: past14DaysStr,
        airDateLte: todayStr,
      }
    case "new-on-streaming":
      return {
        sortBy: "popularity.desc",
        withWatchMonetizationTypes: "flatrate",
        watchRegion: "US",
      }
    case "new-on-netflix":
      return {
        sortBy: "popularity.desc",
        withWatchProviders: "8",
        watchRegion: "US",
      }
    case "new-on-prime":
      return {
        sortBy: "popularity.desc",
        withWatchProviders: "9",
        watchRegion: "US",
      }
    case "free-to-watch":
      return {
        sortBy: "popularity.desc",
        withWatchMonetizationTypes: "free",
        watchRegion: "US",
      }
    case "top-rated":
      return {
        sortBy: "vote_average.desc",
        voteCountGte: 150,
      }
    case "hidden-gems":
      return {
        sortBy: "vote_average.desc",
        voteAverageGte: 7.5,
        voteCountGte: 50,
        voteCountLte: 1500,
      }
    case "critically-acclaimed":
      return {
        sortBy: "vote_average.desc",
        voteAverageGte: 8.0,
        voteCountGte: 500,
      }
    default:
      return {}
  }
}

export function getTvCategoryTitle(categoryId: string): string {
  switch (categoryId) {
    case "popular":
      return "Popular TV Shows"
    case "airing-tonight":
      return "TV Shows Airing Tonight"
    case "new-series":
      return "New TV Series"
    case "returning-this-week":
      return "Returning TV Shows This Week"
    case "currently-airing":
      return "Currently Airing TV Shows"
    case "new-on-streaming":
      return "New TV on Streaming"
    case "new-on-netflix":
      return "New TV on Netflix"
    case "new-on-prime":
      return "New TV on Prime Video"
    case "free-to-watch":
      return "Free to Watch TV Shows"
    case "top-rated":
      return "Top Rated TV Shows"
    case "hidden-gems":
      return "Hidden Gem TV Shows"
    case "critically-acclaimed":
      return "Critically Acclaimed TV Shows"
    default:
      return "TV Shows"
  }
}

interface MovieCategoryBarProps {
  activeCategory: string
  onCategoryChange: (categoryId: string) => void
  context?: "movie" | "tv"
  className?: string
}

export default function MovieCategoryBar({
  activeCategory,
  onCategoryChange,
  context = "movie",
  className,
}: MovieCategoryBarProps) {
  const navigate = useNavigate()

  const handleCategoryClick = (cat: CategoryItem) => {
    if (context === "tv") {
      // In TV context:
      if (cat.id === "in-theatres" || cat.id === "coming-soon" || cat.id === "for-rent") {
        navigate(`/movie?category=${cat.id}`)
        return
      }
      if (cat.type === "movie" && cat.id === "popular") {
        navigate("/movie")
        return
      }

      onCategoryChange(cat.id)
    } else {
      // In Movie context:
      if (cat.type === "tv") {
        navigate(cat.route || `/tv-shows?category=${cat.id}`)
        return
      }

      onCategoryChange(cat.id)
    }
  }

  return (
    <div
      className={cn(
        "w-full flex flex-wrap items-center gap-2 sm:gap-2.5 pb-2",
        className
      )}
      role="tablist"
      aria-label={`${context === "tv" ? "TV show" : "Movie"} categories`}
    >
      {CATEGORIES.map((cat) => {
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
                cat.dotColor === "amber"
                  ? "bg-amber-400 dark:bg-amber-400"
                  : "bg-fuchsia-500 dark:bg-purple-400"
              )}
            />
            <span>{cat.label}</span>
          </button>
        )
      })}
    </div>
  )
}
