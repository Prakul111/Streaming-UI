import { useState } from "react"
import { useSearchParams } from "react-router"
import { useQuery } from "@tanstack/react-query"
import CardContentList from "../card-content-list"
import { MovieRowSkeleton } from "../skeleton"
import { multiSearchQuery } from "@/api/fetch-search"
import PremiumRibbon from "../shadcn-space/pagination/pagination-02"

interface SearchResultItem {
  id: number
  media_type: "movie" | "tv" | string
  title?: string
  name?: string
  poster_path?: string | null
  vote_average?: number
  release_date?: string
  first_air_date?: string
}

export default function SearchPage() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get("q") || ""
  const [page, setPage] = useState(1)
  const [prevQuery, setPrevQuery] = useState(query)

  // Reset page to 1 whenever the query changes during render
  if (query !== prevQuery) {
    setPrevQuery(query)
    setPage(1)
  }

  const { data, isPending, error } = useQuery({
    ...multiSearchQuery({ query, page }),
    enabled: !!query,
  })

  if (error) {
    console.error("Failed to fetch search results from TMDB:", error)
  }

  const allResults: SearchResultItem[] = data?.results || []
  // Filter out entries that aren't movies or tv shows (e.g., actors/persons)
  const items = allResults.filter(
    (item: SearchResultItem) => item.media_type === "movie" || item.media_type === "tv"
  )
  const totalPages = Math.min(data?.total_pages || 1, 500)

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const gridClassName =
    "grid w-full grid-cols-2 justify-items-center sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6"

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12 pt-20 sm:pt-28 pb-16 flex-grow flex flex-col">
      <div className="border-b border-border/40 pb-4 mb-6 sm:mb-10">
        <h1 className="font-extrabold text-2xl sm:text-4xl md:text-5xl tracking-tight">
          Search Results
        </h1>
        {query && (
          <p className="text-muted-foreground mt-2 text-xs sm:text-sm font-medium">
            Showing matches for <span className="text-purple-600 dark:text-purple-400 font-bold">"{query}"</span>
          </p>
        )}
      </div>

      <div className="flex-grow flex flex-col justify-center">
        {!query ? (
          <div className="flex h-[250px] sm:h-[300px] flex-col items-center justify-center rounded-3xl border border-dashed border-border/40 bg-muted/5 p-6 sm:p-8 text-center">
            <span className="font-semibold text-base sm:text-lg text-muted-foreground">
              Search for movies and TV shows
            </span>
            <span className="mt-2 text-xs sm:text-sm text-muted-foreground/60 max-w-sm">
              Use the search bar in the navbar above to find your favorite movies, TV shows, and series.
            </span>
          </div>
        ) : isPending ? (
          <MovieRowSkeleton />
        ) : items.length > 0 ? (
          <div className="flex-grow flex flex-col">
            <div className={gridClassName}>
              {items.map((item: SearchResultItem) => {
                const isMovie = item.media_type === "movie"
                return (
                  <CardContentList
                    key={item.id}
                    id={item.id}
                    title={isMovie ? item.title || "" : item.name || ""}
                    image={
                      item.poster_path
                        ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                        : "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=500"
                    }
                    rating={
                      item.vote_average
                        ? parseFloat(item.vote_average.toFixed(1))
                        : 0.0
                    }
                    year={
                      isMovie
                        ? item.release_date
                          ? parseInt(item.release_date.split("-")[0]) || 0
                          : 0
                        : item.first_air_date
                          ? parseInt(item.first_air_date.split("-")[0]) || 0
                          : 0
                    }
                    type={isMovie ? "Movie" : "TV Show"}
                    className="w-full"
                  />
                )
              })}
            </div>

            {totalPages > 1 && (
              <div className="mt-12">
                <PremiumRibbon
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="flex h-[300px] flex-col items-center justify-center rounded-3xl border border-dashed border-border/40 bg-muted/5 p-8 text-center">
            <span className="font-semibold text-lg text-muted-foreground">
              No results found
            </span>
            <span className="mt-2 text-sm text-muted-foreground/60 max-w-sm">
              We couldn't find any movies or TV shows matching "{query}". Try checking your spelling or searching for a different term.
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
