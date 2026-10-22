import { useState, useEffect, useRef, useCallback } from "react"
import { useQuery } from "@tanstack/react-query"
import { motion, AnimatePresence } from "motion/react"
import {
  Play,
  Info,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  Clapperboard,
  Tv,
  Star,
  Popcorn,
} from "lucide-react"
import { Link } from "react-router"
import {
  nowPlayingQuery,
  topRatedQuery,
  discoverMoviesQuery,
} from "@/api/fetch-movie"
import {
  topRatedTvQuery,
  discoverTvQuery,
} from "@/api/fetch-tv-shows"
import {
  trendingMovieQuery,
  trendingTvQuery,
} from "@/api/fetch-trending"
import { CarouselSkeleton } from "../skeleton"
import { Card3D, Card3DSkeleton } from "../ui/card-3d"
import { cn } from "@/lib/utils"

// TMDB Genre ID to Name Mapping
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

// Curated Movie Genres with visually distinct backdrop thumbnails matching Screenshot 3
const MOVIE_GENRES = [
  {
    id: 28,
    name: "Action",
    image: "https://image.tmdb.org/t/p/w300/4tjxYg2AbOzzG9G1YuiT2NzYhlH.jpg",
  },
  {
    id: 12,
    name: "Adventure",
    image: "https://image.tmdb.org/t/p/w300/3icyRAqgakNcQn6aDVz9libFmBA.jpg",
  },
  {
    id: 16,
    name: "Animation",
    image: "https://image.tmdb.org/t/p/w300/qcSHGC5BfoqBoP99PzDIERYG5Qm.jpg",
  },
  {
    id: 35,
    name: "Comedy",
    image: "https://image.tmdb.org/t/p/w300/y6RIuwuxLG3Nsb37KUj5yatnTIp.jpg",
  },
  {
    id: 80,
    name: "Crime",
    image: "https://image.tmdb.org/t/p/w300/faJB8DXU0LXwq5ebMLj5drz8S4N.jpg",
  },
  {
    id: 99,
    name: "Documentary",
    image: "https://image.tmdb.org/t/p/w300/7Ud7QIJo21odjCaev6V4md9sK16.jpg",
  },
  {
    id: 18,
    name: "Drama",
    image: "https://image.tmdb.org/t/p/w300/tzoarEu7TsG959upiELyYPm5kO9.jpg",
  },
  {
    id: 10751,
    name: "Family",
    image: "https://image.tmdb.org/t/p/w300/qjTqY5coNiz6sVtPng40IzltsoN.jpg",
  },
  {
    id: 14,
    name: "Fantasy",
    image: "https://image.tmdb.org/t/p/w300/twiVn9oFXOVR0uoYgawyEBlnFu8.jpg",
  },
  {
    id: 27,
    name: "Horror",
    image: "https://image.tmdb.org/t/p/w300/3icyRAqgakNcQn6aDVz9libFmBA.jpg",
  },
  {
    id: 9648,
    name: "Mystery",
    image: "https://image.tmdb.org/t/p/w300/b9q9VmbXDvJmTziRqkwdEmFdwhr.jpg",
  },
  {
    id: 10749,
    name: "Romance",
    image: "https://image.tmdb.org/t/p/w300/oIglj0Jy9duG4LnrRUpH8n001Pk.jpg",
  },
  {
    id: 878,
    name: "Sci-Fi",
    image: "https://image.tmdb.org/t/p/w300/4tjxYg2AbOzzG9G1YuiT2NzYhlH.jpg",
  },
  {
    id: 53,
    name: "Thriller",
    image: "https://image.tmdb.org/t/p/w300/p40lmrdI4blcAPZQMTPaiy5v5Ym.jpg",
  },
]

// Curated TV Genres with visual backdrop thumbnails
const TV_GENRES = [
  {
    id: 10759,
    name: "Action & Adventure",
    image: "https://image.tmdb.org/t/p/w300/pF0qkRsrHkdYadPWY9AMeFZfcwk.jpg",
  },
  {
    id: 16,
    name: "Animation",
    image: "https://image.tmdb.org/t/p/w300/qcSHGC5BfoqBoP99PzDIERYG5Qm.jpg",
  },
  {
    id: 35,
    name: "Comedy",
    image: "https://image.tmdb.org/t/p/w300/hINekSpbcBxjnjGqmIm6I4bz2ab.jpg",
  },
  {
    id: 80,
    name: "Crime",
    image: "https://image.tmdb.org/t/p/w300/xhK9YCxNwnE0OB1SWvCY39heHQI.jpg",
  },
  {
    id: 99,
    name: "Documentary",
    image: "https://image.tmdb.org/t/p/w300/zkwyfIwqWnZbQiHL9oGU8iSNkLG.jpg",
  },
  {
    id: 18,
    name: "Drama",
    image: "https://image.tmdb.org/t/p/w300/dyFTt1a9ZpFdKE96kPlE9fQvXOJ.jpg",
  },
  {
    id: 10751,
    name: "Family",
    image: "https://image.tmdb.org/t/p/w300/dyFTt1a9ZpFdKE96kPlE9fQvXOJ.jpg",
  },
  {
    id: 9648,
    name: "Mystery",
    image: "https://image.tmdb.org/t/p/w300/xhK9YCxNwnE0OB1SWvCY39heHQI.jpg",
  },
  {
    id: 10765,
    name: "Sci-Fi & Fantasy",
    image: "https://image.tmdb.org/t/p/w300/9yCJtipMeDe8uAdSJKvw8BnYfRz.jpg",
  },
]

interface GenreThemeConfig {
  hoverBorder: string
  hoverShadow: string
  selectedRing: string
  selectedShadow: string
  badgeBg: string
  dotBg: string
  dotShadow: string
  accentText: string
  buttonHover: string
  cardGradient: string
}

