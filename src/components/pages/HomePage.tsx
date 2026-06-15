import { useState, useEffect } from "react"
import { useQuery, useQueries } from "@tanstack/react-query"
import { motion, AnimatePresence } from "motion/react"
import { Play, Info, ChevronLeft, ChevronRight } from "lucide-react"
import { Link } from "react-router"
import { nowPlayingQuery, discoverMoviesQuery } from "@/api/fetch-movie"
import { discoverTvQuery } from "@/api/fetch-tv-shows"
import { CarouselSkeleton, MovieRowSkeleton } from "../skeleton"
import CardContentList from "../card-content-list"
import { cn } from "@/lib/utils"

const TMDB_GENRES: Record<number, string> = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Sci-Fi",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
}

interface DisplayMovie {
  id: number
  title: string
  year: string
  rating: string
  genres: string[]
  overview: string
  poster_path: string
  backdrop_path: string
}

interface GenreRowProps {
  title: string
  genreId: number
  type: "movie" | "tv"
}

function GenreRow({ title, genreId, type }: GenreRowProps) {
  const query = type === "movie"
    ? discoverMoviesQuery({ withGenres: String(genreId) })
    : discoverTvQuery({ withGenres: String(genreId) })

  const { data, isPending, error } = useQuery(query)

  if (error) {
    console.error(`Failed to fetch ${type} genre ${title}:`, error)
    return null
  }

  const items = data?.results || []

  return (
    <div className="space-y-4">
      <h3 className="px-1 text-xl font-bold tracking-tight text-foreground">{title}</h3>
      {isPending ? (
        <MovieRowSkeleton />
      ) : items.length > 0 ? (
        <div className="flex gap-6 overflow-x-auto rounded-md p-1 pb-4 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
          {items.map((item: any) => (
            <CardContentList
              key={item.id}
              id={item.id}
              title={type === "movie" ? item.title : item.name}
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
                type === "movie"
                  ? item.release_date
                    ? parseInt(item.release_date.split("-")[0])
                    : 0
                  : item.first_air_date
                    ? parseInt(item.first_air_date.split("-")[0])
                    : 0
              }
              type={type === "movie" ? "Movie" : "TV Show"}
            />
          ))}
        </div>
      ) : (
        <div className="flex h-[150px] items-center justify-center rounded-2xl border border-dashed border-border bg-muted/10">
          <span className="text-sm text-muted-foreground">No items found.</span>
        </div>
      )}
    </div>
  )
}

