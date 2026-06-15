import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import CardContentList from "../../card-content-list"
import { MovieRowSkeleton } from "../../skeleton"
import { trendingTvQuery } from "@/api/fetch-trending"
import PremiumRibbon from "../../shadcn-space/pagination/pagination-02"
import { cn } from "@/lib/utils"

export default function TrendingTv() {
  const [page, setPage] = useState(1)
  const [timeWindow, setTimeWindow] = useState<"day" | "week">("day")

  // Query Trending TV Shows
  const { data, isPending, error } = useQuery(
    trendingTvQuery({ page, timeWindow })
  )

  if (error) {
    console.error("Failed to fetch trending tv shows from TMDB:", error)
  }

  const shows = data?.results || []
  const totalPages = Math.min(data?.total_pages || 1, 500)

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleTimeWindowChange = (window: "day" | "week") => {
    setTimeWindow(window)
    setPage(1) // Reset page to 1 on shift
  }

  const gridClassName =
    "grid w-full grid-cols-2 justify-items-center sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6"

  return (
    <div className="mx-auto max-w-7xl px-6 pt-24 pb-16 md:px-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-4">
        <h1 className="font-extrabold text-5xl">Trending TV Shows</h1>

        {/* Day / Week Switcher */}
        <div className="flex self-start rounded-xl border border-border/40 bg-muted/60 p-1.5 backdrop-blur-md sm:self-auto">
          <button
            onClick={() => handleTimeWindowChange("day")}
            className={cn(
              "cursor-pointer rounded-lg px-4 py-1.5 text-xs font-semibold transition-all duration-200",
              timeWindow === "day"
                ? "border border-border/15 bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Today
          </button>
          <button
            onClick={() => handleTimeWindowChange("week")}
            className={cn(
              "cursor-pointer rounded-lg px-4 py-1.5 text-xs font-semibold transition-all duration-200",
              timeWindow === "week"
                ? "border border-border/15 bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            This Week
          </button>
        </div>
      </div>

      <div className="mt-10">
        {isPending ? (
          <MovieRowSkeleton />
        ) : shows.length > 0 ? (
          <div className={gridClassName}>
            {shows.map((show: any) => (
              <CardContentList
                key={show.id}
                id={show.id}
                title={show.name}
                image={
                  show.poster_path
                    ? `https://image.tmdb.org/t/p/w500${show.poster_path}`
                    : "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=500"
                }
                rating={
                  show.vote_average
                    ? parseFloat(show.vote_average.toFixed(1))
                    : 0.0
                }
                year={
                  show.first_air_date
                    ? parseInt(show.first_air_date.split("-")[0])
                    : 0
                }
                type="TV Show"
                className="w-full"
              />
            ))}
          </div>
        ) : (
          <div className="flex h-[200px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/10">
            <span className="font-medium text-muted-foreground">
              No trending TV shows found.
            </span>
          </div>
        )}

        <div className="mt-12">
          <PremiumRibbon
            currentPage={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  )
}