const GENRE_THEMES: Record<number, GenreThemeConfig> = {
  // Action (Crimson / Fiery Rose)
  28: {
    hoverBorder: "hover:border-rose-500/70",
    hoverShadow: "hover:shadow-[0_0_20px_rgba(244,63,94,0.35)]",
    selectedRing: "ring-2 ring-rose-500",
    selectedShadow: "shadow-[0_0_22px_rgba(244,63,94,0.45)]",
    badgeBg: "bg-rose-500 text-white",
    dotBg: "bg-rose-500",
    dotShadow: "shadow-[0_0_10px_rgba(244,63,94,0.9)]",
    accentText: "text-rose-400",
    buttonHover: "hover:border-rose-500/70 hover:text-rose-300 hover:shadow-[0_0_15px_rgba(244,63,94,0.25)]",
    cardGradient: "from-rose-950/60 via-neutral-900 to-black",
  },
  // Action & Adventure (TV)
  10759: {
    hoverBorder: "hover:border-rose-500/70",
    hoverShadow: "hover:shadow-[0_0_20px_rgba(244,63,94,0.35)]",
    selectedRing: "ring-2 ring-rose-500",
    selectedShadow: "shadow-[0_0_22px_rgba(244,63,94,0.45)]",
    badgeBg: "bg-rose-500 text-white",
    dotBg: "bg-rose-500",
    dotShadow: "shadow-[0_0_10px_rgba(244,63,94,0.9)]",
    accentText: "text-rose-400",
    buttonHover: "hover:border-rose-500/70 hover:text-rose-300 hover:shadow-[0_0_15px_rgba(244,63,94,0.25)]",
    cardGradient: "from-rose-950/60 via-neutral-900 to-black",
  },
  // Adventure (Golden Amber)
  12: {
    hoverBorder: "hover:border-amber-400/70",
    hoverShadow: "hover:shadow-[0_0_20px_rgba(251,191,36,0.35)]",
    selectedRing: "ring-2 ring-amber-400",
    selectedShadow: "shadow-[0_0_22px_rgba(251,191,36,0.45)]",
    badgeBg: "bg-amber-400 text-black",
    dotBg: "bg-amber-400",
    dotShadow: "shadow-[0_0_10px_rgba(251,191,36,0.9)]",
    accentText: "text-amber-400",
    buttonHover: "hover:border-amber-400/70 hover:text-amber-300 hover:shadow-[0_0_15px_rgba(251,191,36,0.25)]",
    cardGradient: "from-amber-950/60 via-neutral-900 to-black",
  },
  // Animation (Sky Cyan / Azure)
  16: {
    hoverBorder: "hover:border-sky-400/70",
    hoverShadow: "hover:shadow-[0_0_20px_rgba(56,189,248,0.35)]",
    selectedRing: "ring-2 ring-sky-400",
    selectedShadow: "shadow-[0_0_22px_rgba(56,189,248,0.45)]",
    badgeBg: "bg-sky-400 text-black",
    dotBg: "bg-sky-400",
    dotShadow: "shadow-[0_0_10px_rgba(56,189,248,0.9)]",
    accentText: "text-sky-400",
    buttonHover: "hover:border-sky-400/70 hover:text-sky-300 hover:shadow-[0_0_15px_rgba(56,189,248,0.25)]",
    cardGradient: "from-sky-950/60 via-neutral-900 to-black",
  },
  // Comedy (Sunny Electric Yellow)
  35: {
    hoverBorder: "hover:border-yellow-400/70",
    hoverShadow: "hover:shadow-[0_0_20px_rgba(250,204,21,0.35)]",
    selectedRing: "ring-2 ring-yellow-400",
    selectedShadow: "shadow-[0_0_22px_rgba(250,204,21,0.45)]",
    badgeBg: "bg-yellow-400 text-black",
    dotBg: "bg-yellow-400",
    dotShadow: "shadow-[0_0_10px_rgba(250,204,21,0.9)]",
    accentText: "text-yellow-400",
    buttonHover: "hover:border-yellow-400/70 hover:text-yellow-300 hover:shadow-[0_0_15px_rgba(250,204,21,0.25)]",
    cardGradient: "from-yellow-950/60 via-neutral-900 to-black",
  },
  // Crime (Neon Violet)
  80: {
    hoverBorder: "hover:border-violet-500/70",
    hoverShadow: "hover:shadow-[0_0_20px_rgba(139,92,246,0.35)]",
    selectedRing: "ring-2 ring-violet-500",
    selectedShadow: "shadow-[0_0_22px_rgba(139,92,246,0.45)]",
    badgeBg: "bg-violet-500 text-white",
    dotBg: "bg-violet-500",
    dotShadow: "shadow-[0_0_10px_rgba(139,92,246,0.9)]",
    accentText: "text-violet-400",
    buttonHover: "hover:border-violet-500/70 hover:text-violet-300 hover:shadow-[0_0_15px_rgba(139,92,246,0.25)]",
    cardGradient: "from-violet-950/60 via-neutral-900 to-black",
  },
  // Documentary (Emerald Jade)
  99: {
    hoverBorder: "hover:border-emerald-400/70",
    hoverShadow: "hover:shadow-[0_0_20px_rgba(52,211,153,0.35)]",
    selectedRing: "ring-2 ring-emerald-400",
    selectedShadow: "shadow-[0_0_22px_rgba(52,211,153,0.45)]",
    badgeBg: "bg-emerald-400 text-black",
    dotBg: "bg-emerald-400",
    dotShadow: "shadow-[0_0_10px_rgba(52,211,153,0.9)]",
    accentText: "text-emerald-400",
    buttonHover: "hover:border-emerald-400/70 hover:text-emerald-300 hover:shadow-[0_0_15px_rgba(52,211,153,0.25)]",
    cardGradient: "from-emerald-950/60 via-neutral-900 to-black",
  },
  // Drama (Royal Indigo)
  18: {
    hoverBorder: "hover:border-indigo-400/70",
    hoverShadow: "hover:shadow-[0_0_20px_rgba(129,140,248,0.35)]",
    selectedRing: "ring-2 ring-indigo-500",
    selectedShadow: "shadow-[0_0_22px_rgba(99,102,241,0.45)]",
    badgeBg: "bg-indigo-500 text-white",
    dotBg: "bg-indigo-400",
    dotShadow: "shadow-[0_0_10px_rgba(99,102,241,0.9)]",
    accentText: "text-indigo-400",
    buttonHover: "hover:border-indigo-400/70 hover:text-indigo-300 hover:shadow-[0_0_15px_rgba(99,102,241,0.25)]",
    cardGradient: "from-indigo-950/60 via-neutral-900 to-black",
  },
  // Family (Warm Tangerine Orange)
  10751: {
    hoverBorder: "hover:border-orange-400/70",
    hoverShadow: "hover:shadow-[0_0_20px_rgba(251,146,60,0.35)]",
    selectedRing: "ring-2 ring-orange-400",
    selectedShadow: "shadow-[0_0_22px_rgba(251,146,60,0.45)]",
    badgeBg: "bg-orange-400 text-black",
    dotBg: "bg-orange-400",
    dotShadow: "shadow-[0_0_10px_rgba(251,146,60,0.9)]",
    accentText: "text-orange-400",
    buttonHover: "hover:border-orange-400/70 hover:text-orange-300 hover:shadow-[0_0_15px_rgba(251,146,60,0.25)]",
    cardGradient: "from-orange-950/60 via-neutral-900 to-black",
  },
  // Fantasy (Mystical Purple)
  14: {
    hoverBorder: "hover:border-purple-400/70",
    hoverShadow: "hover:shadow-[0_0_20px_rgba(192,132,252,0.35)]",
    selectedRing: "ring-2 ring-purple-500",
    selectedShadow: "shadow-[0_0_22px_rgba(168,85,247,0.45)]",
    badgeBg: "bg-purple-500 text-white",
    dotBg: "bg-purple-400",
    dotShadow: "shadow-[0_0_10px_rgba(168,85,247,0.9)]",
    accentText: "text-purple-400",
    buttonHover: "hover:border-purple-400/70 hover:text-purple-300 hover:shadow-[0_0_15px_rgba(168,85,247,0.25)]",
    cardGradient: "from-purple-950/60 via-neutral-900 to-black",
  },
  // Horror (Deep Crimson / Blood Red)
  27: {
    hoverBorder: "hover:border-red-600/70",
    hoverShadow: "hover:shadow-[0_0_20px_rgba(220,38,38,0.35)]",
    selectedRing: "ring-2 ring-red-600",
    selectedShadow: "shadow-[0_0_22px_rgba(220,38,38,0.45)]",
    badgeBg: "bg-red-600 text-white",
    dotBg: "bg-red-600",
    dotShadow: "shadow-[0_0_10px_rgba(220,38,38,0.9)]",
    accentText: "text-red-500",
    buttonHover: "hover:border-red-600/70 hover:text-red-400 hover:shadow-[0_0_15px_rgba(220,38,38,0.25)]",
    cardGradient: "from-red-950/60 via-neutral-900 to-black",
  },
  // Mystery (Fuchsia / Magenta)
  9648: {
    hoverBorder: "hover:border-fuchsia-400/70",
    hoverShadow: "hover:shadow-[0_0_20px_rgba(232,121,249,0.35)]",
    selectedRing: "ring-2 ring-fuchsia-500",
    selectedShadow: "shadow-[0_0_22px_rgba(217,70,239,0.45)]",
    badgeBg: "bg-fuchsia-500 text-white",
    dotBg: "bg-fuchsia-400",
    dotShadow: "shadow-[0_0_10px_rgba(217,70,239,0.9)]",
    accentText: "text-fuchsia-400",
    buttonHover: "hover:border-fuchsia-400/70 hover:text-fuchsia-300 hover:shadow-[0_0_15px_rgba(217,70,239,0.25)]",
    cardGradient: "from-fuchsia-950/60 via-neutral-900 to-black",
  },
  // Romance (Blush Rose Pink)
  10749: {
    hoverBorder: "hover:border-pink-400/70",
    hoverShadow: "hover:shadow-[0_0_20px_rgba(244,114,182,0.35)]",
    selectedRing: "ring-2 ring-pink-400",
    selectedShadow: "shadow-[0_0_22px_rgba(244,114,182,0.45)]",
    badgeBg: "bg-pink-400 text-black",
    dotBg: "bg-pink-400",
    dotShadow: "shadow-[0_0_10px_rgba(244,114,182,0.9)]",
    accentText: "text-pink-400",
    buttonHover: "hover:border-pink-400/70 hover:text-pink-300 hover:shadow-[0_0_15px_rgba(244,114,182,0.25)]",
    cardGradient: "from-pink-950/60 via-neutral-900 to-black",
  },
  // Sci-Fi (Cyber Neon Cyan)
  878: {
    hoverBorder: "hover:border-cyan-400/70",
    hoverShadow: "hover:shadow-[0_0_20px_rgba(34,211,238,0.35)]",
    selectedRing: "ring-2 ring-cyan-400",
    selectedShadow: "shadow-[0_0_22px_rgba(34,211,238,0.45)]",
    badgeBg: "bg-cyan-400 text-black",
    dotBg: "bg-cyan-400",
    dotShadow: "shadow-[0_0_10px_rgba(34,211,238,0.9)]",
    accentText: "text-cyan-400",
    buttonHover: "hover:border-cyan-400/70 hover:text-cyan-300 hover:shadow-[0_0_15px_rgba(34,211,238,0.25)]",
    cardGradient: "from-cyan-950/60 via-neutral-900 to-black",
  },
  // Sci-Fi & Fantasy (TV)
  10765: {
    hoverBorder: "hover:border-cyan-400/70",
    hoverShadow: "hover:shadow-[0_0_20px_rgba(34,211,238,0.35)]",
    selectedRing: "ring-2 ring-cyan-400",
    selectedShadow: "shadow-[0_0_22px_rgba(34,211,238,0.45)]",
    badgeBg: "bg-cyan-400 text-black",
    dotBg: "bg-cyan-400",
    dotShadow: "shadow-[0_0_10px_rgba(34,211,238,0.9)]",
    accentText: "text-cyan-400",
    buttonHover: "hover:border-cyan-400/70 hover:text-cyan-300 hover:shadow-[0_0_15px_rgba(34,211,238,0.25)]",
    cardGradient: "from-cyan-950/60 via-neutral-900 to-black",
  },
  // Thriller (Acid Lime)
  53: {
    hoverBorder: "hover:border-lime-400/70",
    hoverShadow: "hover:shadow-[0_0_20px_rgba(163,230,53,0.35)]",
    selectedRing: "ring-2 ring-lime-400",
    selectedShadow: "shadow-[0_0_22px_rgba(163,230,53,0.45)]",
    badgeBg: "bg-lime-400 text-black",
    dotBg: "bg-lime-400",
    dotShadow: "shadow-[0_0_10px_rgba(163,230,53,0.9)]",
    accentText: "text-lime-400",
    buttonHover: "hover:border-lime-400/70 hover:text-lime-300 hover:shadow-[0_0_15px_rgba(163,230,53,0.25)]",
    cardGradient: "from-lime-950/60 via-neutral-900 to-black",
  },
}