export default function HomePage() {
  const [activeMediaType, setActiveMediaType] = useState<"movies" | "tv">("movies")
  const [activeIndex, setActiveIndex] = useState(0)

  const [
    {
      data: nowPlayingData,
      isPending: isNowPlayingPending,
      error: nowPlayingError,
    },
  ] = useQueries({
    queries: [nowPlayingQuery()],
  })

  if (nowPlayingError) {
    console.error("Failed to fetch now playing movies from TMDB:", {
      nowPlayingError,
    })
  }

  const nowPlayingMovies: DisplayMovie[] =
    nowPlayingData?.results && nowPlayingData.results.length > 0
      ? nowPlayingData.results.slice(0, 10).map((m: any) => ({
          id: m.id,
          title: m.title,
          year: m.release_date ? m.release_date.split("-")[0] : "N/A",
          rating: m.vote_average ? m.vote_average.toFixed(1) : "0.0",
          genres: m.genre_ids
            ? m.genre_ids
                .map((id: number) => TMDB_GENRES[id] || "Genre")
                .slice(0, 3)
            : [],
          overview: m.overview,
          poster_path: m.poster_path
            ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
            : "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=500",
          backdrop_path: m.backdrop_path
            ? `https://image.tmdb.org/t/p/original${m.backdrop_path}`
            : "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1600",
        }))
      : []

  const activeMovie = nowPlayingMovies[activeIndex]

  // Auto-play interval: rotate slide every 6 seconds
  useEffect(() => {
    if (nowPlayingMovies.length === 0) return
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % nowPlayingMovies.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [nowPlayingMovies.length])

  // Keyboard navigation overrides
  useEffect(() => {
    if (nowPlayingMovies.length === 0) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        setActiveIndex((prev) => (prev + 1) % nowPlayingMovies.length)
      } else if (e.key === "ArrowLeft") {
        setActiveIndex((prev) => (prev - 1 + nowPlayingMovies.length) % nowPlayingMovies.length)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [nowPlayingMovies.length])

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % nowPlayingMovies.length)
  }

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + nowPlayingMovies.length) % nowPlayingMovies.length)
  }

  return (
    <div className="w-full pb-16 bg-background text-foreground">
      {/* 1. Full-Bleed Hero Banner Carousel */}
      <div className="relative group w-full h-[650px] md:h-[80vh] md:min-h-[700px] bg-black overflow-hidden select-none">
        {isNowPlayingPending ? (
          <div className="flex size-full items-center justify-center">
            <CarouselSkeleton />
          </div>
        ) : nowPlayingMovies.length > 0 ? (
          <>
            {/* Animated Backdrop Slider with Ken Burns Effect */}
            <div className="absolute inset-0 z-0">
              <AnimatePresence mode="wait">
                {activeMovie && (
                  <motion.div
                    key={activeMovie.id}
                    initial={{ opacity: 0, scale: 1.02 }}
                    animate={{ opacity: 1, scale: 1.07 }}
                    exit={{ opacity: 0 }}
                    transition={{
                      opacity: { duration: 0.8 },
                      scale: { duration: 6.5, ease: "easeOut" },
                    }}
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${activeMovie.backdrop_path})` }}
                  />
                )}
              </AnimatePresence>
            </div>

            {/* Dark gradient mask overlays */}
            {/* Bottom fade to background color */}
            <div className="absolute inset-0 z-10 bg-gradient-to-t from-background via-background/20 to-transparent" />
            {/* Left fade for text contrast */}
            <div className="absolute inset-0 z-10 bg-gradient-to-r from-background/90 via-background/15 to-transparent" />

            {/* Overlaid Movie Details (Bottom-Left) */}
            {activeMovie && (
              <div className="absolute bottom-16 left-6 right-6 md:bottom-24 md:left-16 z-20 max-w-2xl space-y-4">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeMovie.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-4"
                  >
                    {/* Metadata Row */}
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs md:text-sm font-semibold text-gray-300">
                      <span className="text-cyan-400 font-bold">★ {activeMovie.rating}</span>
                      <span>•</span>
                      <span>{activeMovie.year}</span>
                      {activeMovie.genres.map((genre) => (
                        <span key={genre} className="flex items-center gap-2">
                          <span>•</span>
                          <span>{genre}</span>
                        </span>
                      ))}
                    </div>

                    {/* Title */}
                    <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight text-white leading-none drop-shadow-md">
                      {activeMovie.title}
                    </h1>

                    {/* Description */}
                    <p className="text-xs md:text-sm text-gray-200/90 leading-relaxed font-normal max-w-xl line-clamp-3">
                      {activeMovie.overview}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <Link to={`/movie-details/${activeMovie.id}?autoplay=true`}>
                        <button className="cursor-pointer flex items-center justify-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-bold text-black shadow-lg transition-transform hover:scale-[1.03] active:scale-[0.98]">
                          <Play className="size-4 fill-black text-black" />
                          Play
                        </button>
                      </Link>
                      <Link to={`/movie-details/${activeMovie.id}`}>
                        <button className="cursor-pointer flex items-center justify-center gap-2 rounded-full border border-white/20 bg-black/30 backdrop-blur-md px-6 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.03] hover:bg-white/10 active:scale-[0.98]">
                          <Info className="size-4" />
                          See More
                        </button>
                      </Link>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            )}

            {/* Edge Navigation Arrow Overlays (Visible on Hover) */}
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-30 flex size-12 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-black/20 text-white backdrop-blur-sm opacity-0 transition-all duration-300 hover:bg-black/50 hover:scale-105 active:scale-95 group-hover:opacity-100"
              aria-label="Previous slide"
            >
              <ChevronLeft className="size-6" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-30 flex size-12 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-black/20 text-white backdrop-blur-sm opacity-0 transition-all duration-300 hover:bg-black/50 hover:scale-105 active:scale-95 group-hover:opacity-100"
              aria-label="Next slide"
            >
              <ChevronRight className="size-6" />
            </button>

            {/* Bottom-Right Slide Indicator Bars */}
            <div className="absolute bottom-16 right-6 md:bottom-24 md:right-16 z-20 flex items-center gap-2.5">
              {nowPlayingMovies.map((_, index) => {
                const isActive = index === activeIndex
                return (
                  <button
                    key={index}
                    onClick={() => setActiveIndex(index)}
                    className="group relative cursor-pointer py-2 focus:outline-none"
                    aria-label={`Go to slide ${index + 1}`}
                  >
                    {/* Visual Bar container */}
                    <div
                      className="h-1.5 rounded-full overflow-hidden transition-all duration-300"
                      style={{ width: isActive ? "50px" : "12px" }}
                    >
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-300",
                          isActive
                            ? "bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)]"
                            : "bg-white/40 group-hover:bg-white/60"
                        )}
                      />
                    </div>
                  </button>
                )
              })}
            </div>
          </>
        ) : (
          <div className="flex h-[200px] w-full items-center justify-center rounded-3xl border border-dashed border-border bg-muted/10">
            <span className="text-muted-foreground">
              No featured movies available.
            </span>
          </div>
        )}
      </div>

      {/* 2. Category Rows & Explorer Section */}
      <div className="mx-auto max-w-7xl px-6 md:px-12 py-10 space-y-12">
        <div className="flex flex-col gap-4 border-b border-border/40 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
            Explore Categories
          </h2>
          <div className="flex self-start rounded-2xl border border-border/40 bg-muted/60 p-1.5 backdrop-blur-md sm:self-auto">
            <button
              onClick={() => setActiveMediaType("movies")}
              className={cn(
                "cursor-pointer rounded-xl px-6 py-2 text-sm font-semibold transition-all duration-200",
                activeMediaType === "movies"
                  ? "border border-border/15 bg-background text-foreground shadow-lg"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Movies
            </button>
            <button
              onClick={() => setActiveMediaType("tv")}
              className={cn(
                "cursor-pointer rounded-xl px-6 py-2 text-sm font-semibold transition-all duration-200",
                activeMediaType === "tv"
                  ? "border border-border/15 bg-background text-foreground shadow-lg"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              TV Shows
            </button>
          </div>
        </div>

        <div className="space-y-12">
          {activeMediaType === "movies" ? (
            <>
              <GenreRow title="Thriller Movies" genreId={53} type="movie" />
              <GenreRow title="Action Movies" genreId={28} type="movie" />
              <GenreRow title="Comedy Movies" genreId={35} type="movie" />
              <GenreRow title="Drama Movies" genreId={18} type="movie" />
              <GenreRow title="Animation Movies" genreId={16} type="movie" />
            </>
          ) : (
            <>
              <GenreRow title="Action & Adventure Shows" genreId={10759} type="tv" />
              <GenreRow title="Comedy Shows" genreId={35} type="tv" />
              <GenreRow title="Drama Shows" genreId={18} type="tv" />
              <GenreRow title="Mystery Shows" genreId={9648} type="tv" />
              <GenreRow title="Animation Shows" genreId={16} type="tv" />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
