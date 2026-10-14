import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { useSearchParams } from "react-router"
import { ChevronDown, ChevronUp, Search, X, Sparkles } from "lucide-react"
import CardContentList from "../../card-content-list"
import { MovieRowSkeleton } from "../../skeleton"
import PremiumRibbon from "../../shadcn-space/pagination/pagination-02"
import {
  discoverTvQuery,
  searchTvShowsQuery,
  type TvShowItem,
} from "@/api/fetch-tv-shows"
import MovieCategoryBar, {
  getTvCategoryFilterParams,
  getTvCategoryTitle,
} from "../../movie-category-bar"
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

export default function PopularTv() {
  const [page, setPage] = useState(1)
  const [searchParams, setSearchParams] = useSearchParams()

  const activeCategory = searchParams.get("category") || "popular"
  const categoryFilters = getTvCategoryFilterParams(activeCategory)
  const queryFromUrl = searchParams.get("q") || ""

  const [searchInputValue, setSearchInputValue] = useState(queryFromUrl)
  const [activeQuery, setActiveQuery] = useState(queryFromUrl)
  const isSearching = !!activeQuery.trim()

  useEffect(() => {
    setActiveQuery(queryFromUrl)
    setSearchInputValue(queryFromUrl)
  }, [queryFromUrl])

  // Collapsible states - default collapsed on mobile/tablet viewports
  const [isSortOpen, setIsSortOpen] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth >= 1024 : true
  )
  const [isFiltersOpen, setIsFiltersOpen] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth >= 1024 : true
  )

  // Filter States
  const [activeFilters, setActiveFilters] = useState({
    sortBy: "",
    withGenres: [] as number[],
    airDateGte: "",
    airDateLte: "",
  })

  const [draftFilters, setDraftFilters] = useState({
    sortBy: "popularity.desc",
    withGenres: [] as number[],
    airDateGte: "",
    airDateLte: "",
  })

  // Determine effective query parameters
  const effectiveSortBy =
    activeFilters.sortBy || categoryFilters.sortBy || "popularity.desc"
  const effectiveAirDateGte =
    activeFilters.airDateGte || categoryFilters.airDateGte
  const effectiveAirDateLte =
    activeFilters.airDateLte || categoryFilters.airDateLte

  // Queries: Discover vs Search
  const {
    data: discoverData,
    isPending: isDiscoverPending,
    error: discoverError,
  } = useQuery({
    ...discoverTvQuery({
      page,
      sortBy: effectiveSortBy,
      withGenres: activeFilters.withGenres.join(","),
      airDateGte: effectiveAirDateGte,
      airDateLte: effectiveAirDateLte,
      firstAirDateGte: categoryFilters.firstAirDateGte,
      firstAirDateLte: categoryFilters.firstAirDateLte,
      watchRegion: categoryFilters.watchRegion,
      withWatchProviders: categoryFilters.withWatchProviders,
      withWatchMonetizationTypes: categoryFilters.withWatchMonetizationTypes,
      voteAverageGte: categoryFilters.voteAverageGte,
      voteCountGte: categoryFilters.voteCountGte,
      voteCountLte: categoryFilters.voteCountLte,
    }),
    enabled: !isSearching,
  })

  const {
    data: searchData,
    isPending: isSearchPending,
    error: searchError,
  } = useQuery({
    ...searchTvShowsQuery(activeQuery, page),
    enabled: isSearching,
  })

  if (discoverError || searchError) {
    console.error("Failed to fetch tv shows from TMDB:", discoverError || searchError)
  }

  const shows = isSearching
    ? searchData?.results || []
    : discoverData?.results || []
  const totalPages = Math.min(
    isSearching ? searchData?.total_pages || 1 : discoverData?.total_pages || 1,
    500
  )
  const isPending = isSearching ? isSearchPending : isDiscoverPending

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleCategoryChange = (categoryId: string) => {
    const newParams = new URLSearchParams()
    if (categoryId !== "popular") {
      newParams.set("category", categoryId)
    }
    // Clear search query when explicitly switching category
    setSearchInputValue("")
    setActiveQuery("")
    setSearchParams(newParams)
    setPage(1)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = searchInputValue.trim()
    const newParams = new URLSearchParams(searchParams)
    if (trimmed) {
      newParams.set("q", trimmed)
    } else {
      newParams.delete("q")
    }
    setSearchParams(newParams)
    setActiveQuery(trimmed)
    setPage(1)
  }

  const handleClearSearch = () => {
    setSearchInputValue("")
    setActiveQuery("")
    const newParams = new URLSearchParams(searchParams)
    newParams.delete("q")
    setSearchParams(newParams)
    setPage(1)
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
    "grid w-full grid-cols-2 justify-items-center sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5"

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12 pt-20 sm:pt-24 pb-16">
      {/* Category Pills on Top */}
      <div className="mb-6">
        <MovieCategoryBar
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
          context="tv"
        />
      </div>

      {/* Header with Title and Search Bar */}
      <div className="mt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
              {isSearching ? "Search TV Shows" : getTvCategoryTitle(activeCategory)}
            </h1>
            {isSearching && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-xs font-bold text-purple-300">
                <Sparkles className="size-3 text-purple-400" />
                Search
              </span>
            )}
          </div>
          {isSearching && (
            <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-2">
              <span>
                Showing results for <span className="text-purple-400 font-bold">"{activeQuery}"</span>
                {searchData?.total_results !== undefined && (
                  <span className="text-muted-foreground ml-1">({searchData.total_results.toLocaleString()} found)</span>
                )}
              </span>
              <span>•</span>
              <button
                type="button"
                onClick={handleClearSearch}
                className="text-xs font-semibold text-purple-400 hover:text-purple-300 underline cursor-pointer"
              >
                Clear search
              </button>
            </p>
          )}
        </div>

        {/* TV Show Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="relative w-full md:max-w-md shrink-0"
        >
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search TV shows by name, keyword..."
            value={searchInputValue}
            onChange={(e) => setSearchInputValue(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/5 pl-10 pr-24 py-2.5 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 backdrop-blur-md transition-all shadow-inner"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {searchInputValue && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="p-1 rounded-full text-muted-foreground hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Clear search"
              >
                <X className="size-3.5" />
              </button>
            )}
            <button
              type="submit"
              className="px-3.5 py-1 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      <div className="mt-6 sm:mt-8 flex flex-col gap-6 lg:gap-8 lg:flex-row">
        {/* Left Side: Filter and Sort Sidebar */}
        <div className="w-full shrink-0 space-y-4 lg:w-72 xl:w-80">
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
                  <option value="first_air_date.desc">Air Date Descending</option>
                  <option value="first_air_date.asc">Air Date Ascending</option>
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
                {/* Air Dates */}
                <div className="space-y-3">
                  <label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    Air Dates
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="w-10 text-xs text-muted-foreground">
                        from
                      </span>
                      <input
                        type="date"
                        value={draftFilters.airDateGte}
                        onChange={(e) =>
                          setDraftFilters((prev) => ({
                            ...prev,
                            airDateGte: e.target.value,
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
                        value={draftFilters.airDateLte}
                        onChange={(e) =>
                          setDraftFilters((prev) => ({
                            ...prev,
                            airDateLte: e.target.value,
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
              {shows.map((show: TvShowItem) => (
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
                      ? parseInt(show.first_air_date.split("-")[0]) || 0
                      : 0
                  }
                  releaseDate={show.first_air_date}
                  type="TV Show"
                  className="w-full"
                />
              ))}
            </div>
          ) : (
            <div className="flex h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/10 p-6 text-center">
              <Search className="size-8 text-muted-foreground/50 mb-2" />
              <span className="font-bold text-foreground">
                {isSearching
                  ? `No TV shows found matching "${activeQuery}"`
                  : "No TV Shows match your filters."}
              </span>
              <span className="mt-1 text-xs text-muted-foreground/75 max-w-sm">
                {isSearching
                  ? "Try checking your spelling or search for another show title."
                  : "Try selecting different dates or genres."}
              </span>
              {isSearching && (
                <button
                  onClick={handleClearSearch}
                  className="mt-4 px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white transition-all shadow cursor-pointer"
                >
                  Clear Search
                </button>
              )}
            </div>
          )}

          {shows.length > 0 && totalPages > 1 && (
            <div className="mt-12">
              <PremiumRibbon
                currentPage={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
