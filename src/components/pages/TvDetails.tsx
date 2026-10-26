import { useState, useEffect, useRef } from "react"
import { useParams, useSearchParams, Link } from "react-router"
import { useQuery } from "@tanstack/react-query"
import {
  Play,
  X,
  Star,
  Clock,
  Tv,
  Check,
  Film,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  Columns3,
  User,
  Clapperboard,
} from "lucide-react"
import {
  tvDetailsQuery,
  tvCreditsQuery,
  tvVideosQuery,
  tvRecommendationsQuery,
  tvSeasonQuery,
  tvExternalIdsQuery,
} from "@/api/fetch-tv-shows"
import CardContentList from "../card-content-list"
import { MovieRowSkeleton } from "../skeleton"
import { cn } from "@/lib/utils"
import VideoPlayerModal from "../video-player-modal"
import StreamingServerSelector from "../streaming-server-selector"
import { getStoredServerId } from "@/lib/streaming-servers"

export default function TvDetails() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const numericId = id ? parseInt(id, 10) : NaN
  const autoplay = searchParams.get("autoplay") === "true"

  const [isTrailerOpen, setIsTrailerOpen] = useState(false)
  const [isPlayerOpen, setIsPlayerOpen] = useState(false)
  const [selectedServerId, setSelectedServerId] = useState<string>(getStoredServerId)
  const [playerSeason, setPlayerSeason] = useState(1)
  const [playerEpisode, setPlayerEpisode] = useState(1)
  const [selectedSeason, setSelectedSeason] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [isOverviewExpanded, setIsOverviewExpanded] = useState(false)
  const [episodeViewMode, setEpisodeViewMode] = useState<"cards" | "grid" | "list">("cards")
  const [isSeasonDropdownOpen, setIsSeasonDropdownOpen] = useState(false)
  const [watchedEpisodes, setWatchedEpisodes] = useState<number[]>([])

  const episodesScrollRef = useRef<HTMLDivElement>(null)
  const episodesSectionRef = useRef<HTMLDivElement>(null)
  const similarsSectionRef = useRef<HTMLDivElement>(null)

  // TMDB Queries
  const { data: show, isPending: isShowPending, error: showError } = useQuery({
    ...tvDetailsQuery(numericId),
    enabled: !isNaN(numericId),
  })

  const { data: credits } = useQuery({
    ...tvCreditsQuery(numericId),
    enabled: !isNaN(numericId),
  })

  const { data: videos } = useQuery({
    ...tvVideosQuery(numericId),
    enabled: !isNaN(numericId),
  })

  const { data: recommendations } = useQuery({
    ...tvRecommendationsQuery(numericId),
    enabled: !isNaN(numericId),
  })

  const { data: seasonData, isPending: isSeasonPending } = useQuery({
    ...tvSeasonQuery(numericId, selectedSeason),
    enabled: !isNaN(numericId) && !!selectedSeason,
  })

  const { data: externalIds } = useQuery({
    ...tvExternalIdsQuery(numericId),
    enabled: !isNaN(numericId),
  })

  // Find trailer video
  const trailerVideo =
    videos?.results?.find(
      (vid: any) => vid.type === "Trailer" && vid.site === "YouTube"
    ) || videos?.results?.find((vid: any) => vid.site === "YouTube")

  // Trigger autoplay trailer if specified in query param
  useEffect(() => {
    if (autoplay && trailerVideo) {
      setIsTrailerOpen(true)
    }
  }, [autoplay, trailerVideo])

  // Scroll to top when TV show ID changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
    setSelectedSeason(1)
    setSearchQuery("")
    setSortOrder("asc")
  }, [id])

  if (isNaN(numericId)) {
    return (
      <div className="flex h-screen flex-col items-center justify-center pt-24 text-center">
        <h2 className="text-2xl font-bold text-destructive">Invalid TV Show ID</h2>
        <Link to="/" className="mt-4 text-primary hover:underline">
          Back to Home
        </Link>
      </div>
    )
  }

  if (isShowPending) {
    return (
      <div className="mx-auto max-w-7xl px-6 pt-28 pb-16 md:px-12">
        <div className="space-y-6">
          <div className="h-[400px] w-full animate-pulse rounded-3xl bg-muted/30" />
          <MovieRowSkeleton />
        </div>
      </div>
    )
  }

  if (showError || !show) {
    return (
      <div className="flex h-screen flex-col items-center justify-center pt-24 text-center">
        <h2 className="text-2xl font-bold text-destructive">TV Show Not Found</h2>
        <Link to="/" className="mt-4 text-primary hover:underline">
          Back to Home
        </Link>
      </div>
    )
  }

  const cast = credits?.cast?.slice(0, 12) || []
  const recommendedShows = recommendations?.results?.slice(0, 12) || []
  const airYear = show.first_air_date ? show.first_air_date.split("-")[0] : "N/A"

  // Available seasons (excluding special season 0 if it has no episodes)
  const seasons = show.seasons?.filter((s: any) => s.season_number > 0 && s.episode_count > 0) || []

  // Filter & Sort Episodes
  const rawEpisodes = seasonData?.episodes || []
  const filteredEpisodes = rawEpisodes.filter((ep: any) =>
    ep.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ep.overview.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const sortedEpisodes = [...filteredEpisodes].sort((a: any, b: any) => {
    if (sortOrder === "asc") {
      return a.episode_number - b.episode_number
    } else {
      return b.episode_number - a.episode_number
    }
  })

  const backdropUrl = show.backdrop_path
    ? `https://image.tmdb.org/t/p/w1280${show.backdrop_path}`
    : "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1600"

  const ratingPercent = show.vote_average ? Math.round(show.vote_average * 10) : 0
  const starCount = Math.round((show.vote_average || 0) / 2)

  const creator =
    show.created_by?.[0] ||
    credits?.crew?.find(
      (c: any) =>
        c.job === "Creator" ||
        c.job === "Executive Producer" ||
        c.job === "Writer"
    )

  const creatorName = creator?.name

  const showrunners =
    credits?.crew
      ?.filter(
        (c: any) =>
          c.job === "Executive Producer" ||
          c.job === "Showrunner" ||
          c.job === "Co-Executive Producer"
      )
      .slice(0, 2) || []

  const producers =
    credits?.crew
      ?.filter(
        (c: any) =>
          c.job === "Producer" ||
          c.job === "Supervising Producer" ||
          c.job === "Consulting Producer" ||
          c.job === "Line Producer"
      )
      .slice(0, 2) || []

  const toggleEpisodeWatched = (episodeId: number) => {
    setWatchedEpisodes((prev) =>
      prev.includes(episodeId)
        ? prev.filter((id) => id !== episodeId)
        : [...prev, episodeId]
    )
  }

  const scrollEpisodes = (direction: "left" | "right") => {
    if (!episodesScrollRef.current) return
    const offset = direction === "left" ? -400 : 400
    episodesScrollRef.current.scrollBy({ left: offset, behavior: "smooth" })
  }

  const latestEpisode =
    show.last_episode_to_air ||
    show.next_episode_to_air ||
    (seasonData?.episodes && seasonData.episodes[seasonData.episodes.length - 1])

  const network = show.networks?.[0]

  const formatLongDate = (dateStr?: string) => {
    if (!dateStr) return "N/A"
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    } catch {
      return dateStr
    }
  }

  const formatShortDate = (dateStr?: string) => {
    if (!dateStr) return "N/A"
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    } catch {
      return dateStr
    }
  }

  return (
    <div className="w-full min-h-screen bg-[#090b10] text-foreground pb-24 selection:bg-purple-500/30">
      {/* 1. HERO SECTION (CinemaOS Hero Layout matching HomePage) */}
      <section className="relative w-full min-h-[75vh] sm:min-h-[82vh] lg:min-h-[88vh] max-h-[960px] bg-black overflow-hidden select-none flex flex-col justify-end">
        {/* Cinematic Backdrop Image - Crystal clear on mobile and desktop */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <img
            src={backdropUrl}
            alt={show.name}
            className="size-full object-cover object-center"
          />
        </div>

        {/* Dark gradient mask overlays for legibility - matching HomePage */}
        <div className="absolute inset-x-0 top-0 h-28 sm:h-36 z-10 bg-gradient-to-b from-black/80 via-black/30 to-transparent pointer-events-none" />
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#090b10] via-[#090b10]/80 via-35% md:via-[#090b10]/40 to-transparent pointer-events-none" />
        <div className="hidden md:block absolute inset-0 z-10 bg-gradient-to-r from-[#090b10] via-[#090b10]/75 via-45% to-transparent pointer-events-none" />

        {/* Far right vertical watermark matching HomePage */}
        <div
          aria-hidden="true"
          className="hidden xl:flex absolute right-5 top-1/2 -translate-y-1/2 z-20 pointer-events-none select-none"
        >
          <span className="[writing-mode:vertical-rl] text-[10px] tracking-[0.45em] text-white/20 uppercase font-bold">
            Streaming-ui
          </span>
        </div>

        {/* Main Hero Container - Pinned to bottom matching HomePage */}
        <div className="relative z-20 max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-12 pt-24 sm:pt-28 pb-8 sm:pb-12 flex flex-col justify-end size-full">
          <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6 lg:gap-10 w-full">
          {/* Left Column: Metadata, Title, Ratings, Overview, Creator, Actions */}
          <div className="flex-1 space-y-3 sm:space-y-4 max-w-2xl xl:max-w-3xl text-left">
            {/* Top Badges Row */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold tracking-wider uppercase text-gray-300">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-white/10 border border-white/15 text-[11px] font-bold text-white tracking-widest uppercase shadow-sm">
                <Tv className="size-3 text-purple-400" />
                Streaming-UI
              </span>
              <span>•</span>
              <span className="text-white/90">SERIES</span>
              <span>•</span>
              <span>{airYear}-</span>
              <span>•</span>
              <span>
                {show.number_of_seasons || seasons.length}{" "}
                {show.number_of_seasons === 1 ? "SEASON" : "SEASONS"}
              </span>
              <span>•</span>
              <span className="px-1.5 py-0.5 rounded border border-white/20 text-[10px] text-white/90 bg-white/5 font-bold">
                TV-MA
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-7xl xl:text-8xl font-black uppercase tracking-tight text-white leading-[0.95] drop-shadow-2xl">
              {show.name}
            </h1>

            {/* Tagline */}
            {show.tagline && (
              <p className="text-sm sm:text-base italic text-gray-400 font-medium">
                "{show.tagline}"
              </p>
            )}

            {/* Ratings & Genres Row */}
            <div className="flex flex-wrap items-center gap-3 pt-0.5 text-xs md:text-sm font-semibold">
              {/* Star Rating Icons */}
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      "size-4",
                      star <= starCount
                        ? "fill-amber-400 text-amber-400"
                        : "fill-white/10 text-white/20"
                    )}
                  />
                ))}
              </div>

              {/* Match Score */}
              <span className="font-extrabold text-white">{ratingPercent}%</span>
              <span className="text-muted-foreground text-xs">
                ({show.vote_count?.toLocaleString() || 0})
              </span>

              {/* IMDb Badge */}
              <span className="bg-[#f5c518] text-black font-extrabold text-[11px] px-1.5 py-0.5 rounded shadow-sm tracking-tight">
                IMDb
              </span>

              {/* Genres Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                {show.genres?.slice(0, 3).map((genre: any) => (
                  <span
                    key={genre.id}
                    className="rounded-full bg-white/10 border border-white/10 px-3 py-0.5 text-xs font-medium text-white/90 backdrop-blur-sm"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Synopsis / Overview */}
            {show.overview && (
              <div className="space-y-1">
                <p
                  className={cn(
                    "text-xs sm:text-sm text-gray-300 font-normal leading-relaxed drop-shadow transition-all",
                    !isOverviewExpanded && "line-clamp-3"
                  )}
                >
                  {show.overview}
                </p>
                {show.overview.length > 180 && (
                  <button
                    onClick={() => setIsOverviewExpanded(!isOverviewExpanded)}
                    className="cursor-pointer text-xs font-bold text-purple-400 hover:text-purple-300 underline underline-offset-4 transition-colors"
                  >
                    {isOverviewExpanded ? "Read Less" : "Read More"}
                  </button>
                )}
              </div>
            )}

            {/* Creator Mention */}
            {creatorName && (
              <div className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wider font-semibold">
                CREATED BY <span className="text-white font-bold ml-1">{creatorName}</span>
              </div>
            )}

            {/* Action Buttons Row */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              {/* Play Button */}
              <button
                onClick={() => {
                  setPlayerSeason(1)
                  setPlayerEpisode(1)
                  setIsPlayerOpen(true)
                }}
                className="cursor-pointer flex items-center justify-center gap-2.5 rounded-full bg-white hover:bg-white/90 text-black font-bold px-7 py-2.5 text-sm shadow-xl hover:scale-105 active:scale-95 transition-all"
              >
                <Play className="size-4 fill-black text-black" />
                <span>Play</span>
              </button>

              {/* Trailer Button */}
              {trailerVideo && (
                <button
                  onClick={() => setIsTrailerOpen(true)}
                  className="cursor-pointer flex items-center justify-center gap-2.5 rounded-full border border-white/20 bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-2.5 text-sm backdrop-blur-md hover:scale-105 active:scale-95 transition-all"
                >
                  <Film className="size-4 text-white" />
                  <span>Trailer</span>
                </button>
              )}

            </div>


          </div>

          {/* Right Column: Hero Preview Card / Latest Episode Card (Desktop) */}
          <div className="hidden lg:block w-80 xl:w-96 shrink-0">
            <div className="rounded-2xl bg-[#121620]/80 backdrop-blur-xl border border-white/10 p-4 shadow-2xl space-y-3.5">
              {/* Preview Video / Latest Episode Thumbnail */}
              <div
                onClick={() => {
                  if (latestEpisode) {
                    setPlayerSeason(latestEpisode.season_number)
                    setPlayerEpisode(latestEpisode.episode_number)
                    setIsPlayerOpen(true)
                  } else if (trailerVideo) {
                    setIsTrailerOpen(true)
                  }
                }}
                className="relative aspect-video w-full rounded-xl overflow-hidden group cursor-pointer border border-white/10 bg-black/60 shadow-lg"
              >
                <img
                  src={
                    latestEpisode?.still_path
                      ? `https://image.tmdb.org/t/p/w500${latestEpisode.still_path}`
                      : backdropUrl
                  }
                  alt={latestEpisode?.name || show.name}
                  className="size-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                {/* Badge top-left */}
                <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-black uppercase text-white/90 tracking-widest shadow-md">
                  LATEST EPISODE
                </div>

                {/* Central Play Button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="size-11 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white group-hover:scale-110 group-hover:bg-purple-600 group-hover:border-purple-500 transition-all shadow-xl">
                    <Play className="size-5 fill-white text-white ml-0.5" />
                  </div>
                </div>

                {/* Bottom title & info */}
                <div className="absolute bottom-2.5 inset-x-3 text-left">
                  <p className="text-xs font-bold text-white truncate drop-shadow">
                    {latestEpisode?.name || "Latest Episode"}
                  </p>
                  <p className="text-[10px] text-white/70">
                    {latestEpisode
                      ? `S${latestEpisode.season_number} • E${latestEpisode.episode_number} • Aired ${formatShortDate(latestEpisode.air_date)} • ${latestEpisode.runtime ? `${latestEpisode.runtime}m` : "50m"}`
                      : "Available to stream"}
                  </p>
                </div>
              </div>

              {/* Link to watch latest episode */}
              <button
                onClick={() => {
                  if (latestEpisode) {
                    setPlayerSeason(latestEpisode.season_number)
                    setPlayerEpisode(latestEpisode.episode_number)
                    setIsPlayerOpen(true)
                  }
                }}
                className="cursor-pointer w-full flex items-center justify-between text-xs font-semibold text-white/80 hover:text-white transition-colors pt-0.5"
              >
                <span>Watch latest episode</span>
                <span className="text-sm">→</span>
              </button>

              <div className="border-t border-white/10" />

              {/* Starring row with avatars and names */}
              <div className="space-y-1.5 text-left">
                <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">
                  STARRING
                </span>
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2.5 overflow-hidden shrink-0">
                    {cast.slice(0, 4).map((actor: any) => (
                      <img
                        key={actor.id}
                        src={
                          actor.profile_path
                            ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
                            : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150"
                        }
                        alt={actor.name}
                        className="size-8 rounded-full border-2 border-[#121620] object-cover ring-1 ring-white/10"
                        title={actor.name}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-white/80 truncate leading-tight">
                    {cast.slice(0, 3).map((a: any) => a.name).join(", ")}
                  </p>
                </div>
              </div>
            </div>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Status / Network Metadata Bar below Hero */}
      <div className="relative z-20 max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-12 -mt-4 sm:-mt-6 mb-8">
        <div className="rounded-2xl bg-[#0d121c]/80 backdrop-blur-xl border border-white/10 px-6 py-3.5 flex flex-wrap items-center justify-between gap-6 shadow-xl">
            {/* Left metadata points */}
            <div className="flex flex-wrap items-center gap-6 sm:gap-10 text-left">
              <div className="space-y-0.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  STATUS
                </div>
                <div className="text-xs sm:text-sm font-bold text-white">
                  {show.status || "Returning Series"}
                </div>
              </div>

              <div className="space-y-0.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  LANGUAGE
                </div>
                <div className="text-xs sm:text-sm font-bold text-white">
                  {show.original_language?.toUpperCase() || "EN"}
                </div>
              </div>

              <div className="space-y-0.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  FIRST AIRED
                </div>
                <div className="text-xs sm:text-sm font-bold text-white">
                  {formatLongDate(show.first_air_date)}
                </div>
              </div>

              <div className="space-y-0.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  LAST AIRED
                </div>
                <div className="text-xs sm:text-sm font-bold text-white">
                  {formatLongDate(show.last_air_date || latestEpisode?.air_date)}
                </div>
              </div>

              <div className="space-y-0.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  SEASONS
                </div>
                <div className="text-xs sm:text-sm font-bold text-white">
                  {show.number_of_seasons || seasons.length}
                </div>
              </div>

              <div className="space-y-0.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  EPISODES
                </div>
                <div className="text-xs sm:text-sm font-bold text-white">
                  {show.number_of_episodes || 0}
                </div>
              </div>
            </div>

            {/* Right Network Logo / Name */}
            {network && (
              <div className="flex items-center gap-3 text-right">
                <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground [writing-mode:vertical-rl] rotate-180">
                  NETWORK
                </span>
                <div className="h-6 w-px bg-white/10" />
                <div className="flex items-center">
                  {network.logo_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/h60${network.logo_path}`}
                      alt={network.name}
                      className="h-6 max-w-[120px] object-contain filter invert opacity-90 hover:opacity-100 transition-opacity"
                      title={network.name}
                    />
                  ) : (
                    <span className="text-xs font-black tracking-widest uppercase text-white/80">
                      {network.name}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

      {/* Main Details Body */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12 mt-8 sm:mt-12 space-y-10 sm:space-y-16">

        {/* =======================================================================
            2. EPISODES SECTION (Screenshot Reference)
        ======================================================================= */}
        {seasons.length > 0 && (
          <section ref={episodesSectionRef} className="space-y-5 text-left">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/5 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[11px] font-bold tracking-widest text-muted-foreground uppercase">
                  <div className="w-1 h-3.5 bg-purple-500 rounded-full" />
                  <span>
                    SEASON {selectedSeason} • {sortedEpisodes.length} EPISODES
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Episodes
                </h2>
              </div>

              {/* Controls Toolbar: Primary Selectors & View Toggles */}
              <div className="relative z-20 flex flex-wrap items-center justify-between sm:justify-end gap-2 sm:gap-2.5 pb-1 md:pb-0">
                {/* 1. Primary Dropdowns Cluster (Season + Server Selector) */}
                <div className="flex items-center gap-2 shrink-0">
                  {/* Season Dropdown Pill */}
                  <div className="relative shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsSeasonDropdownOpen(!isSeasonDropdownOpen)}
                      className="cursor-pointer flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs sm:text-sm font-bold text-white transition-all shadow-sm"
                      aria-expanded={isSeasonDropdownOpen}
                      aria-haspopup="true"
                    >
                      <div className="size-5 rounded-full bg-white/15 flex items-center justify-center text-[10px] font-black text-white">
                        S{selectedSeason}
                      </div>
                      <span>Season {selectedSeason}</span>
                      <ChevronDown
                        className={cn(
                          "size-3.5 text-muted-foreground transition-transform duration-200",
                          isSeasonDropdownOpen && "rotate-180"
                        )}
                      />
                    </button>

                    {/* Backdrop to close season dropdown when clicking outside */}
                    {isSeasonDropdownOpen && (
                      <div
                        className="fixed inset-0 z-30 bg-black/20"
                        onClick={(e) => {
                          e.stopPropagation()
                          setIsSeasonDropdownOpen(false)
                        }}
                      />
                    )}

                    {isSeasonDropdownOpen && (
                      <div className="absolute left-0 top-full mt-2 z-40 w-48 sm:w-52 rounded-xl bg-[#121620]/95 backdrop-blur-xl border border-white/15 p-1.5 shadow-2xl space-y-1 animate-in fade-in zoom-in-95 duration-200">
                        {seasons.map((season: any) => (
                          <button
                            key={season.id}
                            type="button"
                            onClick={() => {
                              setSelectedSeason(season.season_number)
                              setIsSeasonDropdownOpen(false)
                            }}
                            className={cn(
                              "w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                              selectedSeason === season.season_number
                                ? "bg-purple-600 text-white"
                                : "text-white/80 hover:bg-white/10 hover:text-white"
                            )}
                          >
                            <span>Season {season.season_number}</span>
                            <span className="text-[10px] text-muted-foreground font-mono">
                              {season.episode_count} eps
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Server Selector for Episodes */}
                  <StreamingServerSelector
                    selectedServerId={selectedServerId}
                    onServerChange={setSelectedServerId}
                    variant="compact"
                    align="auto"
                  />
                </div>

                {/* 2. Secondary View Controls Cluster (View Mode Toggles + Scroll Arrows) */}
                <div className="flex items-center gap-1.5 shrink-0 ml-auto sm:ml-0">
                  {/* 3 View Mode Toggles: Cards (Carousel), Grid, List */}
                  <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md shrink-0">
                    <button
                      type="button"
                      onClick={() => setEpisodeViewMode("cards")}
                      className={cn(
                        "cursor-pointer p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5",
                        episodeViewMode === "cards"
                          ? "bg-white text-black shadow-md font-bold"
                          : "text-muted-foreground hover:text-white hover:bg-white/5"
                      )}
                      title="Carousel Cards View"
                      aria-label="Carousel Cards View"
                    >
                      <Columns3 className="size-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setEpisodeViewMode("grid")}
                      className={cn(
                        "cursor-pointer p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5",
                        episodeViewMode === "grid"
                          ? "bg-white text-black shadow-md font-bold"
                          : "text-muted-foreground hover:text-white hover:bg-white/5"
                      )}
                      title="Grid View"
                      aria-label="Grid View"
                    >
                      <LayoutGrid className="size-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setEpisodeViewMode("list")}
                      className={cn(
                        "cursor-pointer p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5",
                        episodeViewMode === "list"
                          ? "bg-white text-black shadow-md font-bold"
                          : "text-muted-foreground hover:text-white hover:bg-white/5"
                      )}
                      title="List View"
                      aria-label="List View"
                    >
                      <List className="size-3.5" />
                    </button>
                  </div>

                  {/* Scroll controls (for carousel mode) */}
                  {episodeViewMode === "cards" && (
                    <div className="hidden sm:flex items-center gap-1 ml-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => scrollEpisodes("left")}
                        className="cursor-pointer size-8 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition active:scale-95"
                        aria-label="Scroll left"
                      >
                        <ChevronLeft className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => scrollEpisodes("right")}
                        className="cursor-pointer size-8 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition active:scale-95"
                        aria-label="Scroll right"
                      >
                        <ChevronRight className="size-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Episodes Content (Loading / Empty / Views) */}
            {isSeasonPending ? (
              <div className="py-16 text-center text-sm text-muted-foreground">
                Loading season {selectedSeason} episodes...
              </div>
            ) : sortedEpisodes.length > 0 ? (
              <>
                {/* 1. CARDS / CAROUSEL VIEW (Default, matches reference screenshot) */}
                {episodeViewMode === "cards" && (
                  <div
                    ref={episodesScrollRef}
                    className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 pt-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent snap-x"
                  >
                    {sortedEpisodes.map((episode: any) => {
                      const epThumbnail = episode.still_path
                        ? `https://image.tmdb.org/t/p/w500${episode.still_path}`
                        : "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=500"
                      const isWatched = watchedEpisodes.includes(episode.id)

                      return (
                        <div
                          key={episode.id}
                          onClick={() => {
                            setPlayerSeason(selectedSeason)
                            setPlayerEpisode(episode.episode_number)
                            setIsPlayerOpen(true)
                          }}
                          className="w-72 sm:w-80 md:w-88 shrink-0 snap-start group cursor-pointer space-y-2.5 select-none"
                        >
                          <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-white/10 bg-black/60 shadow-lg group-hover:border-purple-500/50 transition-all duration-300">
                            <img
                              src={epThumbnail}
                              alt={episode.name}
                              className="size-full object-cover group-hover:scale-105 transition-transform duration-500"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                            {/* Top-left: E{number} badge */}
                            <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md border border-white/15 text-[10px] font-extrabold uppercase text-white shadow tracking-wider">
                              E{episode.episode_number}
                            </div>

                            {/* Top-right: Dotted watch status button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleEpisodeWatched(episode.id)
                              }}
                              className="absolute top-2.5 right-2.5 size-6 rounded-full border border-dashed border-white/40 flex items-center justify-center text-white/70 hover:text-white hover:border-white transition-all bg-black/30 backdrop-blur-sm"
                              title={isWatched ? "Marked as watched" : "Mark as watched"}
                            >
                              <Check
                                className={cn(
                                  "size-3",
                                  isWatched ? "text-emerald-400 stroke-[3]" : "text-white/40"
                                )}
                              />
                            </button>

                            {/* Bottom-right: Duration pill */}
                            <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md border border-white/15 text-[10px] font-bold text-white/90 shadow">
                              {episode.runtime ? `${episode.runtime}m` : "50m"}
                            </div>

                            {/* Center Play Button on hover */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <div className="size-11 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white group-hover:scale-110 group-hover:bg-purple-600 group-hover:border-purple-500 transition-all shadow-xl">
                                <Play className="size-5 fill-white text-white ml-0.5" />
                              </div>
                            </div>
                          </div>

                          {/* Episode Title & Overview below */}
                          <div className="space-y-1 text-left">
                            <h3 className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors truncate">
                              {episode.name}
                            </h3>
                            <p className="text-xs text-muted-foreground/80 line-clamp-2 leading-relaxed">
                              {episode.overview || "No description available for this episode."}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* 2. GRID VIEW */}
                {episodeViewMode === "grid" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 pt-1">
                    {sortedEpisodes.map((episode: any) => {
                      const epThumbnail = episode.still_path
                        ? `https://image.tmdb.org/t/p/w500${episode.still_path}`
                        : "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=500"
                      const isWatched = watchedEpisodes.includes(episode.id)

                      return (
                        <div
                          key={episode.id}
                          onClick={() => {
                            setPlayerSeason(selectedSeason)
                            setPlayerEpisode(episode.episode_number)
                            setIsPlayerOpen(true)
                          }}
                          className="group cursor-pointer space-y-2.5 select-none"
                        >
                          <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-white/10 bg-black/60 shadow-lg group-hover:border-purple-500/50 transition-all duration-300">
                            <img
                              src={epThumbnail}
                              alt={episode.name}
                              className="size-full object-cover group-hover:scale-105 transition-transform duration-500"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                            <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md border border-white/15 text-[10px] font-extrabold uppercase text-white shadow">
                              E{episode.episode_number}
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleEpisodeWatched(episode.id)
                              }}
                              className="absolute top-2.5 right-2.5 size-6 rounded-full border border-dashed border-white/40 flex items-center justify-center text-white/70 hover:text-white transition-all bg-black/30 backdrop-blur-sm"
                            >
                              <Check
                                className={cn(
                                  "size-3",
                                  isWatched ? "text-emerald-400 stroke-[3]" : "text-white/40"
                                )}
                              />
                            </button>

                            <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md border border-white/15 text-[10px] font-bold text-white/90 shadow">
                              {episode.runtime ? `${episode.runtime}m` : "50m"}
                            </div>

                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="size-11 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white group-hover:scale-110 group-hover:bg-purple-600 transition-all shadow-xl">
                                <Play className="size-5 fill-white text-white ml-0.5" />
                              </div>
                            </div>
                          </div>

                          <div className="space-y-1 text-left">
                            <h3 className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors truncate">
                              {episode.name}
                            </h3>
                            <p className="text-xs text-muted-foreground/80 line-clamp-2 leading-relaxed">
                              {episode.overview || "No description available."}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* 3. LIST VIEW */}
                {episodeViewMode === "list" && (
                  <div className="space-y-3 pt-1">
                    {sortedEpisodes.map((episode: any) => {
                      const epThumbnail = episode.still_path
                        ? `https://image.tmdb.org/t/p/w300${episode.still_path}`
                        : "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=300"

                      return (
                        <div
                          key={episode.id}
                          onClick={() => {
                            setPlayerSeason(selectedSeason)
                            setPlayerEpisode(episode.episode_number)
                            setIsPlayerOpen(true)
                          }}
                          className="group flex flex-col sm:flex-row gap-4 items-start p-3 sm:p-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all cursor-pointer w-full select-none"
                        >
                          <div className="relative aspect-video w-full sm:w-48 md:w-56 shrink-0 rounded-xl overflow-hidden shadow-md border border-white/10 bg-black/60">
                            <img
                              src={epThumbnail}
                              alt={episode.name}
                              className="size-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <div className="size-10 rounded-full bg-white text-black flex items-center justify-center shadow-lg">
                                <Play className="size-4 fill-black text-black ml-0.5" />
                              </div>
                            </div>
                            <div className="absolute bottom-2 left-2 bg-black/85 text-white border border-white/10 text-xs font-black px-2 py-0.5 rounded shadow">
                              E{episode.episode_number}
                            </div>
                          </div>

                          <div className="flex-grow space-y-1 text-left">
                            <div className="flex items-center justify-between gap-2">
                              <h3 className="text-base font-bold text-white group-hover:text-purple-400 transition-colors">
                                {episode.name}
                              </h3>
                              <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
                                <Clock className="size-3.5" />
                                {episode.runtime ? `${episode.runtime}m` : "50m"}
                              </span>
                            </div>
                            <p className="text-xs sm:text-sm text-gray-300/80 font-normal leading-relaxed line-clamp-2">
                              {episode.overview || "No description available for this episode."}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-8 text-center text-sm text-muted-foreground">
                No episodes found for season {selectedSeason}.
              </div>
            )}
          </section>
        )}

        {/* =======================================================================
            3. CAST & CREW SECTION (Screenshot Reference)
        ======================================================================= */}
        <section className="rounded-3xl border border-white/10 bg-[#0c1017]/80 backdrop-blur-xl p-6 sm:p-8 shadow-2xl space-y-6 text-left">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[11px] font-bold tracking-widest text-muted-foreground uppercase">
                <div className="w-1 h-3.5 bg-purple-500 rounded-full" />
                <span>FEATURING</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Cast & crew
              </h2>
            </div>

            <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-muted-foreground uppercase tracking-wider">
              {cast.length} CREDITED
            </div>
          </div>

          {/* Split Columns: Starring (left) & Creative Team (right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pt-2">
            {/* Left Column: Starring (7 cols) */}
            <div className="lg:col-span-7 space-y-5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <User className="size-3.5 text-purple-400" />
                <span>Starring</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {cast.slice(0, 8).map((actor: any) => (
                  <Link
                    key={actor.id || actor.cast_id}
                    to={`/person/${actor.id}`}
                    className="flex items-center gap-3.5 group cursor-pointer"
                  >
                    <img
                      src={
                        actor.profile_path
                          ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
                          : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150"
                      }
                      alt={actor.name}
                      className="size-12 rounded-full object-cover border border-white/15 bg-muted/40 shrink-0 shadow-md group-hover:scale-105 group-hover:border-purple-500/50 transition-all"
                      loading="lazy"
                    />
                    <div className="space-y-0.5 min-w-0">
                      <p className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors truncate">
                        {actor.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {actor.character || "Cast"}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Right Column: Creative Team (5 cols) */}
            <div className="lg:col-span-5 border-t lg:border-t-0 lg:border-l border-white/10 pt-6 lg:pt-0 lg:pl-8 space-y-6">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <Clapperboard className="size-3.5 text-purple-400" />
                <span>Creative team</span>
              </div>

              {/* CREATED BY */}
              {creator && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                    CREATED BY
                  </span>
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        creator.profile_path
                          ? `https://image.tmdb.org/t/p/w185${creator.profile_path}`
                          : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150"
                      }
                      alt={creator.name}
                      className="size-10 rounded-full object-cover border border-white/15 bg-muted/40 shrink-0 shadow-md"
                      loading="lazy"
                    />
                    <span className="text-sm font-bold text-white">
                      {creator.name}
                    </span>
                  </div>
                </div>
              )}

              {/* SHOWRUNNER */}
              {showrunners.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                    SHOWRUNNER
                  </span>
                  <div className="flex flex-wrap items-center gap-4">
                    {showrunners.map((sr: any) => (
                      <div key={sr.id || sr.credit_id} className="flex items-center gap-2.5">
                        {sr.profile_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w185${sr.profile_path}`}
                            alt={sr.name}
                            className="size-7 rounded-full object-cover border border-white/15 shadow"
                          />
                        ) : (
                          <div className="size-7 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-white/70">
                            <User className="size-3.5" />
                          </div>
                        )}
                        <span className="text-xs font-bold text-white">
                          {sr.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PRODUCED BY */}
              {producers.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                    PRODUCED BY
                  </span>
                  <div className="flex flex-wrap items-center gap-4">
                    {producers.map((prod: any) => (
                      <div key={prod.id || prod.credit_id} className="flex items-center gap-2.5">
                        {prod.profile_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w185${prod.profile_path}`}
                            alt={prod.name}
                            className="size-7 rounded-full object-cover border border-white/15 shadow"
                          />
                        ) : (
                          <div className="size-7 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-white/70">
                            <User className="size-3.5" />
                          </div>
                        )}
                        <span className="text-xs font-bold text-white">
                          {prod.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 4. Similars Section */}
        <div ref={similarsSectionRef} className="space-y-4 sm:space-y-6">
          <div className="flex items-center gap-2.5 border-b border-border/40 pb-2">
            <div className="w-1 h-5 bg-purple-500 rounded-full" />
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
              Similars
            </h2>
          </div>

          {recommendedShows.length > 0 ? (
            <div className="grid grid-cols-2 justify-items-center sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
              {recommendedShows.map((show: any) => (
                <CardContentList
                  key={show.id}
                  id={show.id}
                  title={show.name}
                  image={
                    show.poster_path
                      ? `https://image.tmdb.org/t/p/w342${show.poster_path}`
                      : "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=500"
                  }
                  rating={
                    show.vote_average
                      ? parseFloat(show.vote_average.toFixed(1))
                      : 0.0
                  }
                  year={
                    show.first_air_date
                      ? parseInt(show.first_air_date.split("-")[0], 10)
                      : 0
                  }
                  type="TV Show"
                  className="w-full"
                />
              ))}
            </div>
          ) : (
            <div className="flex h-[180px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/10">
              <span className="font-medium text-muted-foreground">
                No similar TV shows found.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 5. Trailer Modal Overlay */}
      {isTrailerOpen && trailerVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-300"
          onClick={() => setIsTrailerOpen(false)}
        >
          <div
            className="relative w-full max-w-4xl aspect-video rounded-2xl bg-black overflow-hidden border border-white/10 shadow-2xl scale-in duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Trigger Button */}
            <button
              onClick={() => setIsTrailerOpen(false)}
              className="absolute top-4 right-4 z-50 cursor-pointer flex size-10 items-center justify-center rounded-full bg-black/60 text-white border border-white/10 hover:bg-black/90 hover:scale-105 transition-all active:scale-95"
              aria-label="Close trailer"
            >
              <X className="size-5" />
            </button>

            {/* Video Frame */}
            <iframe
              src={`https://www.youtube.com/embed/${trailerVideo.key}?autoplay=1`}
              title={`${show.name} Official Trailer`}
              className="size-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}
      {/* 6. TV Show Player Modal Overlay */}
      <VideoPlayerModal
        isOpen={isPlayerOpen}
        onClose={() => setIsPlayerOpen(false)}
        title={`${show.name} S${playerSeason} E${playerEpisode} Player`}
        mediaType="tv"
        tmdbId={show.id}
        imdbId={externalIds?.imdb_id}
        season={playerSeason}
        episode={playerEpisode}
        totalEpisodes={seasonData?.episodes?.length}
        onEpisodeChange={(newSeason, newEpisode) => {
          setPlayerSeason(newSeason)
          setPlayerEpisode(newEpisode)
        }}
        selectedServerId={selectedServerId}
        onServerChange={setSelectedServerId}
      />
    </div>
  )
}