const DEFAULT_GENRE_THEME: GenreThemeConfig = {
  hoverBorder: "hover:border-purple-400/70",
  hoverShadow: "hover:shadow-[0_0_20px_rgba(168,85,247,0.35)]",
  selectedRing: "ring-2 ring-purple-400",
  selectedShadow: "shadow-[0_0_22px_rgba(168,85,247,0.45)]",
  badgeBg: "bg-purple-400 text-black",
  dotBg: "bg-purple-400",
  dotShadow: "shadow-[0_0_10px_rgba(168,85,247,0.9)]",
  accentText: "text-purple-400",
  buttonHover: "hover:border-purple-400/70 hover:text-purple-300 hover:shadow-[0_0_15px_rgba(168,85,247,0.25)]",
  cardGradient: "from-purple-950/60 via-neutral-900 to-black",
}

interface DisplayMovie {
  id: number
  title: string
  year: string
  rating: string
  percentage: number
  genres: string[]
  overview: string
  poster_path: string
  backdrop_path: string
  raw_backdrop_path?: string | null
  thumbnail: string
}

interface MediaCardItem {
  id: number
  title?: string
  name?: string
  backdrop_path?: string | null
  poster_path?: string | null
  release_date?: string
  first_air_date?: string
  vote_average?: number
  genre_ids?: number[]
  overview?: string
}

