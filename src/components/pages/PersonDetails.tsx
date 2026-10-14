import { useState, useMemo } from "react"
import { useParams, Link } from "react-router"
import { useQuery } from "@tanstack/react-query"
import {
  Search,
  X,
  ChevronDown,
  Star,
  User,
  Share2,
  Check,
  Globe,
} from "lucide-react"
import { personDetailsQuery, type CreditItem } from "@/api/fetch-people"
import { cn } from "@/lib/utils"

function formatBirthdayAndAge(birthday: string | null, deathday: string | null) {
  if (!birthday) return null
  const birthDate = new Date(birthday)
  if (isNaN(birthDate.getTime())) return birthday

  const endDate = deathday ? new Date(deathday) : new Date()
  let age = endDate.getFullYear() - birthDate.getFullYear()
  const m = endDate.getMonth() - birthDate.getMonth()
  if (m < 0 || (m === 0 && endDate.getDate() < birthDate.getDate())) {
    age--
  }

  const formattedBirth = birthDate.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })

  if (deathday) {
    const deathDate = new Date(deathday)
    const formattedDeath = !isNaN(deathDate.getTime())
      ? deathDate.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })
      : deathday
    return `${formattedBirth} (Died ${formattedDeath}, age ${age})`
  }

  return `${formattedBirth} (${age} years old)`
}

function getGenderLabel(gender?: number): string {
  switch (gender) {
    case 1:
      return "Female"
    case 2:
      return "Male"
    case 3:
      return "Non-binary"
    default:
      return "Not specified"
  }
}

