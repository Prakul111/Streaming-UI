import { useState, useEffect, useRef } from "react"
import { useParams, useSearchParams, Link } from "react-router"
import { useQuery } from "@tanstack/react-query"
import { Play, X, Star, Calendar, Clock, Plus, Compass, ArrowLeft } from "lucide-react"
import {
  movieDetailsQuery,
  movieCreditsQuery,
  movieVideosQuery,
  movieRecommendationsQuery,
} from "@/api/fetch-movie"
import CardContentList from "../card-content-list"
import { MovieRowSkeleton } from "../skeleton"
import VideoPlayerModal from "../video-player-modal"

export default function MovieDetails() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const numericId = id ? parseInt(id, 10) : NaN
  const autoplay = searchParams.get("autoplay") === "true"

  const [isTrailerOpen, setIsTrailerOpen] = useState(false)
  const [isPlayerOpen, setIsPlayerOpen] = useState(false)
  const similarsSectionRef = useRef<HTMLDivElement>(null)

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

  const { data: recommendations } = useQuery({
    ...movieRecommendationsQuery(numericId),
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

  // Scroll to top when movie ID changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [id])

  const scrollToSimilars = () => {
    similarsSectionRef.current?.scrollIntoView({ behavior: "smooth" })
  }

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
      <div className="mx-auto max-w-7xl px-6 pt-28 pb-16 md:px-12">
        <div className="space-y-6">
          <div className="h-[400px] w-full animate-pulse rounded-3xl bg-muted/30" />
          <MovieRowSkeleton />
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

  const cast = credits?.cast?.slice(0, 12) || []
  const recommendedMovies = recommendations?.results?.slice(0, 12) || []
  const releaseYear = movie.release_date ? movie.release_date.split("-")[0] : "N/A"
  
  // Format Runtime (e.g. 130 -> 2h 10m)
  const formatRuntime = (minutes: number) => {
    if (!minutes) return "N/A"
    const hrs = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`
  }

  const backdropUrl = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
    : "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1600"

  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=500"

  return (
    <div className="w-full bg-background text-foreground pb-24">
      {/* 1. Hero Backdrop Banner */}
      <div className="relative w-full h-[280px] sm:h-[400px] md:h-[70vh] bg-black overflow-hidden select-none">
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
          className="absolute top-20 md:top-28 left-6 md:left-12 z-30 cursor-pointer flex items-center justify-center gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-2 text-sm font-semibold text-white backdrop-blur-md hover:bg-white/10 transition-all active:scale-95"
        >
          <ArrowLeft className="size-4" />
          Back
        </button>
      </div>

      {/* Hero Info Overlay */}
      <div className="relative z-20 max-w-7xl mx-auto px-6 md:px-12 -mt-20 sm:-mt-28 md:-mt-36 flex flex-col md:flex-row gap-6 md:gap-8 items-start md:items-end">
        {/* Poster Card (hidden on small devices) */}
        <div className="hidden md:block w-52 shrink-0 rounded-2xl overflow-hidden shadow-2xl border border-white/10 hover:scale-[1.02] transition-transform duration-300 bg-background">
          <img src={posterUrl} alt={movie.title} className="w-full aspect-[2/3] object-cover" />
        </div>

        {/* Text Metadata */}
        <div className="flex-grow space-y-4 text-left">
          {/* Title / Logo */}
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-black uppercase tracking-tight text-white leading-tight drop-shadow-md">
            {movie.title}
          </h1>

          {/* Action buttons (Stranger Things UI layout) */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              onClick={() => setIsPlayerOpen(true)}
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
              {movie.vote_average ? movie.vote_average.toFixed(1) : "0.0"}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="size-4" />
              {releaseYear}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="size-4" />
              {formatRuntime(movie.runtime)}
            </span>
          </div>

          {movie.tagline && (
            <p className="text-base md:text-lg italic text-cyan-200/80 font-medium">
              "{movie.tagline}"
            </p>
          )}

          <p className="text-xs md:text-sm text-gray-200/90 leading-relaxed font-normal max-w-3xl drop-shadow">
            {movie.overview}
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            {movie.genres?.map((genre: any) => (
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

      {/* Main Details Body */}
      <div className="mx-auto max-w-7xl px-6 md:px-12 mt-12 space-y-16">
        
        {/* 2. Cast List Carousel */}
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

        {/* 3. More Like This Section */}
        <div ref={similarsSectionRef} className="space-y-6">
          <div className="flex items-center gap-2.5 border-b border-border/40 pb-2">
            <div className="w-[3px] h-6 bg-cyan-400" />
            <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
              Similars
            </h2>
          </div>

          {recommendedMovies.length > 0 ? (
            <div className="grid grid-cols-2 justify-items-center sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {recommendedMovies.map((movie: any) => (
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
                      ? parseInt(movie.release_date.split("-")[0], 10)
                      : 0
                  }
                  type="Movie"
                  className="w-full"
                />
              ))}
            </div>
          ) : (
            <div className="flex h-[180px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/10">
              <span className="font-medium text-muted-foreground">
                No similar movies found.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 4. Trailer Modal Overlay */}
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
              title={`${movie.title} Official Trailer`}
              className="size-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}
      {/* 5. Movie Player Modal Overlay */}
      <VideoPlayerModal
        isOpen={isPlayerOpen}
        onClose={() => setIsPlayerOpen(false)}
        embedUrl={`https://www.vidking.net/embed/movie/${movie.id}?color=a855f7&autoPlay=true`}
        title={`${movie.title} Player`}
      />
    </div>
  )
}