// Reusable horizontal scroll container with left/right smooth chevron triggers
function HorizontalScrollRow({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const rowRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScroll = useCallback(() => {
    if (!rowRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = rowRef.current
    setCanScrollLeft(scrollLeft > 15)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 15)
  }, [])

  useEffect(() => {
    checkScroll()
    const el = rowRef.current
    if (!el) return
    const handleResize = () => checkScroll()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [checkScroll, children])

  const scroll = (direction: "left" | "right") => {
    if (!rowRef.current) return
    const scrollAmount = rowRef.current.clientWidth * 0.75
    rowRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    })
  }

  return (
    <div className={cn("relative group/scroll", className)}>
      {/* Left chevron button */}
      {canScrollLeft && (
        <button
          onClick={() => scroll("left")}
          className="cursor-pointer hidden md:flex absolute -left-3 lg:-left-5 top-1/2 -translate-y-1/2 z-30 size-11 items-center justify-center rounded-full border border-white/20 bg-background/85 text-foreground backdrop-blur-md shadow-xl transition-all hover:scale-110 active:scale-95"
          aria-label="Scroll left"
        >
          <ChevronLeft className="size-5" />
        </button>
      )}

      {/* Scrollable Track with ample vertical padding for 3D tilt without clipping */}
      <div
        ref={rowRef}
        onScroll={checkScroll}
        className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-none py-6 -my-3 px-2 scroll-smooth"
      >
        {children}
      </div>

      {/* Right chevron button */}
      {canScrollRight && (
        <button
          onClick={() => scroll("right")}
          className="cursor-pointer hidden md:flex absolute -right-3 lg:-right-5 top-1/2 -translate-y-1/2 z-30 size-11 items-center justify-center rounded-full border border-white/20 bg-background/85 text-foreground backdrop-blur-md shadow-xl transition-all hover:scale-110 active:scale-95"
          aria-label="Scroll right"
        >
          <ChevronRight className="size-5" />
        </button>
      )}
    </div>
  )
}

