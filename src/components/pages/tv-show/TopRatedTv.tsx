import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { ChevronDown, ChevronUp } from "lucide-react"
import CardContentList from "../../card-content-list"
import { MovieRowSkeleton } from "../../skeleton"
import { discoverTvQuery } from "@/api/fetch-tv-shows"
import PremiumRibbon from "../../shadcn-space/pagination/pagination-02"
import { cn } from "@/lib/utils"

const TV_GENRES = [
  { id: 10759, name: "Action & Adventure" },
  { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" },
  { id: 99, name: "Documentary" },
  { id: 18, name: "Drama" },
  { id: 10751, name: "Family" },
  { id: 10762, name: "Kids" },
  { id: 9648, name: "Mystery" },
  { id: 10763, name: "News" },
  { id: 10764, name: "Reality" },
  { id: 10765, name: "Sci-Fi & Fantasy" },
  { id: 10766, name: "Soap" },
  { id: 10767, name: "Talk" },
  { id: 10768, name: "War & Politics" },
  { id: 37, name: "Western" },
]

export default function TopRatedTv() {
  const [page, setPage] = useState(1)

  // Collapsible states
  const [isSortOpen, setIsSortOpen] = useState(true)
  const [isFiltersOpen, setIsFiltersOpen] = useState(true)

  // Collapse filters by default on mobile/tablet viewports
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setIsSortOpen(false)
      setIsFiltersOpen(false)
    }
  }, [])

  // Filter States - Default sort by Rating Descending for Top Rated TV
  const [activeFilters, setActiveFilters] = useState({
    sortBy: "vote_average.desc",
    withGenres: [] as number[],
  })

  const [draftFilters, setDraftFilters] = useState({
    sortBy: "vote_average.desc",
    withGenres: [] as number[],
  })

  // Queries
  const { data, isPending, error } = useQuery(
    discoverTvQuery({
      page,
      sortBy: activeFilters.sortBy,
      withGenres: activeFilters.withGenres.join(","),
    })
  )

  if (error) {
    console.error("Failed to fetch discover tv from TMDB:", error)
  }

  const shows = data?.results || []
  const totalPages = Math.min(data?.total_pages || 1, 500)

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleSearch = () => {
    setActiveFilters({ ...draftFilters })
    setPage(1) // Reset page on filter submission
  }

  const toggleDraftGenre = (id: number) => {
    setDraftFilters((prev) => {
      const isSelected = prev.withGenres.includes(id)
      return {
        ...prev,
        withGenres: isSelected
          ? prev.withGenres.filter((genreId) => genreId !== id)
          : [...prev.withGenres, id],
      }
    })
  }

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDraftFilters((prev) => ({ ...prev, sortBy: e.target.value }))
  }

  const gridClassName =
    "grid w-full grid-cols-2 justify-items-center sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5 gap-4"

  return (
    <div className="mx-auto max-w-7xl px-6 pt-24 pb-16 md:px-12">
      <h1 className="font-extrabold mt-4 text-3xl sm:text-4xl md:text-5xl">Top Rated TV Shows</h1>

      <div className="mt-8 flex flex-col gap-8 lg:flex-row">
        {/* Left Side: Filter and Sort Sidebar */}
        <div className="w-full shrink-0 space-y-4 lg:w-80">
          {/* SORT BLOCK */}
          <div className="overflow-hidden rounded-2xl border border-border/40 bg-card/50 shadow-sm backdrop-blur-md">
            <button
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="flex w-full items-center justify-between border-b border-border/20 p-4 font-bold text-foreground transition-colors hover:bg-muted/10"
            >
              <span>Sort</span>
              {isSortOpen ? (
                <ChevronUp className="size-4" />
              ) : (
                <ChevronDown className="size-4" />
              )}
            </button>

            {isSortOpen && (
              <div className="space-y-3 p-4">
                <label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Sort Results By
                </label>
                <select
                  value={draftFilters.sortBy}
                  onChange={handleSortChange}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                >
                  <option value="popularity.desc">Popularity Descending</option>
                  <option value="popularity.asc">Popularity Ascending</option>
                  <option value="vote_average.desc">Rating Descending</option>
                  <option value="vote_average.asc">Rating Ascending</option>
                </select>
              </div>
            )}
          </div>

          {/* FILTERS BLOCK */}
          <div className="overflow-hidden rounded-2xl border border-border/40 bg-card/50 shadow-sm backdrop-blur-md">
            <button
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
              className="flex w-full items-center justify-between border-b border-border/20 p-4 font-bold text-foreground transition-colors hover:bg-muted/10"
            >
              <span>Filters</span>
              {isFiltersOpen ? (
                <ChevronUp className="size-4" />
              ) : (
                <ChevronDown className="size-4" />
              )}
            </button>

            {isFiltersOpen && (
              <div className="space-y-6 p-4">
                {/* Genres */}
                <div className="space-y-3">
                  <label className="block text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    Genres
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {TV_GENRES.map((genre) => {
                      const isSelected = draftFilters.withGenres.includes(
                        genre.id
                      )
                      return (
                        <button
                          key={genre.id}
                          onClick={() => toggleDraftGenre(genre.id)}
                          className={cn(
                            "cursor-pointer rounded-full border px-3 py-1 text-xs font-medium transition-all",
                            isSelected
                              ? "border-primary bg-primary text-primary-foreground shadow-sm"
                              : "border-border bg-transparent text-muted-foreground hover:border-muted-foreground"
                          )}
                        >
                          {genre.name}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SEARCH TRIGGER */}
          <button
            onClick={handleSearch}
            className="w-full cursor-pointer rounded-xl bg-primary py-3 text-center font-bold tracking-wide text-primary-foreground shadow-md transition-all hover:opacity-90 focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Search
          </button>
        </div>

        {/* Right Side: TV Grid */}
        <div className="flex-grow flex flex-col min-w-0">
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
                No TV Shows match your filters.
              </span>
              <span className="mt-1 text-xs text-muted-foreground/60">
                Try selecting different genres.
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
    </div>
  )
}
