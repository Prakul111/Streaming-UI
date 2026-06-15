import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import CardContentList from "../../card-content-list"
import { MovieRowSkeleton } from "../../skeleton"
import { airingTodayQuery } from "@/api/fetch-tv-shows"
import PremiumRibbon from "../../shadcn-space/pagination/pagination-02"

export default function AiringTodayTv() {
  const [page, setPage] = useState(1)

  // Query Currently Airing TV Shows
  const { data, isPending, error } = useQuery(
    airingTodayQuery({ page })
  )

  if (error) {
    console.error("Failed to fetch airing today shows from TMDB:", error)
  }

  const shows = data?.results || []
  const totalPages = Math.min(data?.total_pages || 1, 500)

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const gridClassName =
    "grid w-full grid-cols-2 justify-items-center sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6"

  return (
    <div className="mx-auto max-w-7xl px-6 pt-24 pb-16 md:px-12">
      <h1 className="font-extrabold mt-4 text-3xl sm:text-4xl md:text-5xl">TV Shows Airing Today</h1>

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
              No TV shows currently airing today.
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