export default function HomePage() {
  // Hero Carousel State
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const touchStartXRef = useRef<number | null>(null)
  const touchEndXRef = useRef<number | null>(null)

  // Section 3: Top 10 Rated Media Toggle State
  const [ratedMediaType, setRatedMediaType] = useState<"movies" | "tv">("movies")

  // Section 4: Browse by Genre Media & Selected Genre State
  const [genreMediaType, setGenreMediaType] = useState<"movies" | "tv">("movies")
  const [selectedMovieGenre, setSelectedMovieGenre] = useState(MOVIE_GENRES[0])
  const [selectedTvGenre, setSelectedTvGenre] = useState(TV_GENRES[0])

  const activeGenre =
    genreMediaType === "movies" ? selectedMovieGenre : selectedTvGenre

  // Delay non-critical below-the-fold queries slightly so Hero gets 100% of network priority
  const [loadDeferred, setLoadDeferred] = useState(false)
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadDeferred(true)
    }, 120)
    return () => clearTimeout(timer)
  }, [])

  // Query 1: Now Playing for Hero Carousel
  const { data: nowPlayingData, isPending: isNowPlayingPending } = useQuery(
    nowPlayingQuery()
  )

  // Query 2: Section 1 - Top 10 Trending Movies Today (immediate for above-the-fold)
  const { data: trendingMoviesData, isPending: isTrendingMoviesPending } =
    useQuery(trendingMovieQuery({ timeWindow: "day" }))

  // Query 3: Section 2 - Top 10 Trending TV Shows Today (deferred)
  const { data: trendingTvData, isPending: isTrendingTvPending } = useQuery({
    ...trendingTvQuery({ timeWindow: "day" }),
    enabled: loadDeferred,
  })

  // Query 4: Section 3 - Top Rated (Movies or TV) (deferred)
  const { data: topRatedMovieData, isPending: isTopRatedMoviePending } =
    useQuery({
      ...topRatedQuery(),
      enabled: loadDeferred && ratedMediaType === "movies",
    })

  const { data: topRatedTvData, isPending: isTopRatedTvPending } = useQuery({
    ...topRatedTvQuery(),
    enabled: loadDeferred && ratedMediaType === "tv",
  })

  // Query 5: Section 4 - Browse by Genre Items (deferred)
  const { data: genreMoviesData, isPending: isGenreMoviesPending } = useQuery({
    ...discoverMoviesQuery({ withGenres: String(selectedMovieGenre.id) }),
    enabled: loadDeferred && genreMediaType === "movies",
  })

  const { data: genreTvData, isPending: isGenreTvPending } = useQuery({
    ...discoverTvQuery({ withGenres: String(selectedTvGenre.id) }),
    enabled: loadDeferred && genreMediaType === "tv",
  })

  // Process Hero Banner Movies
  const nowPlayingMovies: DisplayMovie[] =
    nowPlayingData?.results && nowPlayingData.results.length > 0
      ? nowPlayingData.results.slice(0, 10).map((m: MediaCardItem) => {
        const vote = m.vote_average || 7.5
        const percentage = Math.min(100, Math.round(vote * 10))
        return {
          id: m.id,
          title: m.title || m.name || "Untitled",
          year: m.release_date
            ? m.release_date.split("-")[0]
            : m.first_air_date
              ? m.first_air_date.split("-")[0]
              : "2026",
          rating: vote.toFixed(1),
          percentage,
          genres: m.genre_ids
            ? m.genre_ids
              .map((id: number) => TMDB_GENRES[id] || "Genre")
              .slice(0, 3)
            : ["Cinema"],
          overview: m.overview || "No overview available.",
          poster_path: m.poster_path
            ? `https://image.tmdb.org/t/p/w342${m.poster_path}`
            : "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=500",
          backdrop_path: m.backdrop_path
            ? `https://image.tmdb.org/t/p/w1280${m.backdrop_path}`
            : "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1600",
          raw_backdrop_path: m.backdrop_path,
          thumbnail: m.backdrop_path
            ? `https://image.tmdb.org/t/p/w300${m.backdrop_path}`
            : m.poster_path
              ? `https://image.tmdb.org/t/p/w342${m.poster_path}`
              : "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600",
        }
      })
      : []

  const activeMovie = nowPlayingMovies[activeIndex]

  // Next 3 items for UP NEXT preview carousel
  const upNextMovies =
    nowPlayingMovies.length > 1
      ? [1, 2, 3]
        .map((offset) => {
          const nextIndex = (activeIndex + offset) % nowPlayingMovies.length
          return {
            ...nowPlayingMovies[nextIndex],
            carouselIndex: nextIndex,
          }
        })
        .filter(Boolean)
      : []

  const handleNext = useCallback(() => {
    if (nowPlayingMovies.length === 0) return
    setActiveIndex((prev) => (prev + 1) % nowPlayingMovies.length)
  }, [nowPlayingMovies.length])

  const handlePrev = useCallback(() => {
    if (nowPlayingMovies.length === 0) return
    setActiveIndex(
      (prev) => (prev - 1 + nowPlayingMovies.length) % nowPlayingMovies.length
    )
  }, [nowPlayingMovies.length])

  // Autoplay hero slider
  useEffect(() => {
    if (nowPlayingMovies.length === 0 || isPaused) return
    const timer = setTimeout(() => {
      handleNext()
    }, 6500)
    return () => clearTimeout(timer)
  }, [nowPlayingMovies.length, activeIndex, isPaused, handleNext])

  // Keyboard navigation for carousel
  useEffect(() => {
    if (nowPlayingMovies.length === 0) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") handleNext()
      else if (e.key === "ArrowLeft") handlePrev()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [nowPlayingMovies.length, handleNext, handlePrev])

  // Touch swipe handling
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true)
    touchStartXRef.current = e.targetTouches[0].clientX
    touchEndXRef.current = null
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.targetTouches[0].clientX
  }

  const handleTouchEnd = () => {
    setIsPaused(false)
    if (touchStartXRef.current !== null && touchEndXRef.current !== null) {
      const distance = touchStartXRef.current - touchEndXRef.current
      if (distance > 45) handleNext()
      else if (distance < -45) handlePrev()
    }
    touchStartXRef.current = null
    touchEndXRef.current = null
  }

  // Helper for backdrop resolution
  const getBackdrop = (item: MediaCardItem) => {
    if (item.backdrop_path) {
      return `https://image.tmdb.org/t/p/w300${item.backdrop_path}`
    }
    if (item.poster_path) {
      return `https://image.tmdb.org/t/p/w342${item.poster_path}`
    }
    return "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600"
  }

  // Data subsets
  const top10Movies = (trendingMoviesData?.results || []).slice(0, 10)
  const top10Shows = (trendingTvData?.results || []).slice(0, 10)
  const top10Rated =
    ratedMediaType === "movies"
      ? (topRatedMovieData?.results || []).slice(0, 10)
      : (topRatedTvData?.results || []).slice(0, 10)

  const isRatedPending =
    ratedMediaType === "movies" ? isTopRatedMoviePending : isTopRatedTvPending

  const currentGenreItems =
    genreMediaType === "movies"
      ? genreMoviesData?.results || []
      : genreTvData?.results || []

  const isGenrePending =
    genreMediaType === "movies" ? isGenreMoviesPending : isGenreTvPending

  return (
    <div className="w-full pb-20 bg-background text-foreground">
      {/* ========================================================= */}
      {/* 0. HERO BANNER CAROUSEL (CinemaOS Hero Layout)            */}
      {/* ========================================================= */}
      <section
        role="region"
        aria-roledescription="carousel"
        aria-label="Featured Movies"
        className="relative group w-full h-[80vh] min-h-[580px] sm:h-[84vh] sm:min-h-[620px] md:h-[88vh] md:min-h-[680px] max-h-[960px] bg-black overflow-hidden select-none"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {isNowPlayingPending ? (
          <div className="flex size-full items-center justify-center">
            <CarouselSkeleton />
          </div>
        ) : nowPlayingMovies.length > 0 ? (
          <>
            {/* Animated Backdrop Slider with Ken Burns Effect */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
              <AnimatePresence mode="wait">
                {activeMovie && (
                  <motion.img
                    key={activeMovie.id}
                    src={activeMovie.backdrop_path}
                    srcSet={
                      activeMovie.raw_backdrop_path
                        ? `https://image.tmdb.org/t/p/w780${activeMovie.raw_backdrop_path} 780w, https://image.tmdb.org/t/p/w1280${activeMovie.raw_backdrop_path} 1280w`
                        : undefined
                    }
                    sizes="100vw"
                    alt={activeMovie.title}
                    fetchPriority="high"
                    decoding="async"
                    initial={{ opacity: 0, scale: 1.02 }}
                    animate={{ opacity: 1, scale: 1.07 }}
                    exit={{ opacity: 0 }}
                    transition={{
                      opacity: { duration: 0.8 },
                      scale: { duration: 6.5, ease: "easeOut" },
                    }}
                    className="size-full object-cover object-center"
                  />
                )}
              </AnimatePresence>
            </div>

            {/* Dark gradient mask overlays for legibility */}
            <div className="absolute inset-x-0 top-0 h-28 sm:h-36 z-10 bg-gradient-to-b from-black/80 via-black/30 to-transparent pointer-events-none" />
            <div className="absolute inset-0 z-10 bg-gradient-to-t from-background via-background/80 via-35% md:via-background/40 to-transparent pointer-events-none" />
            <div className="absolute inset-0 z-10 bg-gradient-to-r from-background via-background/75 via-45% to-transparent pointer-events-none" />

            {/* Far right vertical watermark */}
            <div
              aria-hidden="true"
              className="hidden xl:flex absolute right-5 top-1/2 -translate-y-1/2 z-20 pointer-events-none select-none"
            >
              <span className="[writing-mode:vertical-rl] text-[10px] tracking-[0.45em] text-white/20 uppercase font-bold">
                Streaming-ui
              </span>
            </div>

            {/* Main Hero Content: Details on top, Controls + UP NEXT on bottom */}
            {activeMovie && (
              <div className="absolute inset-x-4 sm:inset-x-8 md:inset-x-12 lg:inset-x-16 bottom-8 sm:bottom-10 lg:bottom-12 z-20 flex flex-col justify-end">
                {/* Overlaid Movie Details */}
                <div className="max-w-xl lg:max-w-2xl space-y-3 sm:space-y-4">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeMovie.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -16 }}
                      transition={{ duration: 0.35 }}
                      className="space-y-3 sm:space-y-4"
                    >
                      {/* Top Badge: Pill + Trending rank */}
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
                        <div className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/40 backdrop-blur-md px-3 py-1 shadow-sm">
                          <Popcorn className="size-3.5 text-white/90" />
                          <span className="text-[11px] font-extrabold tracking-wider text-white uppercase">
                            Streaming-ui
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-semibold text-white/80 tracking-wide uppercase">
                          <span className="text-white/40">•</span>
                          <span>
                            #{activeIndex + 1} TRENDING · MOVIE · {activeMovie.year}
                          </span>
                        </div>
                      </div>

                      {/* Title with Camera Viewfinder Framing Brackets */}
                      <div className="relative inline-block pr-6 pb-2">
                        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight text-white leading-[1.05] drop-shadow-2xl font-sans">
                          {activeMovie.title}
                        </h1>
                      </div>

                      {/* Rating Stars, Percentage & Genre Badges */}
                      <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                        {/* 5-Star Rating */}
                        <div className="flex items-center gap-0.5 sm:gap-1 text-amber-400">
                          {[1, 2, 3, 4, 5].map((starNum) => {
                            const starScore = Number(activeMovie.rating) / 2
                            const isFilled = starScore >= starNum - 0.25
                            return (
                              <Star
                                key={starNum}
                                className={cn(
                                  "size-3.5 sm:size-4",
                                  isFilled
                                    ? "fill-amber-400 text-amber-400"
                                    : "fill-white/10 text-white/30"
                                )}
                              />
                            )
                          })}
                        </div>

                        {/* Match Percentage */}
                        <span className="text-xs sm:text-sm font-bold text-white tracking-tight">
                          {activeMovie.percentage}%
                        </span>

                        {/* Genres Badges */}
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                          {activeMovie.genres.map((genre) => (
                            <span
                              key={genre}
                              className="rounded-full border border-white/20 bg-white/10 backdrop-blur-md px-3 py-0.5 text-[11px] sm:text-xs font-medium text-white/90 shadow-sm"
                            >
                              {genre}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-xs sm:text-sm md:text-base text-gray-200/90 leading-relaxed font-normal max-w-xl line-clamp-3 drop-shadow">
                        {activeMovie.overview}
                      </p>

                      {/* Action Buttons: Play, More Info, and Bookmark */}
                      <div className="flex items-center gap-2.5 sm:gap-3 pt-1">
                        <Link to={`/movie-details/${activeMovie.id}?autoplay=true`}>
                          <button className="cursor-pointer flex items-center justify-center gap-2 rounded-full bg-white px-6 sm:px-7 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-black shadow-xl transition-all duration-200 hover:bg-neutral-200 hover:scale-[1.03] active:scale-[0.98]">
                            <Play className="size-3.5 sm:size-4 fill-black text-black" />
                            <span>Play</span>
                          </button>
                        </Link>

                        <Link to={`/movie-details/${activeMovie.id}`}>
                          <button className="cursor-pointer flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-md px-5 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:bg-white/20 hover:scale-[1.03] active:scale-[0.98]">
                            <Info className="size-3.5 sm:size-4" />
                            <span>More Info</span>
                          </button>
                        </Link>

                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Bottom Row: Timeline + Chevrons (Left) & UP NEXT Cards (Right) */}
                <div className="mt-6 sm:mt-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                  {/* Left: Timeline indicator dashes & Navigation Chevrons */}
                  <div className="flex items-center gap-3 sm:gap-4">
                    {/* Segmented Timeline */}
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      {nowPlayingMovies.map((_, index) => {
                        const isActive = index === activeIndex
                        return (
                          <button
                            key={index}
                            onClick={() => setActiveIndex(index)}
                            className="group relative cursor-pointer py-2 focus:outline-none"
                            aria-label={`Go to slide ${index + 1}`}
                          >
                            <div
                              className={cn(
                                "h-1 rounded-full transition-all duration-300",
                                isActive
                                  ? "w-8 sm:w-10 bg-white shadow-[0_0_8px_rgba(255,255,255,0.7)]"
                                  : "w-4 sm:w-5 bg-white/30 hover:bg-white/50"
                              )}
                            />
                          </button>
                        )
                      })}
                    </div>

                    {/* Circular Chevron Buttons */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={handlePrev}
                        className="cursor-pointer size-7 sm:size-8 rounded-full border border-white/20 bg-white/10 backdrop-blur-md flex items-center justify-center text-white/80 hover:text-white hover:bg-white/25 active:scale-95 transition-all"
                        aria-label="Previous slide"
                      >
                        <ChevronLeft className="size-3.5 sm:size-4" />
                      </button>
                      <button
                        onClick={handleNext}
                        className="cursor-pointer size-7 sm:size-8 rounded-full border border-white/20 bg-white/10 backdrop-blur-md flex items-center justify-center text-white/80 hover:text-white hover:bg-white/25 active:scale-95 transition-all"
                        aria-label="Next slide"
                      >
                        <ChevronRight className="size-3.5 sm:size-4" />
                      </button>
                    </div>
                  </div>

                  {/* Right: UP NEXT preview cards */}
                  {upNextMovies.length > 0 && (
                    <div className="hidden md:block">
                      <div className="flex items-center gap-2 mb-2 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-white/80">
                        <span className="h-3 w-0.5 bg-white rounded-full" />
                        <span>UP NEXT</span>
                      </div>
                      <div className="flex items-center gap-3">
                        {upNextMovies.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => setActiveIndex(item.carouselIndex)}
                            className="group/thumb text-left cursor-pointer transition-all duration-300 focus:outline-none"
                          >
                            <div className="w-28 sm:w-32 lg:w-36 aspect-[16/9] rounded-xl overflow-hidden border border-white/15 bg-neutral-900 shadow-xl transition-all duration-300 group-hover/thumb:border-white/50 group-hover/thumb:scale-105 active:scale-95 relative">
                              <img
                                src={item.thumbnail}
                                alt={item.title}
                                loading="lazy"
                                decoding="async"
                                className="size-full object-cover transition-transform duration-500 group-hover/thumb:scale-110"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-60 group-hover/thumb:opacity-20 transition-opacity" />
                            </div>
                            <p className="mt-1.5 text-[11px] sm:text-xs font-medium text-white/80 group-hover/thumb:text-white truncate max-w-[112px] sm:max-w-[128px] lg:max-w-[144px] transition-colors">
                              {item.title}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        ) : null}
      </section>

      {/* Main Content Layout with 4 Key Sections in Exact Sequence */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-10 lg:px-12 pt-8 sm:pt-12 space-y-12 sm:space-y-16">

        {/* ========================================================= */}
        {/* 1. TOP 10 MOVIES (Matching Screenshot 1)                  */}
        {/* ========================================================= */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground/85">
                <span className="h-3.5 w-0.5 bg-white/70 rounded-full" />
                <span>TRENDING TODAY</span>
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
                Top 10 movies
              </h2>
            </div>

            <Link
              to="/trending-movie"
              className="group cursor-pointer rounded-full border border-border/60 bg-muted/30 hover:bg-muted/60 px-3.5 sm:px-4 py-1.5 text-xs font-semibold text-foreground transition-all flex items-center gap-1.5 hover:border-border"
            >
              <span>Browse all</span>
              <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>

          {isTrendingMoviesPending ? (
            <Card3DSkeleton withRank count={5} />
          ) : top10Movies.length > 0 ? (
            <HorizontalScrollRow>
              {top10Movies.map((movie: MediaCardItem, idx: number) => (
                <Card3D
                  key={movie.id}
                  id={movie.id}
                  rank={idx + 1}
                  type="movie"
                  title={movie.title || "Untitled"}
                  image={getBackdrop(movie)}
                  year={movie.release_date ? movie.release_date.split("-")[0] : "2026"}
                  rating={movie.vote_average ? movie.vote_average.toFixed(1) : "0.0"}
                />
              ))}
            </HorizontalScrollRow>
          ) : (
            <div className="flex h-36 items-center justify-center rounded-2xl border border-dashed border-border/40 bg-muted/10">
              <span className="text-sm text-muted-foreground">No trending movies found.</span>
            </div>
          )}
        </section>

        {/* ========================================================= */}
        {/* 2. TOP 10 TV SHOWS (Matching Screenshot 1)                */}
        {/* ========================================================= */}
        <section className="space-y-4 content-auto">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground/85">
                <span className="h-3.5 w-0.5 bg-white/70 rounded-full" />
                <span>TRENDING TODAY</span>
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
                Top 10 shows
              </h2>
            </div>

            <Link
              to="/trending-tv"
              className="group cursor-pointer rounded-full border border-border/60 bg-muted/30 hover:bg-muted/60 px-3.5 sm:px-4 py-1.5 text-xs font-semibold text-foreground transition-all flex items-center gap-1.5 hover:border-border"
            >
              <span>Browse all</span>
              <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>

          {isTrendingTvPending ? (
            <Card3DSkeleton withRank count={5} />
          ) : top10Shows.length > 0 ? (
            <HorizontalScrollRow>
              {top10Shows.map((show: MediaCardItem, idx: number) => (
                <Card3D
                  key={show.id}
                  id={show.id}
                  rank={idx + 1}
                  type="tv"
                  title={show.name || "Untitled"}
                  image={getBackdrop(show)}
                  year={show.first_air_date ? show.first_air_date.split("-")[0] : "2026"}
                  rating={show.vote_average ? show.vote_average.toFixed(1) : "0.0"}
                />
              ))}
            </HorizontalScrollRow>
          ) : (
            <div className="flex h-36 items-center justify-center rounded-2xl border border-dashed border-border/40 bg-muted/10">
              <span className="text-sm text-muted-foreground">No trending shows found.</span>
            </div>
          )}
        </section>

        {/* ========================================================= */}
        {/* 3. TOP 10 RATED (Matching Screenshot 2)                   */}
        {/* ========================================================= */}
        <section className="space-y-4 content-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground/85">
                <span className="h-3.5 w-0.5 bg-white/70 rounded-full" />
                <span>ALL-TIME FAVOURITES</span>
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
                Top 10 rated
              </h2>
            </div>

            {/* Media Toggle + Browse All Button */}
            <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto">
              <div className="flex rounded-full border border-border/60 bg-muted/40 p-1 backdrop-blur-md">
                <button
                  onClick={() => setRatedMediaType("movies")}
                  className={cn(
                    "cursor-pointer flex items-center gap-1.5 px-3.5 py-1 text-xs font-bold rounded-full transition-all duration-200",
                    ratedMediaType === "movies"
                      ? "bg-background text-foreground shadow-sm border border-border/40"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Clapperboard className="size-3.5" />
                  <span>Movies</span>
                </button>
                <button
                  onClick={() => setRatedMediaType("tv")}
                  className={cn(
                    "cursor-pointer flex items-center gap-1.5 px-3.5 py-1 text-xs font-bold rounded-full transition-all duration-200",
                    ratedMediaType === "tv"
                      ? "bg-background text-foreground shadow-sm border border-border/40"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Tv className="size-3.5" />
                  <span>TV Shows</span>
                </button>
              </div>

              <Link
                to={ratedMediaType === "movies" ? "/top-rated-movie" : "/top-rated-tv"}
                className="group cursor-pointer rounded-full border border-border/60 bg-muted/30 hover:bg-muted/60 px-3.5 sm:px-4 py-1.5 text-xs font-semibold text-foreground transition-all flex items-center gap-1.5 hover:border-border"
              >
                <span>Browse all</span>
                <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>
          </div>

          {isRatedPending ? (
            <Card3DSkeleton withRank count={5} />
          ) : top10Rated.length > 0 ? (
            <HorizontalScrollRow>
              {top10Rated.map((item: MediaCardItem, idx: number) => {
                const isMovie = ratedMediaType === "movies"
                return (
                  <Card3D
                    key={item.id}
                    id={item.id}
                    rank={idx + 1}
                    type={isMovie ? "movie" : "tv"}
                    title={(isMovie ? item.title : item.name) || "Untitled"}
                    image={getBackdrop(item)}
                    year={
                      isMovie
                        ? item.release_date ? item.release_date.split("-")[0] : "2026"
                        : item.first_air_date ? item.first_air_date.split("-")[0] : "2026"
                    }
                    rating={item.vote_average ? item.vote_average.toFixed(1) : "0.0"}
                  />
                )
              })}
            </HorizontalScrollRow>
          ) : (
            <div className="flex h-36 items-center justify-center rounded-2xl border border-dashed border-border/40 bg-muted/10">
              <span className="text-sm text-muted-foreground">No top rated items found.</span>
            </div>
          )}
        </section>

        {/* ========================================================= */}
        {/* 4. BROWSE BY GENRE (Matching Screenshot 3)                */}
        {/* ========================================================= */}
        <section className="space-y-6 content-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground/85">
                <span className="h-3.5 w-0.5 bg-white/70 rounded-full" />
                <span>FIND YOUR MOOD</span>
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
                Browse by genre
              </h2>
            </div>

            {/* Media Toggle + Dynamic Browse {Genre} Button */}
            <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto">
              <div className="flex rounded-full border border-border/60 bg-muted/40 p-1 backdrop-blur-md">
                <button
                  onClick={() => setGenreMediaType("movies")}
                  className={cn(
                    "cursor-pointer flex items-center gap-1.5 px-3.5 py-1 text-xs font-bold rounded-full transition-all duration-200",
                    genreMediaType === "movies"
                      ? "bg-background text-foreground shadow-sm border border-border/40"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Clapperboard className="size-3.5" />
                  <span>Movies</span>
                </button>
                <button
                  onClick={() => setGenreMediaType("tv")}
                  className={cn(
                    "cursor-pointer flex items-center gap-1.5 px-3.5 py-1 text-xs font-bold rounded-full transition-all duration-200",
                    genreMediaType === "tv"
                      ? "bg-background text-foreground shadow-sm border border-border/40"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Tv className="size-3.5" />
                  <span>TV Shows</span>
                </button>
              </div>

              {(() => {
                const activeTheme = GENRE_THEMES[activeGenre.id] || DEFAULT_GENRE_THEME
                return (
                  <Link
                    to={
                      genreMediaType === "movies"
                        ? `/movie?genre=${selectedMovieGenre.id}`
                        : `/tv-shows?genre=${selectedTvGenre.id}`
                    }
                    className={cn(
                      "group cursor-pointer rounded-full border border-border/60 bg-muted/30 px-3.5 sm:px-4 py-1.5 text-xs font-semibold text-foreground transition-all flex items-center gap-1.5 hover:border-border",
                      activeTheme.buttonHover
                    )}
                  >
                    <span>Browse {activeGenre.name}</span>
                    <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                )
              })()}
            </div>
          </div>

          {/* Genre Selection Cards Row with "SHOWING" Badge */}
          <HorizontalScrollRow className="py-2">
            {(genreMediaType === "movies" ? MOVIE_GENRES : TV_GENRES).map((genre) => {
              const isSelected = activeGenre.id === genre.id
              const theme = GENRE_THEMES[genre.id] || DEFAULT_GENRE_THEME
              return (
                <button
                  key={genre.id}
                  onClick={() => {
                    if (genreMediaType === "movies") {
                      setSelectedMovieGenre(genre)
                    } else {
                      setSelectedTvGenre(genre)
                    }
                  }}
                  className={cn(
                    "group relative shrink-0 cursor-pointer w-36 sm:w-44 h-20 sm:h-24 rounded-2xl overflow-hidden transition-all duration-300 text-left focus:outline-none bg-gradient-to-br",
                    theme.cardGradient,
                    isSelected
                      ? cn(theme.selectedRing, theme.selectedShadow, "scale-[1.03]")
                      : cn("border border-white/10 opacity-85 hover:opacity-100 hover:scale-[1.02]", theme.hoverBorder, theme.hoverShadow)
                  )}
                >
                  {/* Genre Background Art */}
                  <img
                    src={genre.image}
                    alt={genre.name}
                    loading="lazy"
                    decoding="async"
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      ; (e.currentTarget as HTMLImageElement).src =
                        "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=500"
                    }}
                  />

                  {/* Dark gradient overlay for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                  {/* Showing Badge for active genre (matching Screenshot 3) */}
                  {isSelected && (
                    <div className={cn("absolute top-2 right-2 z-10 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shadow", theme.badgeBg)}>
                      SHOWING
                    </div>
                  )}

                  {/* Genre Label */}
                  <div className="absolute bottom-2.5 left-3 z-10">
                    <span className={cn("font-bold text-xs sm:text-sm drop-shadow transition-colors", isSelected ? theme.accentText : "text-white group-hover:text-white")}>
                      {genre.name}
                    </span>
                  </div>
                </button>
              )
            })}
          </HorizontalScrollRow>

          {/* Selected Genre Movies/Shows Row */}
          {(() => {
            const activeTheme = GENRE_THEMES[activeGenre.id] || DEFAULT_GENRE_THEME
            return (
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 px-1">
                  <span className={cn("size-2.5 rounded-full animate-pulse", activeTheme.dotBg, activeTheme.dotShadow)} />
                  <span className={cn("text-sm sm:text-base font-bold", activeTheme.accentText)}>
                    {activeGenre.name}
                  </span>
                  <span className="text-xs sm:text-sm text-muted-foreground">
                    · {genreMediaType === "movies" ? "Movies" : "TV Shows"}
                  </span>
                </div>

                {isGenrePending ? (
                  <Card3DSkeleton count={5} />
                ) : currentGenreItems.length > 0 ? (
                  <HorizontalScrollRow>
                    {currentGenreItems.map((item: MediaCardItem) => {
                      const isMovie = genreMediaType === "movies"
                      return (
                        <Card3D
                          key={item.id}
                          id={item.id}
                          type={isMovie ? "movie" : "tv"}
                          title={(isMovie ? item.title : item.name) || "Untitled"}
                          image={getBackdrop(item)}
                          year={
                            isMovie
                              ? item.release_date ? item.release_date.split("-")[0] : "2026"
                              : item.first_air_date ? item.first_air_date.split("-")[0] : "2026"
                          }
                          rating={item.vote_average ? item.vote_average.toFixed(1) : "0.0"}
                        />
                      )
                    })}
                  </HorizontalScrollRow>
                ) : (
                  <div className="flex h-36 items-center justify-center rounded-2xl border border-dashed border-border/40 bg-muted/10">
                    <span className="text-sm text-muted-foreground">
                      No {activeGenre.name} titles found.
                    </span>
                  </div>
                )}
              </div>
            )
          })()}
        </section>
      </div>
    </div>
  )
}
