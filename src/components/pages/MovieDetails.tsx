import { useState, useEffect, useRef } from "react"
import { useParams, useSearchParams, Link } from "react-router"
import { useQuery } from "@tanstack/react-query"
import {
  Play,
  X,
  Star,
  Clapperboard,
  Download,
  ChevronLeft,
  ChevronRight,
  Film,
  User,
  Maximize2,
} from "lucide-react"
import {
  movieDetailsQuery,
  movieCreditsQuery,
  movieVideosQuery,
  movieRecommendationsQuery,
  movieSimilarQuery,
  movieReleaseDatesQuery,
  movieImagesQuery,
} from "@/api/fetch-movie"
import CardContentList from "../card-content-list"
import VideoPlayerModal from "../video-player-modal"
import StreamingServerSelector from "../streaming-server-selector"
import { getStoredServerId } from "@/lib/streaming-servers"
import { cn } from "@/lib/utils"
import { useServerHealth } from "@/context/server-health-context"

export default function MovieDetails() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const numericId = id ? parseInt(id, 10) : NaN
  const autoplay = searchParams.get("autoplay") === "true"

  // State
  const [isTrailerOpen, setIsTrailerOpen] = useState(false)
  const [activeTrailerKey, setActiveTrailerKey] = useState<string | null>(null)
  const [isPlayerOpen, setIsPlayerOpen] = useState(false)
  const [selectedServerId, setSelectedServerId] = useState<string>(getStoredServerId)
  const { bestServerId, healthMap, runHealthCheck } = useServerHealth()

  // Sync selected server to the benchmark winner if identified
  useEffect(() => {
    if (bestServerId) {
      setSelectedServerId(bestServerId)
    }
  }, [bestServerId])

  // If user entered directly without preflight benchmark, run a silent probe
  useEffect(() => {
    if (Object.keys(healthMap).length === 0 && !isNaN(numericId)) {
      runHealthCheck()
    }
  }, [healthMap, runHealthCheck])
  const [isOverviewExpanded, setIsOverviewExpanded] = useState(false)

  // Media section tabs state (sequence: most popular, videos, backdrops, posters)
  type MediaTab = "popular" | "videos" | "backdrops" | "posters"
  const [activeMediaTab, setActiveMediaTab] = useState<MediaTab>("popular")
  const [selectedImage, setSelectedImage] = useState<{
    url: string
    title: string
    resolution?: string
    type: "Backdrop" | "Poster"
  } | null>(null)

  // Scroll references for carousels
  const trailersScrollRef = useRef<HTMLDivElement>(null)
  const similarsScrollRef = useRef<HTMLDivElement>(null)
  const recommendationsScrollRef = useRef<HTMLDivElement>(null)

  // TMDB Queries
  const { data: movie, isPending: isMoviePending, error: movieError } = useQuery({
    ...movieDetailsQuery(numericId),
    enabled: !isNaN(numericId),
  })

  const { data: credits } = useQuery({
    ...movieCreditsQuery(numericId),
    enabled: !isNaN(numericId),
  })

  const { data: videos } = useQuery({
    ...movieVideosQuery(numericId),
    enabled: !isNaN(numericId),
  })

  const { data: similars } = useQuery({
    ...movieSimilarQuery(numericId),
    enabled: !isNaN(numericId),
  })

  const { data: recommendations } = useQuery({
    ...movieRecommendationsQuery(numericId),
    enabled: !isNaN(numericId),
  })

  const { data: releaseDates } = useQuery({
    ...movieReleaseDatesQuery(numericId),
    enabled: !isNaN(numericId),
  })

  const { data: images } = useQuery({
    ...movieImagesQuery(numericId),
    enabled: !isNaN(numericId),
  })

  // Find default official trailer
  const youtubeVideos =
    videos?.results?.filter((vid: any) => vid.site === "YouTube") || []

  const trailerVideo =
    youtubeVideos.find(
      (vid: any) => vid.type === "Trailer" && vid.official
    ) ||
    youtubeVideos.find((vid: any) => vid.type === "Trailer") ||
    youtubeVideos[0]

  // All trailers and teasers
  const allTrailers = youtubeVideos.filter((vid: any) =>
    ["Trailer", "Teaser", "Clip", "Featurette"].includes(vid.type)
  )
  const displayTrailers = allTrailers.length > 0 ? allTrailers : youtubeVideos

  // Autoplay trailer handler
  useEffect(() => {
    if (autoplay && trailerVideo) {
      setActiveTrailerKey(trailerVideo.key)
      setIsTrailerOpen(true)
    }
  }, [autoplay, trailerVideo])

  // Scroll to top on id change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
    setIsOverviewExpanded(false)
  }, [id])

  // Horizontal scroll helper
  const scrollContainer = (
    ref: React.RefObject<HTMLDivElement | null>,
    direction: "left" | "right"
  ) => {
    if (ref.current) {
      const scrollAmount = 600
      ref.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
    }
  }

  // Fallbacks & Loading states
  if (isNaN(numericId)) {
    return (
      <div className="flex h-screen flex-col items-center justify-center pt-24 text-center">
        <h2 className="text-2xl font-bold text-destructive">Invalid Movie ID</h2>
        <Link to="/" className="mt-4 text-primary hover:underline">
          Back to Home
        </Link>
      </div>
    )
  }

  if (isMoviePending) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12 pt-28 pb-16">
        <div className="space-y-6">
          <div className="h-[480px] w-full animate-pulse rounded-3xl bg-muted/20" />
          <div className="h-64 w-full animate-pulse rounded-2xl bg-muted/20" />
        </div>
      </div>
    )
  }

  if (movieError || !movie) {
    return (
      <div className="flex h-screen flex-col items-center justify-center pt-24 text-center">
        <h2 className="text-2xl font-bold text-destructive">Movie Not Found</h2>
        <Link to="/" className="mt-4 text-primary hover:underline">
          Back to Home
        </Link>
      </div>
    )
  }

  // Formatters
  const releaseYear = movie.release_date ? movie.release_date.split("-")[0] : "N/A"
  const formattedReleaseDate = movie.release_date
    ? new Date(movie.release_date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
    : "N/A"

  const formatRuntime = (minutes: number) => {
    if (!minutes) return "N/A"
    const hrs = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`
  }

  // US Certification (e.g. PG-13, R, PG)
  const usRelease = releaseDates?.results?.find((r: any) => r.iso_3166_1 === "US")
  const certification =
    usRelease?.release_dates?.find((d: any) => d.certification)?.certification || "PG-13"

  // Credits parsing
  const cast = credits?.cast || []
  const crew = credits?.crew || []
  const director = crew.find((c: any) => c.job === "Director")
  const writers = crew
    .filter((c: any) => ["Screenplay", "Writer", "Story"].includes(c.job))
    .slice(0, 2)
  const producers = crew
    .filter((c: any) => ["Producer", "Executive Producer"].includes(c.job))
    .slice(0, 3)

  // Backdrop and Poster URLs
  const backdropUrl = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
    : "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1600"

  // Similar and Recommended list
  const similarMovies = (similars?.results || []).slice(0, 16)
  const recommendedMovies = (recommendations?.results || []).slice(0, 16)

  // Rating percentage
  const ratingPercent = Math.round((movie.vote_average || 0) * 10)
  const starCount = Math.min(5, Math.max(0, Math.round((movie.vote_average || 0) / 2)))

  const openTrailerModal = (key: string) => {
    setActiveTrailerKey(key)
    setIsTrailerOpen(true)
  }

  return (
    <div className="w-full min-h-screen bg-[#090b10] text-foreground pb-24 selection:bg-purple-500/30">
      {/* 1. HERO SECTION (CinemaOS Hero Layout matching HomePage) */}
      <section className="relative w-full min-h-[75vh] sm:min-h-[82vh] lg:min-h-[88vh] max-h-[960px] bg-black overflow-hidden select-none flex flex-col justify-end">
        {/* Cinematic Backdrop Image - Crystal clear on mobile and desktop */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <img
            src={backdropUrl}
            alt={movie.title}
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
          <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-8 md:gap-12 w-full">
          {/* Left Column: Metadata, Title, Ratings, Actions */}
          <div className="flex-1 space-y-4 md:space-y-5 max-w-3xl text-left">
            {/* Top Badges Row */}
            <div className="flex flex-wrap items-center gap-2.5 text-xs font-bold tracking-wider uppercase text-muted-foreground">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-white/10 border border-white/15 text-[11px] font-bold text-white tracking-widest uppercase shadow-sm">
                <Film className="size-3 text-purple-400" />
                Streaming-UI
              </span>
              <span>•</span>
              <span className="text-white/80">MOVIE</span>
              <span>•</span>
              <span>{releaseYear}</span>
              <span>•</span>
              <span>{formatRuntime(movie.runtime)}</span>
              <span>•</span>
              <span className="px-1.5 py-0.5 rounded border border-white/20 text-[10px] text-white/90 bg-white/5">
                {certification}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black uppercase tracking-tight text-white leading-[0.95] drop-shadow-2xl">
              {movie.title}
            </h1>

            {/* Tagline */}
            {movie.tagline && (
              <p className="text-sm sm:text-base md:text-lg italic text-muted-foreground/90 font-medium">
                "{movie.tagline}"
              </p>
            )}

            {/* Ratings & Genres Row */}
            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs md:text-sm font-semibold">
              {/* Star Rating Icons */}
              <div className="flex items-center gap-1">
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
                ({movie.vote_count?.toLocaleString() || 0})
              </span>

              {/* IMDb Badge */}
              <span className="bg-[#f5c518] text-black font-extrabold text-[11px] px-1.5 py-0.5 rounded shadow-sm tracking-tight">
                IMDb
              </span>

              {/* Genres Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                {movie.genres?.slice(0, 3).map((genre: any) => (
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
            {movie.overview && (
              <div className="space-y-1">
                <p
                  className={cn(
                    "text-xs sm:text-sm md:text-base text-gray-300 font-normal leading-relaxed drop-shadow transition-all",
                    !isOverviewExpanded && "line-clamp-3"
                  )}
                >
                  {movie.overview}
                </p>
                {movie.overview.length > 180 && (
                  <button
                    onClick={() => setIsOverviewExpanded(!isOverviewExpanded)}
                    className="cursor-pointer text-xs font-bold text-purple-400 hover:text-purple-300 underline underline-offset-4 transition-colors"
                  >
                    {isOverviewExpanded ? "Read Less" : "Read More"}
                  </button>
                )}
              </div>
            )}

            {/* Director Mention */}
            {director && (
              <div className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wider font-semibold">
                DIRECTED BY{" "}
                <span className="text-white font-bold ml-1">{director.name}</span>
              </div>
            )}

            {/* Action Buttons Row */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {/* Play Button */}
              <button
                onClick={() => setIsPlayerOpen(true)}
                className="cursor-pointer flex items-center justify-center gap-2.5 rounded-full bg-white hover:bg-white/90 text-black font-bold px-7 py-3 text-sm shadow-xl hover:scale-105 active:scale-95 transition-all"
              >
                <Play className="size-4 fill-black text-black" />
                <span>Play</span>
              </button>

              {/* Trailer Button */}
              {trailerVideo && (
                <button
                  onClick={() => openTrailerModal(trailerVideo.key)}
                  className="cursor-pointer flex items-center justify-center gap-2.5 rounded-full border border-white/20 bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 text-sm backdrop-blur-md hover:scale-105 active:scale-95 transition-all"
                >
                  <Film className="size-4 text-white" />
                  <span>Trailer</span>
                </button>
              )}

              {/* Compact Server Selector Dropdown */}
              <StreamingServerSelector
                selectedServerId={selectedServerId}
                onServerChange={setSelectedServerId}
                variant="compact"
                align="auto"
              />
            </div>


          </div>

          {/* Right Column: Hero Preview Card (Desktop) */}
          <div className="hidden lg:block w-80 xl:w-96 shrink-0">
            <div className="rounded-2xl bg-[#12161f]/70 backdrop-blur-xl border border-white/10 p-4 shadow-2xl space-y-4">
              {/* Preview Video Poster */}
              <div
                onClick={() => trailerVideo && openTrailerModal(trailerVideo.key)}
                className="relative aspect-video w-full rounded-xl overflow-hidden group cursor-pointer border border-white/10 bg-black/60 shadow-lg"
              >
                <img
                  src={
                    trailerVideo
                      ? `https://img.youtube.com/vi/${trailerVideo.key}/hqdefault.jpg`
                      : backdropUrl
                  }
                  alt={trailerVideo?.name || movie.title}
                  className="size-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Purple Watermark badge */}
                <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded bg-purple-600 text-[10px] font-black uppercase text-white tracking-widest shadow-md">
                  OFFICIAL TRAILER
                </div>

                {/* Central Play Button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="size-11 rounded-full bg-white/25 backdrop-blur-md border border-white/40 flex items-center justify-center text-white group-hover:scale-110 group-hover:bg-purple-600 group-hover:border-purple-500 transition-all shadow-xl">
                    <Play className="size-5 fill-white text-white ml-0.5" />
                  </div>
                </div>

                {/* Bottom title & count */}
                <div className="absolute bottom-2.5 inset-x-3 text-left">
                  <p className="text-xs font-bold text-white truncate drop-shadow">
                    {trailerVideo?.name || "Official Trailer"}
                  </p>
                  <p className="text-[10px] text-white/70">
                    +{Math.max(0, displayTrailers.length - 1)} more videos
                  </p>
                </div>
              </div>

              {/* Watch Trailer Link */}
              <button
                onClick={() => trailerVideo && openTrailerModal(trailerVideo.key)}
                className="cursor-pointer w-full flex items-center justify-between text-xs font-semibold text-white/80 hover:text-white transition-colors pt-0.5"
              >
                <span>Watch trailer</span>
                <span className="text-sm">→</span>
              </button>

              <div className="border-t border-white/10" />

              {/* Starring preview */}
              <div className="space-y-2 text-left">
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
                        className="size-8 rounded-full border-2 border-[#12161f] object-cover bg-muted/40"
                      />
                    ))}
                  </div>
                  <p className="text-xs text-white/80 font-medium truncate">
                    {cast
                      .slice(0, 3)
                      .map((c: any) => c.name)
                      .join(", ")}
                  </p>
                </div>
              </div>
            </div>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Status / Studio Metadata Bar below Hero */}
      <div className="relative z-20 max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-12 -mt-4 sm:-mt-6 mb-8">
        <div className="rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10 px-6 py-4 flex flex-wrap items-center justify-between gap-6 shadow-xl">
            {/* Left metadata points */}
            <div className="flex flex-wrap items-center gap-6 sm:gap-10 text-left">
              <div className="space-y-0.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  STATUS
                </div>
                <div className="text-xs sm:text-sm font-bold text-white">
                  {movie.status || "Released"}
                </div>
              </div>

              <div className="space-y-0.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  RUNTIME
                </div>
                <div className="text-xs sm:text-sm font-bold text-white">
                  {formatRuntime(movie.runtime)}
                </div>
              </div>

              <div className="space-y-0.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  LANGUAGE
                </div>
                <div className="text-xs sm:text-sm font-bold text-white">
                  {movie.original_language?.toUpperCase() || "EN"}
                </div>
              </div>

              <div className="space-y-0.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  RELEASED
                </div>
                <div className="text-xs sm:text-sm font-bold text-white">
                  {formattedReleaseDate}
                </div>
              </div>
            </div>

            {/* Right Studios / Production Companies */}
            {movie.production_companies && movie.production_companies.length > 0 && (
              <div className="flex items-center gap-4 text-right">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  STUDIOS
                </span>
                <div className="flex items-center gap-4">
                  {movie.production_companies.slice(0, 3).map((comp: any) => (
                    <div key={comp.id} className="flex items-center">
                      {comp.logo_path ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w200${comp.logo_path}`}
                          alt={comp.name}
                          className="h-5 sm:h-6 object-contain filter invert opacity-80 hover:opacity-100 transition-opacity"
                          title={comp.name}
                        />
                      ) : (
                        <span className="text-xs font-black tracking-widest uppercase text-white/70 hover:text-white transition-colors">
                          {comp.name}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

      {/* Main Content Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 mt-12 sm:mt-16 space-y-16 sm:space-y-20">
        {/* =======================================================================
            2. TEASER AND TRAILERS SECTION WITH 4 TABS:
               - most popular
               - videos
               - backdrops
               - posters
        ======================================================================= */}
        <section className="space-y-5 text-left">
          {/* Header & Tabs */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/5 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[11px] font-bold tracking-widest text-muted-foreground uppercase">
                <div className="w-1 h-3.5 bg-purple-500 rounded-full" />
                <span>WATCH THE</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Trailers & teasers
              </h2>
            </div>

            {/* The 4 Tabs in exact requested sequence: most popular, videos, backdrops, posters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md shrink-0">
                {/* 1. Most popular */}
                <button
                  onClick={() => setActiveMediaTab("popular")}
                  className={cn(
                    "cursor-pointer px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5",
                    activeMediaTab === "popular"
                      ? "bg-white text-black shadow-md font-bold"
                      : "text-muted-foreground hover:text-white hover:bg-white/5"
                  )}
                >
                  <span>Most popular</span>
                </button>

                {/* 2. Videos */}
                <button
                  onClick={() => setActiveMediaTab("videos")}
                  className={cn(
                    "cursor-pointer px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5",
                    activeMediaTab === "videos"
                      ? "bg-white text-black shadow-md font-bold"
                      : "text-muted-foreground hover:text-white hover:bg-white/5"
                  )}
                >
                  <span>Videos</span>
                  {youtubeVideos.length > 0 && (
                    <span
                      className={cn(
                        "text-[10px] px-1.5 py-0.2 rounded-full font-bold",
                        activeMediaTab === "videos"
                          ? "bg-black/15 text-black"
                          : "bg-white/10 text-muted-foreground"
                      )}
                    >
                      {youtubeVideos.length}
                    </span>
                  )}
                </button>

                {/* 3. Backdrops */}
                <button
                  onClick={() => setActiveMediaTab("backdrops")}
                  className={cn(
                    "cursor-pointer px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5",
                    activeMediaTab === "backdrops"
                      ? "bg-white text-black shadow-md font-bold"
                      : "text-muted-foreground hover:text-white hover:bg-white/5"
                  )}
                >
                  <span>Backdrops</span>
                  {images?.backdrops && images.backdrops.length > 0 && (
                    <span
                      className={cn(
                        "text-[10px] px-1.5 py-0.2 rounded-full font-bold",
                        activeMediaTab === "backdrops"
                          ? "bg-black/15 text-black"
                          : "bg-white/10 text-muted-foreground"
                      )}
                    >
                      {images.backdrops.length}
                    </span>
                  )}
                </button>

                {/* 4. Posters */}
                <button
                  onClick={() => setActiveMediaTab("posters")}
                  className={cn(
                    "cursor-pointer px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5",
                    activeMediaTab === "posters"
                      ? "bg-white text-black shadow-md font-bold"
                      : "text-muted-foreground hover:text-white hover:bg-white/5"
                  )}
                >
                  <span>Posters</span>
                  {images?.posters && images.posters.length > 0 && (
                    <span
                      className={cn(
                        "text-[10px] px-1.5 py-0.2 rounded-full font-bold",
                        activeMediaTab === "posters"
                          ? "bg-black/15 text-black"
                          : "bg-white/10 text-muted-foreground"
                      )}
                    >
                      {images.posters.length}
                    </span>
                  )}
                </button>
              </div>

              {/* Scroll controls */}
              <div className="hidden sm:flex items-center gap-1 ml-1 shrink-0">
                <button
                  onClick={() => scrollContainer(trailersScrollRef, "left")}
                  className="cursor-pointer size-8 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition active:scale-95"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <button
                  onClick={() => scrollContainer(trailersScrollRef, "right")}
                  className="cursor-pointer size-8 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition active:scale-95"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          </div>

          {/* TAB 1: Most Popular (Highlight Trailers + Top Backdrops + Top Posters) */}
          {activeMediaTab === "popular" && (
            <div
              ref={trailersScrollRef}
              className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent snap-x"
            >
              {/* Highlight Videos */}
              {displayTrailers.slice(0, 3).map((vid: any) => (
                <div
                  key={`pop-vid-${vid.id || vid.key}`}
                  onClick={() => openTrailerModal(vid.key)}
                  className="w-72 sm:w-80 md:w-96 shrink-0 snap-start group cursor-pointer space-y-2 select-none"
                >
                  <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-white/10 bg-black/60 shadow-lg group-hover:border-purple-500/50 transition-all duration-300">
                    <img
                      src={`https://img.youtube.com/vi/${vid.key}/hqdefault.jpg`}
                      alt={vid.name}
                      className="size-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded bg-purple-600 text-[10px] font-black uppercase text-white tracking-widest shadow-md">
                      {vid.type === "Teaser" ? "OFFICIAL TEASER" : "OFFICIAL TRAILER"}
                    </div>

                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="size-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white group-hover:scale-115 group-hover:bg-purple-600 group-hover:border-purple-500 transition-all duration-300 shadow-2xl">
                        <Play className="size-5 fill-white text-white ml-0.5" />
                      </div>
                    </div>
                  </div>

                  <p className="text-sm font-semibold text-white/90 group-hover:text-purple-400 transition-colors truncate">
                    {vid.name}
                  </p>
                </div>
              ))}

              {/* Highlight Backdrops */}
              {images?.backdrops?.slice(0, 3).map((img: any) => (
                <div
                  key={`pop-bd-${img.file_path}`}
                  onClick={() =>
                    setSelectedImage({
                      url: `https://image.tmdb.org/t/p/original${img.file_path}`,
                      title: movie.title,
                      resolution: `${img.width} × ${img.height}`,
                      type: "Backdrop",
                    })
                  }
                  className="w-72 sm:w-80 md:w-96 shrink-0 snap-start group cursor-pointer space-y-2 select-none"
                >
                  <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-white/10 bg-black/60 shadow-lg group-hover:border-purple-500/50 transition-all duration-300">
                    <img
                      src={`https://image.tmdb.org/t/p/w780${img.file_path}`}
                      alt="Movie Backdrop"
                      className="size-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] font-bold uppercase text-white/90 tracking-wider border border-white/15">
                      BACKDROP
                    </div>

                    <div className="absolute bottom-3 right-3 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] text-white/80 font-mono border border-white/10">
                      {img.width}×{img.height}
                    </div>

                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="size-11 rounded-full bg-black/60 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-xl scale-90 group-hover:scale-100 transition-transform">
                        <Maximize2 className="size-4" />
                      </div>
                    </div>
                  </div>

                  <p className="text-sm font-semibold text-white/80 group-hover:text-purple-400 transition-colors">
                    Backdrop • {img.width}×{img.height}
                  </p>
                </div>
              ))}

              {/* Highlight Poster */}
              {images?.posters?.slice(0, 2).map((img: any) => (
                <div
                  key={`pop-post-${img.file_path}`}
                  onClick={() =>
                    setSelectedImage({
                      url: `https://image.tmdb.org/t/p/original${img.file_path}`,
                      title: movie.title,
                      resolution: `${img.width} × ${img.height}`,
                      type: "Poster",
                    })
                  }
                  className="w-36 sm:w-44 md:w-52 shrink-0 snap-start group cursor-pointer space-y-2 select-none"
                >
                  <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden border border-white/10 bg-muted/20 shadow-lg group-hover:border-purple-500/50 transition-all duration-300">
                    <img
                      src={`https://image.tmdb.org/t/p/w500${img.file_path}`}
                      alt="Movie Poster"
                      className="size-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />

                    <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] font-bold uppercase text-white/90 tracking-wider border border-white/15">
                      POSTER
                    </div>

                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="size-10 rounded-full bg-white text-black flex items-center justify-center shadow-xl scale-90 group-hover:scale-100 transition-transform">
                        <Maximize2 className="size-4" />
                      </div>
                    </div>
                  </div>

                  <p className="text-sm font-semibold text-white/80 group-hover:text-purple-400 transition-colors truncate">
                    Official Poster
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: Videos (Trailers, Teasers, Featurettes, Clips) */}
          {activeMediaTab === "videos" && (
            <div>
              {displayTrailers.length > 0 ? (
                <div
                  ref={trailersScrollRef}
                  className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent snap-x"
                >
                  {displayTrailers.map((vid: any) => (
                    <div
                      key={vid.id || vid.key}
                      onClick={() => openTrailerModal(vid.key)}
                      className="w-72 sm:w-80 md:w-96 shrink-0 snap-start group cursor-pointer space-y-2 select-none"
                    >
                      <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-white/10 bg-black/60 shadow-lg group-hover:border-purple-500/50 transition-all duration-300">
                        <img
                          src={`https://img.youtube.com/vi/${vid.key}/hqdefault.jpg`}
                          alt={vid.name}
                          className="size-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                        <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded bg-purple-600 text-[10px] font-black uppercase text-white tracking-widest shadow-md">
                          {vid.type?.toUpperCase() || "VIDEO"}
                        </div>

                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="size-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white group-hover:scale-115 group-hover:bg-purple-600 group-hover:border-purple-500 transition-all duration-300 shadow-2xl">
                            <Play className="size-5 fill-white text-white ml-0.5" />
                          </div>
                        </div>
                      </div>

                      <p className="text-sm font-semibold text-white/90 group-hover:text-purple-400 transition-colors truncate">
                        {vid.name}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-8 text-center text-sm text-muted-foreground">
                  No videos currently available for this movie.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Backdrops */}
          {activeMediaTab === "backdrops" && (
            <div>
              {images?.backdrops && images.backdrops.length > 0 ? (
                <div
                  ref={trailersScrollRef}
                  className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent snap-x"
                >
                  {images.backdrops.map((img: any, idx: number) => (
                    <div
                      key={`bd-${img.file_path}-${idx}`}
                      onClick={() =>
                        setSelectedImage({
                          url: `https://image.tmdb.org/t/p/original${img.file_path}`,
                          title: movie.title,
                          resolution: `${img.width} × ${img.height}`,
                          type: "Backdrop",
                        })
                      }
                      className="w-72 sm:w-80 md:w-96 shrink-0 snap-start group cursor-pointer space-y-2 select-none"
                    >
                      <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-white/10 bg-black/60 shadow-lg group-hover:border-purple-500/50 transition-all duration-300">
                        <img
                          src={`https://image.tmdb.org/t/p/w780${img.file_path}`}
                          alt="Backdrop"
                          className="size-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="absolute bottom-3 right-3 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] text-white/90 font-mono border border-white/15">
                          {img.width}×{img.height}
                        </div>

                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="size-11 rounded-full bg-black/70 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-xl scale-90 group-hover:scale-100 transition-transform">
                            <Maximize2 className="size-4" />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground px-0.5">
                        <span className="font-medium text-white/80">Backdrop #{idx + 1}</span>
                        <span>{img.width} × {img.height}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-8 text-center text-sm text-muted-foreground">
                  No backdrops currently available for this movie.
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Posters */}
          {activeMediaTab === "posters" && (
            <div>
              {images?.posters && images.posters.length > 0 ? (
                <div
                  ref={trailersScrollRef}
                  className="flex gap-4 sm:gap-5 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent snap-x"
                >
                  {images.posters.map((img: any, idx: number) => (
                    <div
                      key={`post-${img.file_path}-${idx}`}
                      onClick={() =>
                        setSelectedImage({
                          url: `https://image.tmdb.org/t/p/original${img.file_path}`,
                          title: movie.title,
                          resolution: `${img.width} × ${img.height}`,
                          type: "Poster",
                        })
                      }
                      className="w-36 sm:w-44 md:w-52 shrink-0 snap-start group cursor-pointer space-y-2 select-none"
                    >
                      <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden border border-white/10 bg-muted/20 shadow-lg group-hover:border-purple-500/50 transition-all duration-300">
                        <img
                          src={`https://image.tmdb.org/t/p/w500${img.file_path}`}
                          alt="Poster"
                          className="size-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />

                        <div className="absolute bottom-2.5 right-2.5 px-1.5 py-0.5 rounded bg-black/75 backdrop-blur-md text-[10px] text-white/90 font-mono border border-white/15">
                          {img.width}×{img.height}
                        </div>

                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="size-11 rounded-full bg-white text-black flex items-center justify-center shadow-2xl scale-90 group-hover:scale-100 transition-transform">
                            <Maximize2 className="size-4" />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground px-0.5">
                        <span className="font-medium text-white/80">Poster #{idx + 1}</span>
                        <span>{img.width}×{img.height}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-8 text-center text-sm text-muted-foreground">
                  No posters currently available for this movie.
                </div>
              )}
            </div>
          )}
        </section>

        {/* =======================================================================
            3. CAST AND CREW SECTION (Screenshot 1 Bottom Reference)
        ======================================================================= */}
        <section className="text-left">
          <div className="rounded-3xl bg-[#12161f]/80 backdrop-blur-xl border border-white/10 p-6 sm:p-8 md:p-10 shadow-2xl space-y-6">
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
              {/* Left Column: Starring (approx 7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <User className="size-3.5 text-purple-400" />
                  <span>Starring</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  {cast.slice(0, 10).map((actor: any) => (
                    <Link
                      key={actor.id || actor.cast_id}
                      to={`/person/${actor.id}`}
                      className="flex items-center gap-3 group cursor-pointer"
                    >
                      <img
                        src={
                          actor.profile_path
                            ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
                            : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150"
                        }
                        alt={actor.name}
                        className="size-12 rounded-full object-cover border border-white/10 bg-muted/40 shrink-0 shadow-md group-hover:scale-105 group-hover:border-purple-500/50 transition-all"
                        loading="lazy"
                      />
                      <div className="space-y-0.5 min-w-0">
                        <p className="text-sm font-semibold text-white group-hover:text-purple-400 transition-colors truncate">
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

              {/* Right Column: Creative Team (approx 5 cols) */}
              <div className="lg:col-span-5 border-t lg:border-t-0 lg:border-l border-white/10 pt-6 lg:pt-0 lg:pl-8 space-y-6">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <Clapperboard className="size-3.5 text-purple-400" />
                  <span>Creative team</span>
                </div>

                {/* Directed By */}
                {director && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      DIRECTED BY
                    </span>
                    <Link
                      to={`/person/${director.id}`}
                      className="flex items-center gap-3 group cursor-pointer"
                    >
                      <img
                        src={
                          director.profile_path
                            ? `https://image.tmdb.org/t/p/w185${director.profile_path}`
                            : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150"
                        }
                        alt={director.name}
                        className="size-10 rounded-full object-cover border border-white/10 bg-muted/40 shrink-0 shadow-md group-hover:scale-105 group-hover:border-purple-500/50 transition-all"
                        loading="lazy"
                      />
                      <span className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors">
                        {director.name}
                      </span>
                    </Link>
                  </div>
                )}

                {/* Written By */}
                {writers.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      WRITTEN BY
                    </span>
                    <div className="flex flex-wrap items-center gap-4">
                      {writers.map((writer: any) => (
                        <Link
                          key={writer.id}
                          to={`/person/${writer.id}`}
                          className="flex items-center gap-2.5 group cursor-pointer"
                        >
                          <img
                            src={
                              writer.profile_path
                                ? `https://image.tmdb.org/t/p/w185${writer.profile_path}`
                                : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150"
                            }
                            alt={writer.name}
                            className="size-9 rounded-full object-cover border border-white/10 bg-muted/40 shrink-0 shadow-md group-hover:scale-105 group-hover:border-purple-500/50 transition-all"
                            loading="lazy"
                          />
                          <span className="text-xs font-semibold text-white group-hover:text-purple-400 transition-colors">
                            {writer.name}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Produced By */}
                {producers.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      PRODUCED BY
                    </span>
                    <div className="flex flex-wrap items-center gap-3">
                      {producers.map((producer: any) => (
                        <div
                          key={producer.id}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-white/90"
                        >
                          <div className="size-2 rounded-full bg-purple-500" />
                          <span>{producer.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* =======================================================================
            4. MORE LIKE THIS SECTION (Screenshot 2 Top Reference)
        ======================================================================= */}
        <section className="space-y-5 text-left">
          {/* Header */}
          <div className="flex items-end justify-between border-b border-white/5 pb-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[11px] font-bold tracking-widest text-muted-foreground uppercase">
                <div className="w-1 h-3.5 bg-purple-500 rounded-full" />
                <span>KEEP WATCHING</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                More like this
              </h2>
            </div>

            {similarMovies.length > 4 && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => scrollContainer(similarsScrollRef, "left")}
                  className="cursor-pointer size-8 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition active:scale-95"
                  aria-label="Previous similar movies"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <button
                  onClick={() => scrollContainer(similarsScrollRef, "right")}
                  className="cursor-pointer size-8 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition active:scale-95"
                  aria-label="Next similar movies"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            )}
          </div>

          {/* Horizontal 3D Card Carousel */}
          {similarMovies.length > 0 ? (
            <div
              ref={similarsScrollRef}
              className="flex gap-4 sm:gap-5 overflow-x-auto pb-6 pt-2 px-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent snap-x"
            >
              {similarMovies.map((item: any) => {
                const year = item.release_date
                  ? parseInt(item.release_date.split("-")[0], 10)
                  : 0
                const itemRating = item.vote_average
                  ? parseFloat(item.vote_average.toFixed(1))
                  : 0.0
                const poster = item.poster_path
                  ? `https://image.tmdb.org/t/p/w342${item.poster_path}`
                  : "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=500"

                return (
                  <CardContentList
                    key={item.id}
                    id={item.id}
                    title={item.title}
                    image={poster}
                    rating={itemRating}
                    year={year}
                    type="Movie"
                    className="w-40 sm:w-44 md:w-52 shrink-0 snap-start"
                    releaseDate={item.release_date}
                  />
                )
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-8 text-center text-sm text-muted-foreground">
              No similar movies found.
            </div>
          )}
        </section>

        {/* =======================================================================
            5. RECOMMENDED MOVIES SECTION (Screenshot 2 Bottom Reference)
        ======================================================================= */}
        <section className="space-y-5 text-left">
          {/* Header */}
          <div className="flex items-end justify-between border-b border-white/5 pb-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[11px] font-bold tracking-widest text-muted-foreground uppercase">
                <div className="w-1 h-3.5 bg-purple-500 rounded-full" />
                <span>PICKED FOR YOU</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Recommended movies
              </h2>
            </div>

            {recommendedMovies.length > 4 && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => scrollContainer(recommendationsScrollRef, "left")}
                  className="cursor-pointer size-8 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition active:scale-95"
                  aria-label="Previous recommended movies"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <button
                  onClick={() => scrollContainer(recommendationsScrollRef, "right")}
                  className="cursor-pointer size-8 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition active:scale-95"
                  aria-label="Next recommended movies"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            )}
          </div>

          {/* Horizontal 3D Card Carousel */}
          {recommendedMovies.length > 0 ? (
            <div
              ref={recommendationsScrollRef}
              className="flex gap-4 sm:gap-5 overflow-x-auto pb-6 pt-2 px-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent snap-x"
            >
              {recommendedMovies.map((item: any) => {
                const year = item.release_date
                  ? parseInt(item.release_date.split("-")[0], 10)
                  : 0
                const itemRating = item.vote_average
                  ? parseFloat(item.vote_average.toFixed(1))
                  : 0.0
                const poster = item.poster_path
                  ? `https://image.tmdb.org/t/p/w342${item.poster_path}`
                  : "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=500"

                return (
                  <CardContentList
                    key={item.id}
                    id={item.id}
                    title={item.title}
                    image={poster}
                    rating={itemRating}
                    year={year}
                    type="Movie"
                    className="w-40 sm:w-44 md:w-52 shrink-0 snap-start"
                    releaseDate={item.release_date}
                  />
                )
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-8 text-center text-sm text-muted-foreground">
              No recommended movies found.
            </div>
          )}
        </section>
      </div>

      {/* =========================================================================
          MODALS: Trailer & Movie Player
      ========================================================================= */}
      {/* 1. YouTube Trailer Modal Overlay */}
      {isTrailerOpen && activeTrailerKey && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-300"
          onClick={() => setIsTrailerOpen(false)}
        >
          <div
            className="relative w-full max-w-4xl aspect-video rounded-2xl bg-black overflow-hidden border border-white/15 shadow-2xl scale-in duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsTrailerOpen(false)}
              className="absolute top-4 right-4 z-50 cursor-pointer flex size-10 items-center justify-center rounded-full bg-black/70 text-white border border-white/15 hover:bg-black/95 hover:scale-105 transition-all active:scale-95"
              aria-label="Close trailer"
            >
              <X className="size-5" />
            </button>

            <iframe
              src={`https://www.youtube.com/embed/${activeTrailerKey}?autoplay=1`}
              title={`${movie.title} Trailer`}
              className="size-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}

      {/* 2. Streaming Movie Video Player Modal */}
      <VideoPlayerModal
        isOpen={isPlayerOpen}
        onClose={() => setIsPlayerOpen(false)}
        title={`${movie.title} Player`}
        mediaType="movie"
        tmdbId={movie.id}
        imdbId={movie.imdb_id}
        selectedServerId={selectedServerId}
        onServerChange={setSelectedServerId}
      />

      {/* 3. Image Fullscreen Lightbox Modal (Backdrops & Posters) */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/92 backdrop-blur-xl p-4 sm:p-6 md:p-8 animate-in fade-in duration-300"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-5xl max-h-[92vh] flex flex-col items-center justify-center scale-in duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header / Info & Actions */}
            <div className="w-full flex items-center justify-between text-white pb-3 px-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-white/80">
                <span className="px-2 py-0.5 rounded bg-white/10 border border-white/15 uppercase font-bold text-[10px]">
                  {selectedImage.type}
                </span>
                {selectedImage.resolution && (
                  <span className="font-mono text-muted-foreground">
                    {selectedImage.resolution}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={selectedImage.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-semibold text-white/90 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition border border-white/10"
                >
                  <Download className="size-3.5" />
                  <span>Original</span>
                </a>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="size-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer border border-white/10"
                  aria-label="Close image preview"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            {/* Image Preview */}
            <img
              src={selectedImage.url}
              alt={selectedImage.title}
              className="max-h-[82vh] max-w-full rounded-2xl object-contain shadow-2xl border border-white/15"
            />
          </div>
        </div>
      )}
    </div>
  )
}
