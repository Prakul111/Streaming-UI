import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { ChevronDown, ChevronUp } from "lucide-react"
import CardContentList from "../../card-content-list"
import { MovieRowSkeleton } from "../../skeleton"
import { discoverMoviesQuery } from "@/api/fetch-movie"
import PremiumRibbon from "../../shadcn-space/pagination/pagination-02"
import { cn } from "@/lib/utils"

const MOVIE_GENRES = [
  { id: 28, name: "Action" },
  { id: 12, name: "Adventure" },
  { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" },
  { id: 99, name: "Documentary" },
  { id: 18, name: "Drama" },
  { id: 10751, name: "Family" },
  { id: 14, name: "Fantasy" },
  { id: 36, name: "History" },
  { id: 27, name: "Horror" },
  { id: 10402, name: "Music" },
  { id: 9648, name: "Mystery" },
  { id: 10749, name: "Romance" },
  { id: 878, name: "Sci-Fi" },
  { id: 10770, name: "TV Movie" },
  { id: 53, name: "Thriller" },
  { id: 10752, name: "War" },
  { id: 37, name: "Western" },
]

export default function PopularMovie() {
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

  // Filter States
  const [activeFilters, setActiveFilters] = useState({
    sortBy: "popularity.desc",
    withGenres: [] as number[],
    releaseDateGte: "",
    releaseDateLte: "",
  })

  const [draftFilters, setDraftFilters] = useState({
    sortBy: "popularity.desc",
    withGenres: [] as number[],
    releaseDateGte: "",
    releaseDateLte: "",
  })

  // Queries
  const { data, isPending, error } = useQuery(
    discoverMoviesQuery({
      page,
      sortBy: activeFilters.sortBy,
      withGenres: activeFilters.withGenres.join(","),
      releaseDateGte: activeFilters.releaseDateGte,
      releaseDateLte: activeFilters.releaseDateLte,
    })
  )

  if (error) {
    console.error("Failed to fetch discover movies from TMDB:", error)
  }

  const movies = data?.results || []
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
      <h1 className="font-extrabold mt-4 text-3xl sm:text-4xl md:text-5xl">Popular Movies</h1>

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
                  <option value="primary_release_date.desc">
                    Release Date Descending
                  </option>
                  <option value="primary_release_date.asc">
                    Release Date Ascending
                  </option>
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
                {/* Release Dates */}
                <div className="space-y-3">
                  <label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    Release Dates
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="w-10 text-xs text-muted-foreground">
                        from
                      </span>
                      <input
                        type="date"
                        value={draftFilters.releaseDateGte}
                        onChange={(e) =>
                          setDraftFilters((prev) => ({
                            ...prev,
                            releaseDateGte: e.target.value,
                          }))
                        }
                        className="flex-1 rounded-xl border border-border bg-background px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="w-10 text-xs text-muted-foreground">
                        to
                      </span>
                      <input
                        type="date"
                        value={draftFilters.releaseDateLte}
                        onChange={(e) =>
                          setDraftFilters((prev) => ({
                            ...prev,
                            releaseDateLte: e.target.value,
                          }))
                        }
                        className="flex-1 rounded-xl border border-border bg-background px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>

                {/* Genres */}
                <div className="space-y-3">
                  <label className="block text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    Genres
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {MOVIE_GENRES.map((genre) => {
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

        {/* Right Side: Movie Grid */}
        <div className="flex-grow flex flex-col min-w-0">
          {isPending ? (
            <MovieRowSkeleton />
          ) : movies.length > 0 ? (
            <div className={gridClassName}>
              {movies.map((movie: any) => (
                <CardContentList
                  key={movie.id}
                  id={movie.id}
                  title={movie.title}
                  image={
                    movie.poster_path
                      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                      : "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=500"
                  }
                  rating={
                    movie.vote_average
                      ? parseFloat(movie.vote_average.toFixed(1))
                      : 0.0
                  }
                  year={
                    movie.release_date
                      ? parseInt(movie.release_date.split("-")[0])
                      : 0
                  }
                  type="movie"
                  className="w-full"
                />
              ))}
            </div>
          ) : (
            <div className="flex h-[200px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/10">
              <span className="font-medium text-muted-foreground">
                No movies match your filters.
              </span>
              <span className="mt-1 text-xs text-muted-foreground/60">
                Try selecting different dates or genres.
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
