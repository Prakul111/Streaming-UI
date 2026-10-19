import { useState } from "react"
import { useSearchParams } from "react-router"
import { useQuery } from "@tanstack/react-query"
import { Search, Sparkles, Film, TrendingUp } from "lucide-react"
import CardContentList from "../card-content-list"
import { MovieRowSkeleton } from "../skeleton"
import { multiSearchQuery } from "@/api/fetch-search"
import PremiumRibbon from "../shadcn-space/pagination/pagination-02"
import { SearchBar } from "../ui/search-bar"

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

const POPULAR_SUGGESTIONS = [
  "Spider-Man",
  "Avengers",
  "Breaking Bad",
  "Stranger Things",
  "Inception",
  "The Dark Knight",
  "Dune",
  "Interstellar",
  "Game of Thrones",
  "One Piece",
]

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get("q") || ""
  const [page, setPage] = useState(1)
  const [prevQuery, setPrevQuery] = useState(query)
  const [inputValue, setInputValue] = useState(query)

  // Sync input value and reset page when query changes
  if (query !== prevQuery) {
    setPrevQuery(query)
    setInputValue(query)
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
    (item: SearchResultItem) =>
      item.media_type === "movie" ||
      item.media_type === "tv" ||
      (!item.media_type && (!!item.title || !!item.name))
  )
  const totalPages = Math.min(data?.total_pages || 1, 500)

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }
    const trimmed = inputValue.trim()
    if (trimmed) {
      setSearchParams({ q: trimmed })
    } else {
      setSearchParams({})
    }
    setPage(1)
  }

  const handleClear = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }
    setInputValue("")
    setSearchParams({})
    setPage(1)
  }

  const handleSelectSuggestion = (suggestion: string) => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }
    setInputValue(suggestion)
    setSearchParams({ q: suggestion })
    setPage(1)
  }

  const gridClassName =
    "grid w-full grid-cols-2 justify-items-center sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6"

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12 pt-20 sm:pt-28 pb-16 flex-grow flex flex-col w-full">
      {/* Header & Page Title */}
      <div className="border-b border-border/40 pb-5 mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-extrabold text-2xl sm:text-4xl md:text-5xl tracking-tight flex items-center gap-3">
              <span>Search Database</span>
              <Sparkles className="size-6 text-purple-400" />
            </h1>
            <p className="text-muted-foreground mt-1.5 text-xs sm:text-sm">
              Discover millions of movies, TV shows, and series across TMDB.
            </p>
          </div>

          {query && items.length > 0 && (
            <div className="text-xs font-medium text-muted-foreground">
              <span>{data?.total_results ? data.total_results.toLocaleString() : items.length} results found</span>
            </div>
          )}
        </div>

        {/* On-Page Search Input */}
        <div className="w-full max-w-2xl mt-5">
          <SearchBar
            value={inputValue}
            onChange={setInputValue}
            onSubmit={handleSearchSubmit}
            onClear={handleClear}
            placeholder="Search movies, TV shows, franchises..."
            size="lg"
          />
        </div>
      </div>

      <div className="flex-grow flex flex-col justify-center">
        {!query ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/40 bg-muted/5 p-8 sm:p-12 text-center space-y-6">
            <div className="size-16 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400">
              <Search className="size-8" />
            </div>
            <div className="space-y-2 max-w-md">
              <h2 className="font-bold text-lg sm:text-xl text-foreground">
                Search for movies & television
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Type any title or keyword in the search bar above, or click on a trending recommendation below to start exploring.
              </p>
            </div>

            {/* Quick Suggestions Chips */}
            <div className="space-y-3 pt-2 max-w-xl">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-center gap-1.5">
                <TrendingUp className="size-3.5 text-amber-400" />
                Popular Searches
              </span>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {POPULAR_SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => handleSelectSuggestion(suggestion)}
                    className="cursor-pointer rounded-full border border-border/60 bg-card/60 px-3.5 py-1.5 text-xs font-medium text-muted-foreground hover:border-purple-500/50 hover:bg-purple-500/10 hover:text-purple-400 transition-all hover:scale-105 active:scale-95"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : isPending ? (
          <MovieRowSkeleton />
        ) : items.length > 0 ? (
          <div className="flex-grow flex flex-col">
            <div className="mb-4 flex items-center justify-between text-xs text-muted-foreground">
              <p>
                Showing matches for <span className="text-purple-400 font-bold">"{query}"</span>
              </p>
              <button
                type="button"
                onClick={handleClear}
                className="text-xs text-purple-400 hover:text-purple-300 underline cursor-pointer"
              >
                Clear Results
              </button>
            </div>

            <div className={gridClassName}>
              {items.map((item: SearchResultItem) => {
                const isMovie = item.media_type === "movie" || (!item.media_type && !!item.title)
                return (
                  <CardContentList
                    key={`${item.media_type || (isMovie ? "movie" : "tv")}-${item.id}`}
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
          <div className="flex h-[320px] flex-col items-center justify-center rounded-3xl border border-dashed border-border/40 bg-muted/5 p-8 text-center space-y-4">
            <div className="size-12 rounded-2xl bg-muted/40 flex items-center justify-center text-muted-foreground">
              <Film className="size-6" />
            </div>
            <div className="space-y-1">
              <h2 className="font-bold text-lg text-foreground">
                No titles found matching "{query}"
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-sm">
                Check for typos or try searching for another movie, television show, or character.
              </p>
            </div>
            <button
              onClick={handleClear}
              className="mt-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white transition-all shadow cursor-pointer"
            >
              Clear & Browse All
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
