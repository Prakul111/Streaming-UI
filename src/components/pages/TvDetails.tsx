import { useState, useEffect, useRef } from "react"
import { useParams, useSearchParams, Link } from "react-router"
import { useQuery } from "@tanstack/react-query"
import { Play, X, Star, Calendar, Clock, Tv, Plus, List, Compass, Search, ArrowUpDown, Download, ArrowLeft } from "lucide-react"
import {
  tvDetailsQuery,
  tvCreditsQuery,
  tvVideosQuery,
  tvRecommendationsQuery,
  tvSeasonQuery,
} from "@/api/fetch-tv-shows"
import CardContentList from "../card-content-list"
import { MovieRowSkeleton } from "../skeleton"
import { cn } from "@/lib/utils"
import VideoPlayerModal from "../video-player-modal"

export default function TvDetails() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const numericId = id ? parseInt(id, 10) : NaN
  const autoplay = searchParams.get("autoplay") === "true"

  const [isTrailerOpen, setIsTrailerOpen] = useState(false)
  const [isPlayerOpen, setIsPlayerOpen] = useState(false)
  const [playerSeason, setPlayerSeason] = useState(1)
  const [playerEpisode, setPlayerEpisode] = useState(1)
  const [selectedSeason, setSelectedSeason] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

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

  const scrollToEpisodes = () => {
    episodesSectionRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const scrollToSimilars = () => {
    similarsSectionRef.current?.scrollIntoView({ behavior: "smooth" })
  }

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
    ? `https://image.tmdb.org/t/p/original${show.backdrop_path}`
    : "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1600"

  const posterUrl = show.poster_path
    ? `https://image.tmdb.org/t/p/w500${show.poster_path}`
    : "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=500"

  return (
    <div className="w-full bg-background text-foreground pb-24">
      {/* 1. Hero Backdrop Banner */}
      <div className="relative w-full h-[550px] md:h-[70vh] bg-black overflow-hidden select-none">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${backdropUrl})` }}
        />

        {/* Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/30 to-transparent" />

        {/* Back Button */}
        <button
          onClick={() => window.history.back()}
          className="absolute top-28 left-6 md:left-12 z-30 cursor-pointer flex items-center justify-center gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-2 text-sm font-semibold text-white backdrop-blur-md hover:bg-white/10 transition-all active:scale-95"
        >
          <ArrowLeft className="size-4" />
          Back
        </button>

        {/* Hero Info Overlay */}
        <div className="absolute bottom-12 left-6 right-6 md:left-12 z-20 flex flex-col md:flex-row gap-8 items-end max-w-7xl mx-auto">
          {/* Poster Card (hidden on small devices) */}
          <div className="hidden md:block w-52 shrink-0 rounded-2xl overflow-hidden shadow-2xl border border-white/10 hover:scale-[1.02] transition-transform duration-300">
            <img src={posterUrl} alt={show.name} className="w-full aspect-[2/3] object-cover" />
          </div>

          {/* Text Metadata */}
          <div className="flex-grow space-y-4 text-left">
            {/* Title / Logo */}
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight text-white leading-none drop-shadow-md">
              {show.name}
            </h1>

            {/* Action buttons (Stranger Things UI layout) */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={() => {
                  setPlayerSeason(1)
                  setPlayerEpisode(1)
                  setIsPlayerOpen(true)
                }}
                className="cursor-pointer flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 hover:scale-105 transition-all active:scale-95"
              >
                <Play className="size-4 fill-white text-white" />
                Watch Now
              </button>

              {trailerVideo && (
                <button
                  onClick={() => setIsTrailerOpen(true)}
                  className="cursor-pointer flex items-center justify-center gap-2 rounded-full border border-white/25 bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 text-sm font-semibold transition-all active:scale-95"
                >
                  Play Trailer
                </button>
              )}

              <button
                className="cursor-pointer flex items-center justify-center rounded-full border border-white/25 bg-white/10 hover:bg-white/20 text-white p-2.5 transition-all active:scale-95"
                title="Add to Watchlist"
              >
                <Plus className="size-4" />
              </button>

              {seasons.length > 0 && (
                <button
                  onClick={scrollToEpisodes}
                  className="cursor-pointer flex items-center justify-center gap-2 rounded-full border border-white/25 bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 text-sm font-semibold transition-all active:scale-95"
                >
                  <List className="size-4" />
                  Episodes
                </button>
              )}

              <button
                onClick={scrollToSimilars}
                className="cursor-pointer flex items-center justify-center gap-2 rounded-full border border-white/25 bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 text-sm font-semibold transition-all active:scale-95"
              >
                <Compass className="size-4" />
                Similars
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs md:text-sm font-semibold text-gray-300">
              <span className="flex items-center gap-1 text-cyan-400 font-bold">
                <Star className="size-4 fill-cyan-400 text-cyan-400" />
                {show.vote_average ? show.vote_average.toFixed(1) : "0.0"}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="size-4" />
                {airYear}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Tv className="size-4" />
                {show.number_of_seasons} {show.number_of_seasons === 1 ? "Season" : "Seasons"} ({show.number_of_episodes} Episodes)
              </span>
            </div>

            {show.tagline && (
              <p className="text-lg italic text-cyan-200/80 font-medium">
                "{show.tagline}"
              </p>
            )}

            <p className="text-xs md:text-sm text-gray-200/90 leading-relaxed font-normal max-w-3xl drop-shadow">
              {show.overview}
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              {show.genres?.map((genre: any) => (
                <span
                  key={genre.id}
                  className="rounded-full bg-white/10 border border-white/5 px-3.5 py-1 text-xs font-semibold text-white whitespace-nowrap"
                >
                  {genre.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Details Body */}
      <div className="mx-auto max-w-7xl px-6 md:px-12 mt-12 space-y-16">
        
        {/* 2. Episodes Section */}
        {seasons.length > 0 && (
          <div ref={episodesSectionRef} className="space-y-6">
            {/* Section Header */}
            <div className="flex items-center gap-2.5 border-b border-border/40 pb-2">
              <div className="w-[3px] h-6 bg-cyan-400" />
              <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
                Episodes
              </h2>
            </div>

            {/* Season Selector & Episode Filters */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-muted/20 border border-border/40 rounded-xl p-4">
              {/* Dropdown Selector */}
              <div className="relative shrink-0">
                <select
                  value={selectedSeason}
                  onChange={(e) => {
                    setSelectedSeason(parseInt(e.target.value, 10))
                    setSearchQuery("")
                  }}
                  className="w-full cursor-pointer appearance-none rounded-lg border border-border/40 bg-background pl-4 pr-10 py-2.5 text-sm font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
                >
                  {seasons.map((season: any) => (
                    <option key={season.id} value={season.season_number}>
                      {season.name} ({season.episode_count} Episodes)
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
                  <Play className="size-3.5 rotate-90 fill-muted-foreground" />
                </div>
              </div>

              {/* Search input & Sort toggler */}
              <div className="flex items-center gap-3 w-full sm:max-w-md">
                {/* Search Bar */}
                <div className="relative w-full">
                  <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search episode..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-lg border border-border/40 bg-background pl-10 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <X className="size-4" />
                    </button>
                  )}
                </div>

                {/* Sort Toggle Button */}
                <button
                  onClick={() => setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))}
                  className="cursor-pointer shrink-0 flex items-center justify-center rounded-lg border border-border/40 bg-background hover:bg-muted/30 p-2.5 transition-all text-foreground shadow-sm"
                  title={sortOrder === "asc" ? "Sort Descending" : "Sort Ascending"}
                >
                  <ArrowUpDown className={cn("size-4 transition-transform duration-300", sortOrder === "desc" && "rotate-180")} />
                </button>
              </div>
            </div>

            {/* Episode List Rows */}
            <div className="space-y-4">
              {isSeasonPending ? (
                <div className="py-12 text-center text-muted-foreground">Loading season episodes...</div>
              ) : sortedEpisodes.length > 0 ? (
                sortedEpisodes.map((episode: any) => {
                  const epThumbnail = episode.still_path
                    ? `https://image.tmdb.org/t/p/w300${episode.still_path}`
                    : "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=300"

                  return (
                    <div
                      key={episode.id}
                      className="group flex flex-col md:flex-row gap-5 items-center md:items-start p-4 rounded-xl border border-border/40 bg-muted/10 transition-all hover:bg-muted/20 w-full"
                    >
                      {/* Left side Thumbnail */}
                      <div className="relative aspect-video w-44 md:w-56 shrink-0 rounded-lg overflow-hidden shadow-md border border-border/20 select-none">
                        <img
                          src={epThumbnail}
                          alt={episode.name}
                          className="size-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {/* Play Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setPlayerSeason(selectedSeason)
                              setPlayerEpisode(episode.episode_number)
                              setIsPlayerOpen(true)
                            }}
                            className="cursor-pointer flex size-10 items-center justify-center rounded-full bg-white text-black shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-300"
                          >
                            <Play className="size-4 fill-black text-black translate-x-0.5" />
                          </button>
                        </div>
                        {/* Episode Number badge */}
                        <div className="absolute bottom-2 left-2 bg-black/85 text-white border border-white/10 text-xs font-black px-2 py-0.5 rounded shadow">
                          {episode.episode_number}
                        </div>
                      </div>

                      {/* Right side Metadata */}
                      <div className="flex-grow space-y-1 text-center md:text-left select-text">
                        <h3
                          onClick={() => {
                            setPlayerSeason(selectedSeason)
                            setPlayerEpisode(episode.episode_number)
                            setIsPlayerOpen(true)
                          }}
                          className="text-base md:text-lg font-bold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer transition-colors"
                        >
                          {episode.name}
                        </h3>
                        <p className="text-xs text-muted-foreground font-semibold flex items-center justify-center md:justify-start gap-1">
                          <Clock className="size-3.5" />
                          {episode.runtime ? `${episode.runtime} min` : "45 min"}
                        </p>
                        <p className="text-xs md:text-sm text-gray-300/95 font-normal leading-relaxed line-clamp-3 pt-1">
                          {episode.overview || "No description available for this episode."}
                        </p>
                      </div>

                      {/* Download Icon on Right */}
                      <div className="shrink-0 flex items-center justify-center md:self-center md:ml-auto select-none">
                        <button
                          className="cursor-pointer flex size-9 items-center justify-center rounded-full border border-border/40 hover:border-foreground/45 bg-background text-muted-foreground hover:text-foreground hover:scale-105 transition-all active:scale-95"
                          title="Download Episode"
                        >
                          <Download className="size-4" />
                        </button>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="flex h-[150px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/10">
                  <span className="font-medium text-muted-foreground">
                    No episodes match your search query.
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3. Cast List Carousel */}
        {cast.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center gap-2.5 border-b border-border/40 pb-2">
              <div className="w-[3px] h-6 bg-cyan-400" />
              <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
                Cast
              </h2>
            </div>
            <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
              {cast.map((actor: any) => {
                const actorImg = actor.profile_path
                  ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
                  : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150"
                return (
                  <div key={actor.cast_id} className="w-28 shrink-0 flex flex-col items-center text-center space-y-2 select-none">
                    <img
                      src={actorImg}
                      alt={actor.name}
                      className="size-20 md:size-24 rounded-full object-cover shadow-md border border-border/50 bg-muted/20"
                    />
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-foreground leading-tight line-clamp-2">
                        {actor.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground leading-tight line-clamp-2">
                        {actor.character}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* 4. Similars Section */}
        <div ref={similarsSectionRef} className="space-y-6">
          <div className="flex items-center gap-2.5 border-b border-border/40 pb-2">
            <div className="w-[3px] h-6 bg-cyan-400" />
            <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
              Similars
            </h2>
          </div>

          {recommendedShows.length > 0 ? (
            <div className="grid grid-cols-2 justify-items-center sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {recommendedShows.map((show: any) => (
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
        embedUrl={`https://www.vidking.net/embed/tv/${show.id}/${playerSeason}/${playerEpisode}?color=a855f7&autoPlay=true&nextEpisode=true&episodeSelector=true`}
        title={`${show.name} S${playerSeason} E${playerEpisode} Player`}
      />
    </div>
  )
}