export default function PersonDetails() {
  const { id } = useParams<{ id: string }>()
  const numericId = id ? parseInt(id, 10) : NaN

  // State
  const [isBioExpanded, setIsBioExpanded] = useState(false)
  const [activeDepartment, setActiveDepartment] = useState<string>("Acting")
  const [mediaTypeFilter, setMediaTypeFilter] = useState<"all" | "movie" | "tv">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isMediaTypeDropdownOpen, setIsMediaTypeDropdownOpen] = useState(false)
  const [isDeptDropdownOpen, setIsDeptDropdownOpen] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  // Query Person Details
  const {
    data: person,
    isPending,
    error,
  } = useQuery({
    ...personDetailsQuery(numericId),
    enabled: !isNaN(numericId) && numericId > 0,
  })

  // Available departments in person's credits
  const availableDepartments = useMemo(() => {
    if (!person) return ["Acting"]
    const depts = new Set<string>()
    if (person.combined_credits?.cast?.length > 0) {
      depts.add("Acting")
    }
    person.combined_credits?.crew?.forEach((c) => {
      if (c.department) depts.add(c.department)
    })
    const list = Array.from(depts)
    // Put known_for_department first if present
    if (person.known_for_department && list.includes(person.known_for_department)) {
      return [
        person.known_for_department,
        ...list.filter((d) => d !== person.known_for_department),
      ]
    }
    return list.length > 0 ? list : ["Acting"]
  }, [person])

  // Set default active department when person loads
  useMemo(() => {
    if (person?.known_for_department && availableDepartments.includes(person.known_for_department)) {
      setActiveDepartment(person.known_for_department)
    } else if (availableDepartments.length > 0) {
      setActiveDepartment(availableDepartments[0])
    }
  }, [person?.known_for_department, availableDepartments])

  // "Known For" Posters Carousel
  const knownForItems = useMemo(() => {
    if (!person?.combined_credits) return []
    const allCredits = [
      ...(person.combined_credits.cast || []),
      ...(person.combined_credits.crew || []),
    ]

    // Deduplicate by id and title
    const seen = new Set<string>()
    const unique = allCredits.filter((item) => {
      const key = `${item.media_type}-${item.id}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })

    // Filter items with posters and sort by popularity
    return unique
      .filter((item) => item.poster_path)
      .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
      .slice(0, 10)
  }, [person])

  // Filmography items for currently active department, filtered & sorted
  const filmographyItems = useMemo(() => {
    if (!person?.combined_credits) return []

    let rawList: CreditItem[] = []
    if (activeDepartment === "Acting") {
      rawList = person.combined_credits.cast || []
    } else {
      rawList = (person.combined_credits.crew || []).filter(
        (c) => c.department === activeDepartment
      )
    }

    // Media type filter
    if (mediaTypeFilter !== "all") {
      rawList = rawList.filter((c) => c.media_type === mediaTypeFilter)
    }

    // Search query filter
    const query = searchQuery.trim().toLowerCase()
    if (query) {
      rawList = rawList.filter((c) => {
        const title = (c.title || c.name || "").toLowerCase()
        const character = (c.character || "").toLowerCase()
        const job = (c.job || "").toLowerCase()
        return (
          title.includes(query) ||
          character.includes(query) ||
          job.includes(query)
        )
      })
    }

    // Sort by Year descending (items without year placed at top or bottom)
    return [...rawList].sort((a, b) => {
      const dateA = a.release_date || a.first_air_date || ""
      const dateB = b.release_date || b.first_air_date || ""
      if (!dateA && !dateB) return 0
      if (!dateA) return -1 // upcoming / unreleased at top
      if (!dateB) return 1
      return dateB.localeCompare(dateA)
    })
  }, [person, activeDepartment, mediaTypeFilter, searchQuery])

  // Total unique credits count
  const totalKnownCredits = useMemo(() => {
    if (!person?.combined_credits) return 0
    const set = new Set<string>()
    person.combined_credits.cast?.forEach((c) => set.add(`${c.media_type}-${c.id}`))
    person.combined_credits.crew?.forEach((c) => set.add(`${c.media_type}-${c.id}`))
    return set.size || person.combined_credits.cast?.length || 0
  }, [person])

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  if (isPending) {
    return (
      <div className="min-h-screen bg-[#090b10] text-foreground pt-28 pb-20 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto space-y-8 animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          <div className="lg:col-span-4 space-y-4">
            <div className="w-full aspect-[2/3] rounded-2xl bg-white/5 border border-white/10" />
            <div className="h-6 w-32 bg-white/10 rounded" />
            <div className="h-4 w-48 bg-white/5 rounded" />
            <div className="h-4 w-40 bg-white/5 rounded" />
          </div>
          <div className="lg:col-span-8 space-y-6">
            <div className="h-10 w-3/4 bg-white/10 rounded" />
            <div className="space-y-2">
              <div className="h-4 w-full bg-white/5 rounded" />
              <div className="h-4 w-5/6 bg-white/5 rounded" />
            </div>
            <div className="h-48 w-full bg-white/5 rounded-2xl" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !person) {
    return (
      <div className="min-h-screen bg-[#090b10] text-foreground pt-36 pb-20 px-4 text-center space-y-4">
        <User className="size-16 text-muted-foreground mx-auto" />
        <h2 className="text-2xl font-bold text-white">Person Not Found</h2>
        <p className="text-sm text-muted-foreground">
          We couldn't retrieve the requested artist information.
        </p>
        <Link
          to="/people"
          className="inline-block px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm transition-all"
        >
          Back to People
        </Link>
      </div>
    )
  }

  const profileUrl = person.profile_path
    ? `https://image.tmdb.org/t/p/h632${person.profile_path}`
    : null

  const formattedBirthday = formatBirthdayAndAge(person.birthday, person.deathday)

  return (
    <div className="min-h-screen bg-[#090b10] text-foreground pt-24 sm:pt-28 pb-24 selection:bg-purple-500/30">
      {/* Background ambient lighting */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-purple-600/10 via-indigo-600/5 to-transparent blur-3xl pointer-events-none -z-10" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 lg:px-12">
        {/* Two-Column Responsive Layout matching reference */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 text-left">
          {/* =========================================================
              LEFT COLUMN: Photo & Personal Info (TMDB Style)
          ========================================================== */}
          <aside className="lg:col-span-4 xl:col-span-3.5 space-y-8">
            {/* Profile Photo */}
            <div className="w-full max-w-sm sm:max-w-xs mx-auto lg:mx-0 aspect-[2/3] rounded-2xl overflow-hidden border border-white/10 bg-[#121620] shadow-2xl relative group">
              {profileUrl ? (
                <img
                  src={profileUrl}
                  alt={person.name}
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-102"
                />
              ) : (
                <div className="size-full flex flex-col items-center justify-center text-muted-foreground bg-white/5">
                  <User className="size-20 text-white/20 mb-2" />
                  <span className="text-xs font-bold text-white/50">No Photo</span>
                </div>
              )}
            </div>

            {/* Social / External Links */}
            <div className="flex items-center gap-2.5 max-w-sm sm:max-w-xs mx-auto lg:mx-0">
              {person.external_ids?.imdb_id && (
                <a
                  href={`https://www.imdb.com/name/${person.external_ids.imdb_id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 hover:bg-amber-500/25 transition-all text-xs font-black tracking-wider"
                  title="View on IMDb"
                >
                  IMDb
                </a>
              )}
              {person.external_ids?.instagram_id && (
                <a
                  href={`https://instagram.com/${person.external_ids.instagram_id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="size-8 rounded-lg bg-white/5 border border-white/10 hover:border-purple-500/40 hover:text-purple-400 flex items-center justify-center text-gray-300 transition-all text-xs font-bold"
                  title="Instagram"
                >
                  IG
                </a>
              )}
              {person.external_ids?.twitter_id && (
                <a
                  href={`https://twitter.com/${person.external_ids.twitter_id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="size-8 rounded-lg bg-white/5 border border-white/10 hover:border-purple-500/40 hover:text-purple-400 flex items-center justify-center text-gray-300 transition-all text-xs font-bold"
                  title="X (Twitter)"
                >
                  𝕏
                </a>
              )}
              {person.homepage && (
                <a
                  href={person.homepage}
                  target="_blank"
                  rel="noreferrer"
                  className="size-8 rounded-lg bg-white/5 border border-white/10 hover:border-purple-500/40 hover:text-purple-400 flex items-center justify-center text-gray-300 transition-all"
                  title="Official Website"
                >
                  <Globe className="size-4" />
                </a>
              )}
              <button
                onClick={handleShare}
                className="cursor-pointer size-8 rounded-lg bg-white/5 border border-white/10 hover:border-purple-500/40 hover:text-purple-400 flex items-center justify-center text-gray-300 transition-all ml-auto"
                title="Share Profile"
              >
                {isCopied ? <Check className="size-4 text-emerald-400" /> : <Share2 className="size-4" />}
              </button>
            </div>

            {/* Personal Info Heading */}
            <div className="space-y-5 pt-2 border-t border-white/5">
              <h2 className="text-xl font-bold text-white tracking-tight">
                Personal Info
              </h2>

              {/* Stage Name / Native Name */}
              {person.original_name && person.original_name !== person.name && (
                <div className="space-y-0.5">
                  <h3 className="text-sm font-semibold text-white">Stage Name</h3>
                  <p className="text-sm text-gray-300 font-medium">
                    {person.original_name}
                  </p>
                </div>
              )}

              {/* Known For */}
              <div className="space-y-0.5">
                <h3 className="text-sm font-semibold text-white">Known For</h3>
                <p className="text-sm text-gray-300">
                  {person.known_for_department || "Acting"}
                </p>
              </div>

              {/* Known Credits */}
              <div className="space-y-0.5">
                <h3 className="text-sm font-semibold text-white">Known Credits</h3>
                <p className="text-sm text-gray-300">
                  {totalKnownCredits}
                </p>
              </div>

              {/* Gender */}
              <div className="space-y-0.5">
                <h3 className="text-sm font-semibold text-white">Gender</h3>
                <p className="text-sm text-gray-300">
                  {getGenderLabel(person.gender)}
                </p>
              </div>

              {/* Birthday */}
              {formattedBirthday && (
                <div className="space-y-0.5">
                  <h3 className="text-sm font-semibold text-white">Birthday</h3>
                  <p className="text-sm text-gray-300 leading-snug">
                    {formattedBirthday}
                  </p>
                </div>
              )}

              {/* Place of Birth */}
              {person.place_of_birth && (
                <div className="space-y-0.5">
                  <h3 className="text-sm font-semibold text-white">Place of Birth</h3>
                  <p className="text-sm text-gray-300 leading-snug">
                    {person.place_of_birth}
                  </p>
                </div>
              )}

              {/* Also Known As */}
              {person.also_known_as && person.also_known_as.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <h3 className="text-sm font-semibold text-white">Also Known As</h3>
                  <div className="space-y-1">
                    {person.also_known_as.map((alias, idx) => (
                      <p key={idx} className="text-sm text-gray-300 leading-snug">
                        {alias}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* =========================================================
              RIGHT COLUMN: Name, Biography, Known For & Filmography Table
          ========================================================== */}
          <section className="lg:col-span-8 xl:col-span-8.5 space-y-10 min-w-0">
            {/* Person Name Heading */}
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
                {person.name}
              </h1>
            </div>

            {/* Biography */}
            <div className="space-y-2.5">
              <h2 className="text-lg sm:text-xl font-bold text-white">
                Biography
              </h2>
              {person.biography ? (
                <div className="space-y-2">
                  <p
                    className={cn(
                      "text-sm sm:text-base text-gray-300/95 leading-relaxed font-normal whitespace-pre-line",
                      !isBioExpanded && "line-clamp-6"
                    )}
                  >
                    {person.biography}
                  </p>
                  {person.biography.length > 350 && (
                    <button
                      onClick={() => setIsBioExpanded(!isBioExpanded)}
                      className="cursor-pointer text-xs font-bold text-purple-400 hover:text-purple-300 underline underline-offset-4 transition-colors"
                    >
                      {isBioExpanded ? "Read Less" : "Read More"}
                    </button>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  We don't have a biography for {person.name} yet.
                </p>
              )}
            </div>

            {/* Known For Horizontal Carousel */}
            {knownForItems.length > 0 && (
              <div className="space-y-3.5">
                <h2 className="text-lg sm:text-xl font-bold text-white">
                  Known For
                </h2>

                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent snap-x">
                  {knownForItems.map((item) => {
                    const isMovie = item.media_type === "movie"
                    const detailUrl = isMovie
                      ? `/movie-details/${item.id}`
                      : `/tv-details/${item.id}`
                    const itemTitle = item.title || item.name

                    return (
                      <Link
                        key={`${item.media_type}-${item.id}`}
                        to={detailUrl}
                        className="w-32 sm:w-36 md:w-40 shrink-0 snap-start group space-y-2 select-none"
                      >
                        <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden border border-white/10 bg-black/60 shadow-lg group-hover:border-purple-500/50 group-hover:shadow-purple-500/10 transition-all duration-300">
                          <img
                            src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                            alt={itemTitle}
                            className="size-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                          {/* Media badge */}
                          <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/75 backdrop-blur-md text-[9px] font-black uppercase text-white shadow">
                            {isMovie ? "Movie" : "TV"}
                          </div>

                          {/* Rating badge */}
                          {item.vote_average && item.vote_average > 0 ? (
                            <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-md text-[10px] font-bold text-amber-300 flex items-center gap-0.5 shadow">
                              <Star className="size-2.5 fill-amber-400 text-amber-400" />
                              <span>{item.vote_average.toFixed(1)}</span>
                            </div>
                          ) : null}
                        </div>

                        <p className="text-xs font-semibold text-center text-white/90 group-hover:text-purple-400 transition-colors truncate px-1">
                          {itemTitle}
                        </p>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Filmography Section with Department Heading, Search & Filter Dropdowns */}
            <div className="space-y-4 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                {/* Active Department Title */}
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  {activeDepartment}
                </h2>

                {/* Filter and Search Controls matching screenshot */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Search toggle / input */}
                  {isSearchOpen ? (
                    <div className="relative flex items-center animate-in fade-in duration-200">
                      <Search className="absolute left-2.5 size-3.5 text-muted-foreground" />
                      <input
                        type="text"
                        autoFocus
                        placeholder="Search credits..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-8 w-44 sm:w-52 rounded-lg border border-purple-500/40 bg-white/5 pl-8 pr-7 text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                      <button
                        onClick={() => {
                          setSearchQuery("")
                          setIsSearchOpen(false)
                        }}
                        className="absolute right-2 text-muted-foreground hover:text-white p-0.5 cursor-pointer"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsSearchOpen(true)}
                      className="cursor-pointer p-1.5 rounded-lg border border-white/10 bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                      title="Search credits"
                    >
                      <Search className="size-4" />
                    </button>
                  )}

                  {/* Media Type Dropdown ('All ▾', 'Movies', 'TV') */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        setIsMediaTypeDropdownOpen(!isMediaTypeDropdownOpen)
                        setIsDeptDropdownOpen(false)
                      }}
                      className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-200 transition-colors"
                    >
                      <span>
                        {mediaTypeFilter === "all"
                          ? "All"
                          : mediaTypeFilter === "movie"
                          ? "Movies"
                          : "TV Shows"}
                      </span>
                      <ChevronDown className="size-3 text-muted-foreground" />
                    </button>

                    {isMediaTypeDropdownOpen && (
                      <div className="absolute right-0 top-full mt-1.5 w-32 rounded-xl border border-white/15 bg-[#121622] p-1 shadow-2xl z-20 space-y-0.5 animate-in fade-in duration-150">
                        <button
                          onClick={() => {
                            setMediaTypeFilter("all")
                            setIsMediaTypeDropdownOpen(false)
                          }}
                          className={cn(
                            "w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors",
                            mediaTypeFilter === "all"
                              ? "bg-purple-600 text-white font-bold"
                              : "text-gray-300 hover:bg-white/10"
                          )}
                        >
                          All
                        </button>
                        <button
                          onClick={() => {
                            setMediaTypeFilter("movie")
                            setIsMediaTypeDropdownOpen(false)
                          }}
                          className={cn(
                            "w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors",
                            mediaTypeFilter === "movie"
                              ? "bg-purple-600 text-white font-bold"
                              : "text-gray-300 hover:bg-white/10"
                          )}
                        >
                          Movies
                        </button>
                        <button
                          onClick={() => {
                            setMediaTypeFilter("tv")
                            setIsMediaTypeDropdownOpen(false)
                          }}
                          className={cn(
                            "w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors",
                            mediaTypeFilter === "tv"
                              ? "bg-purple-600 text-white font-bold"
                              : "text-gray-300 hover:bg-white/10"
                          )}
                        >
                          TV Shows
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Department Dropdown ('Department ▾') */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        setIsDeptDropdownOpen(!isDeptDropdownOpen)
                        setIsMediaTypeDropdownOpen(false)
                      }}
                      className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-200 transition-colors"
                    >
                      <span>Department</span>
                      <ChevronDown className="size-3 text-muted-foreground" />
                    </button>

                    {isDeptDropdownOpen && (
                      <div className="absolute right-0 top-full mt-1.5 w-44 rounded-xl border border-white/15 bg-[#121622] p-1 shadow-2xl z-20 space-y-0.5 animate-in fade-in duration-150 max-h-60 overflow-y-auto scrollbar-thin">
                        {availableDepartments.map((dept) => (
                          <button
                            key={dept}
                            onClick={() => {
                              setActiveDepartment(dept)
                              setIsDeptDropdownOpen(false)
                            }}
                            className={cn(
                              "w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors flex items-center justify-between",
                              activeDepartment === dept
                                ? "bg-purple-600 text-white font-bold"
                                : "text-gray-300 hover:bg-white/10"
                            )}
                          >
                            <span>{dept}</span>
                            {dept === "Acting" ? (
                              <span className="text-[10px] opacity-75">
                                ({person.combined_credits?.cast?.length || 0})
                              </span>
                            ) : (
                              <span className="text-[10px] opacity-75">
                                (
                                {person.combined_credits?.crew?.filter(
                                  (c) => c.department === dept
                                ).length || 0}
                                )
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Filmography Timeline Table matching exact design */}
              <div className="rounded-2xl border border-white/10 bg-[#0c1017]/90 shadow-xl overflow-hidden">
                {filmographyItems.length > 0 ? (
                  <div className="divide-y divide-white/5">
                    {filmographyItems.map((credit, idx) => {
                      const date = credit.release_date || credit.first_air_date
                      const year = date ? date.slice(0, 4) : "—"
                      const title = credit.title || credit.name
                      const isMovie = credit.media_type === "movie"
                      const detailUrl = isMovie
                        ? `/movie-details/${credit.id}`
                        : `/tv-details/${credit.id}`

                      return (
                        <div
                          key={`${credit.credit_id || credit.id}-${idx}`}
                          className="flex items-start gap-4 sm:gap-6 px-4 sm:px-6 py-3.5 hover:bg-white/[0.03] transition-colors group"
                        >
                          {/* Year column */}
                          <div className="w-12 sm:w-14 shrink-0 pt-0.5 text-sm font-semibold text-gray-300 tabular-nums">
                            {year}
                          </div>

                          {/* Bullet Circle Indicator */}
                          <div className="shrink-0 pt-1.5">
                            <span className="inline-block size-2 rounded-full border-2 border-gray-400 group-hover:border-purple-400 group-hover:scale-125 transition-all" />
                          </div>

                          {/* Title & Character / Role Column */}
                          <div className="flex-1 min-w-0 space-y-0.5">
                            <Link
                              to={detailUrl}
                              className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors inline-block"
                            >
                              {title}
                            </Link>

                            {/* Role / Episodes Line */}
                            <div className="text-xs text-muted-foreground flex items-center gap-1.5 flex-wrap">
                              {/* If TV show with episode_count */}
                              {credit.episode_count && credit.episode_count > 0 ? (
                                <span className="underline underline-offset-2 decoration-white/20 text-gray-300 font-medium">
                                  {credit.episode_count} episodes
                                </span>
                              ) : null}

                              {/* Character Name */}
                              {credit.character ? (
                                <span>
                                  as{" "}
                                  <span className="text-gray-300 font-medium">
                                    {credit.character}
                                  </span>
                                </span>
                              ) : credit.job ? (
                                <span>
                                  ...{" "}
                                  <span className="text-purple-300 font-medium">
                                    {credit.job}
                                  </span>
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="py-12 text-center text-sm text-muted-foreground space-y-2">
                    <p>No credits found matching the active filters.</p>
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="cursor-pointer text-xs font-bold text-purple-400 hover:text-purple-300 underline"
                      >
                        Clear search
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
