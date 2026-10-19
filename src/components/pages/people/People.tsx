import { useState, useRef } from "react"
import { useQuery } from "@tanstack/react-query"
import { useSearchParams, Link } from "react-router"
import {
  User,
  Sparkles,
  Flame,
  ExternalLink,
} from "lucide-react"
import { SearchBar } from "../../ui/search-bar"
import {
  popularPeopleQuery,
  searchPeopleQuery,
  type PersonItem,
  type KnownForItem,
} from "@/api/fetch-people"
import PremiumRibbon from "@/components/shadcn-space/pagination/pagination-02"
import { cn } from "@/lib/utils"

const DEPARTMENTS = [
  { id: "all", label: "All Talent" },
  { id: "Acting", label: "Acting" },
  { id: "Directing", label: "Directing" },
  { id: "Writing", label: "Writing" },
  { id: "Production", label: "Production" },
]

export default function People() {
  const [searchParams, setSearchParams] = useSearchParams()

  // URL state synchronization
  const pageFromUrl = parseInt(searchParams.get("page") || "1", 10)
  const queryFromUrl = searchParams.get("q") || ""
  const deptFromUrl = searchParams.get("dept") || "all"

  const page = pageFromUrl
  const activeQuery = queryFromUrl
  const selectedDept = deptFromUrl
  const [searchInputValue, setSearchInputValue] = useState(queryFromUrl)
  const [prevQuery, setPrevQuery] = useState(queryFromUrl)
  if (prevQuery !== queryFromUrl) {
    setPrevQuery(queryFromUrl)
    setSearchInputValue(queryFromUrl)
  }

  const topGridRef = useRef<HTMLDivElement>(null)

  // Queries: either search query or popular people query
  const isSearching = !!activeQuery.trim()

  const {
    data: popularData,
    isPending: isPopularPending,
    error: popularError,
  } = useQuery({
    ...popularPeopleQuery(page),
    enabled: !isSearching,
  })

  const {
    data: searchData,
    isPending: isSearchPending,
    error: searchError,
  } = useQuery({
    ...searchPeopleQuery(activeQuery, page),
    enabled: isSearching,
  })

  const rawPeople = isSearching
    ? searchData?.results || []
    : popularData?.results || []

  // Filter by department if selected
  const filteredPeople = rawPeople.filter((person: PersonItem) => {
    if (selectedDept === "all") return true
    return person.known_for_department === selectedDept
  })

  const totalPages = Math.min(
    isSearching ? searchData?.total_pages || 1 : popularData?.total_pages || 1,
    500
  )

  const isPending = isSearching ? isSearchPending : isPopularPending
  const error = isSearching ? searchError : popularError

  const handlePageChange = (newPage: number) => {
    const newParams = new URLSearchParams(searchParams)
    newParams.set("page", String(newPage))
    setSearchParams(newParams)
    topGridRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = searchInputValue.trim()
    const newParams = new URLSearchParams()
    if (trimmed) {
      newParams.set("q", trimmed)
    }
    if (selectedDept !== "all") {
      newParams.set("dept", selectedDept)
    }
    newParams.set("page", "1")
    setSearchParams(newParams)
  }

  const handleClearSearch = () => {
    setSearchInputValue("")
    const newParams = new URLSearchParams()
    if (selectedDept !== "all") {
      newParams.set("dept", selectedDept)
    }
    newParams.set("page", "1")
    setSearchParams(newParams)
  }

  const handleDeptSelect = (deptId: string) => {
    const newParams = new URLSearchParams(searchParams)
    if (deptId === "all") {
      newParams.delete("dept")
    } else {
      newParams.set("dept", deptId)
    }
    newParams.set("page", "1")
    setSearchParams(newParams)
  }

  return (
    <div className="min-h-screen bg-[#090b10] text-foreground pb-24 selection:bg-purple-500/30">
      {/* 1. Header / Hero Banner */}
      <section className="relative overflow-hidden border-b border-white/5 pt-24 sm:pt-28 pb-10 sm:pb-14">
        {/* Ambient Gradient Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-64 bg-gradient-to-b from-purple-600/15 via-indigo-600/5 to-transparent blur-3xl pointer-events-none" />
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-12 space-y-6 text-left">
          {/* Subtitle Badge */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-xs font-bold text-purple-300 tracking-wider uppercase">
              <Sparkles className="size-3.5 text-purple-400" />
              INDUSTRY TALENT & CELEBRITIES
            </span>
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
              <Flame className="size-3.5 text-amber-400" />
              Top Trendsetters
            </span>
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-white drop-shadow-xl">
              Popular People
            </h1>
            <p className="text-sm sm:text-base text-gray-400 max-w-2xl leading-relaxed">
              Explore acclaimed actors, visionary directors, and emerging talents
              shaping cinematic and television entertainment around the globe.
            </p>
          </div>

          {/* Search Bar & Filter Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-2">
            {/* Search Input */}
            <div className="w-full max-w-md">
              <SearchBar
                value={searchInputValue}
                onChange={setSearchInputValue}
                onSubmit={handleSearchSubmit}
                onClear={handleClearSearch}
                placeholder="Search actor, director, or creator..."
                size="md"
              />
            </div>

            {/* Department Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {DEPARTMENTS.map((dept) => (
                <button
                  key={dept.id}
                  onClick={() => handleDeptSelect(dept.id)}
                  className={cn(
                    "cursor-pointer px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap border",
                    selectedDept === dept.id
                      ? "bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-600/30 scale-102"
                      : "bg-white/5 border-white/10 text-muted-foreground hover:text-white hover:bg-white/10"
                  )}
                >
                  {dept.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Main Content Grid */}
      <div
        ref={topGridRef}
        className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 pt-8 sm:pt-12 space-y-10"
      >
        {/* Results Counter / Filter Indicator */}
        <div className="flex items-center justify-between text-left border-b border-white/5 pb-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <span>
              {isSearching ? `Search results for "${activeQuery}"` : "Trending Stars"}
            </span>
            <span>•</span>
            <span className="text-white font-bold">
              Page {page} of {totalPages}
            </span>
            {selectedDept !== "all" && (
              <>
                <span>•</span>
                <span className="text-purple-400 font-bold uppercase">
                  {selectedDept}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Loading Skeleton Grid */}
        {isPending ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
            {[...Array(18)].map((_, i) => (
              <div
                key={i}
                className="aspect-[2/3] w-full rounded-2xl bg-white/5 animate-pulse border border-white/10 space-y-2 p-3 flex flex-col justify-end"
              >
                <div className="h-4 bg-white/10 rounded w-3/4" />
                <div className="h-3 bg-white/10 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="py-20 rounded-2xl border border-dashed border-red-500/20 bg-red-500/5 text-center space-y-3">
            <p className="text-sm font-semibold text-red-400">
              Failed to load talent data. Please check your connection.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="cursor-pointer px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-all"
            >
              Retry
            </button>
          </div>
        ) : filteredPeople.length > 0 ? (
          /* People Grid */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
            {filteredPeople.map((person: PersonItem) => {
              const photoUrl = person.profile_path
                ? `https://image.tmdb.org/t/p/w500${person.profile_path}`
                : null

              const topWorks = (person.known_for || [])
                .map((w: KnownForItem) => w.title || w.name)
                .filter(Boolean)
                .slice(0, 2)
                .join(", ")

              return (
                <Link
                  key={person.id}
                  to={`/person/${person.id}`}
                  className="group relative cursor-pointer flex flex-col rounded-2xl overflow-hidden border border-white/10 bg-[#0d111a]/80 hover:border-purple-500/50 hover:bg-[#121622] transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1 select-none text-left"
                >
                  {/* Portrait Image Container */}
                  <div className="relative aspect-[2/3] w-full overflow-hidden bg-muted/20">
                    {photoUrl ? (
                      <img
                        src={photoUrl}
                        alt={person.name}
                        className="size-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="size-full flex flex-col items-center justify-center bg-gradient-to-br from-white/5 to-white/10 text-muted-foreground p-4 text-center">
                        <User className="size-14 text-white/20 mb-2" />
                        <span className="text-xs font-bold text-white/50">
                          No Photo
                        </span>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                    {/* Department badge top-left */}
                    <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md border border-white/15 text-[10px] font-black uppercase text-purple-300 tracking-wider shadow">
                      {person.known_for_department || "TALENT"}
                    </div>

                    {/* Popularity score badge top-right */}
                    {person.popularity && (
                      <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md border border-white/15 text-[10px] font-bold text-amber-300 flex items-center gap-1 shadow">
                        <Flame className="size-3 text-amber-400" />
                        <span>{Math.round(person.popularity)}</span>
                      </div>
                    )}

                    {/* Hover Quick-View Indicator */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/30">
                      <div className="size-10 rounded-full bg-white text-black flex items-center justify-center shadow-2xl transform scale-90 group-hover:scale-100 transition-transform">
                        <ExternalLink className="size-4" />
                      </div>
                    </div>
                  </div>

                  {/* Card Info Footer */}
                  <div className="p-3.5 space-y-1">
                    <h3 className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors truncate">
                      {person.name}
                    </h3>

                    {topWorks && (
                      <p className="text-[11px] text-muted-foreground line-clamp-1 leading-snug">
                        {topWorks}
                      </p>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="py-20 rounded-3xl border border-dashed border-white/10 bg-white/5 text-center space-y-3">
            <User className="size-10 text-muted-foreground mx-auto" />
            <h3 className="text-base font-bold text-white">No talent found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              We couldn't find any people matching your criteria. Try adjusting
              your search query or department filter.
            </p>
            {isSearching && (
              <button
                onClick={handleClearSearch}
                className="cursor-pointer px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white transition-all shadow"
              >
                Clear Search
              </button>
            )}
          </div>
        )}

        {/* 3. Pagination Ribbon Below */}
        {totalPages > 1 && (
          <div className="pt-6 sm:pt-10 flex justify-center">
            <PremiumRibbon
              currentPage={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  )
}
