import { useState } from "react"
import { Link, useNavigate } from "react-router"
import {
  Film,
  Tv,
  Flame,
  Sparkles,
  ChevronUp,
  ShieldCheck,
  MonitorPlay,
  X,
  Layers,
} from "lucide-react"
import popcornLogo from "@/assets/popcorn-svgrepo-com.svg"
import { SparklesText } from "./ui/sparkles-text"
import { SearchBar } from "./ui/search-bar"

const GENRES = [
  { id: 28, name: "Action", type: "movie" },
  { id: 12, name: "Adventure", type: "movie" },
  { id: 16, name: "Animation", type: "movie" },
  { id: 35, name: "Comedy", type: "movie" },
  { id: 80, name: "Crime", type: "movie" },
  { id: 99, name: "Documentary", type: "movie" },
  { id: 18, name: "Drama", type: "movie" },
  { id: 14, name: "Fantasy", type: "movie" },
  { id: 27, name: "Horror", type: "movie" },
  { id: 9648, name: "Mystery", type: "movie" },
  { id: 878, name: "Sci-Fi", type: "movie" },
  { id: 53, name: "Thriller", type: "movie" },
]

export default function Footer() {
  const navigate = useNavigate()
  const [quickSearchInput, setQuickSearchInput] = useState("")
  const [activeModal, setActiveModal] = useState<"dmca" | "privacy" | "terms" | null>(null)

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const query = quickSearchInput.trim()
    if (query) {
      navigate(`/search?q=${encodeURIComponent(query)}`)
      scrollToTop()
    }
  }

  return (
    <footer
      role="contentinfo"
      className="relative mt-auto w-full border-t border-border/40 bg-card/30 text-foreground backdrop-blur-xl transition-colors"
    >
      {/* Top Ambient Glow & Accent Gradient Line */}
      <div className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-purple-500/60 to-transparent" />
      <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 size-96 rounded-full bg-purple-600/10 blur-[120px] dark:bg-purple-600/15" />

      {/* Feature Highlights Banner */}
      <div className="border-b border-border/30 bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Feature 1 */}
            <div className="group flex items-start gap-3.5 rounded-2xl border border-border/30 bg-card/40 p-4 transition-all duration-300 hover:border-purple-500/30 hover:bg-card/70 hover:shadow-lg hover:shadow-purple-500/5">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform duration-300">
                <Film className="size-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-foreground tracking-tight">
                  1,000,000+ Titles
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Deep catalog of global movies, TV series, seasons & episodes.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group flex items-start gap-3.5 rounded-2xl border border-border/30 bg-card/40 p-4 transition-all duration-300 hover:border-purple-500/30 hover:bg-card/70 hover:shadow-lg hover:shadow-purple-500/5">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform duration-300">
                <MonitorPlay className="size-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-foreground tracking-tight">
                  Multi-Server Playback
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Adaptive streaming engines with instant server failover.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group flex items-start gap-3.5 rounded-2xl border border-border/30 bg-card/40 p-4 transition-all duration-300 hover:border-purple-500/30 hover:bg-card/70 hover:shadow-lg hover:shadow-purple-500/5">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform duration-300">
                <Flame className="size-5 text-amber-400" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-foreground tracking-tight">
                  Real-Time Trending
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Daily and weekly trending tracking worldwide audience metrics.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="group flex items-start gap-3.5 rounded-2xl border border-border/30 bg-card/40 p-4 transition-all duration-300 hover:border-purple-500/30 hover:bg-card/70 hover:shadow-lg hover:shadow-purple-500/5">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="size-5 text-cyan-400" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-foreground tracking-tight">
                  4K & HD Previews
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Theatrical teasers, official trailers, and high-res backdrops.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12 pt-12 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Brand & Identity Column (lg:col-span-4) */}
          <div className="space-y-5 lg:col-span-4">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <Link to="/" onClick={scrollToTop} className="flex items-center gap-2 group">
                <img
                  className="h-7 w-auto transition-transform duration-300 group-hover:scale-110"
                  src={popcornLogo}
                  alt="Streaming UI Logo"
                />
                <SparklesText
                  sparklesCount={2}
                  className="text-xl font-black tracking-tight"
                >
                  Streaming UI
                </SparklesText>
              </Link>
            </div>

            {/* Tagline */}
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              The premier open-source streaming interface and cinematic discovery platform.
              Explore trending movies, binge television series, inspect cast filmographies,
              and watch high-definition trailers seamlessly.
            </p>


          </div>

          {/* Movies Column (lg:col-span-2) */}
          <div className="space-y-4 lg:col-span-2">
            <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground">
              <Film className="size-3.5 text-purple-400" />
              <span>Movies</span>
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  to="/movie"
                  onClick={scrollToTop}
                  className="text-muted-foreground hover:text-purple-400 transition-colors inline-flex items-center gap-1.5"
                >
                  Discover Movies
                </Link>
              </li>
              <li>
                <Link
                  to="/now-playing-movie"
                  onClick={scrollToTop}
                  className="text-muted-foreground hover:text-purple-400 transition-colors inline-flex items-center gap-1.5"
                >
                  Now Playing
                </Link>
              </li>
              <li>
                <Link
                  to="/popular-movie"
                  onClick={scrollToTop}
                  className="text-muted-foreground hover:text-purple-400 transition-colors inline-flex items-center gap-1.5"
                >
                  Popular Movies
                </Link>
              </li>
              <li>
                <Link
                  to="/top-rated-movie"
                  onClick={scrollToTop}
                  className="text-muted-foreground hover:text-purple-400 transition-colors inline-flex items-center gap-1.5"
                >
                  Top Rated Movies
                </Link>
              </li>
              <li>
                <Link
                  to="/trending-movie"
                  onClick={scrollToTop}
                  className="text-muted-foreground hover:text-purple-400 transition-colors inline-flex items-center gap-1.5"
                >
                  Trending Movies
                </Link>
              </li>
              <li>
                <Link
                  to="/movie?category=upcoming"
                  onClick={scrollToTop}
                  className="text-muted-foreground hover:text-purple-400 transition-colors inline-flex items-center gap-1.5"
                >
                  Upcoming Releases
                </Link>
              </li>
            </ul>
          </div>

          {/* TV Shows Column (lg:col-span-2) */}
          <div className="space-y-4 lg:col-span-2">
            <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground">
              <Tv className="size-3.5 text-purple-400" />
              <span>TV Shows</span>
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  to="/tv-shows"
                  onClick={scrollToTop}
                  className="text-muted-foreground hover:text-purple-400 transition-colors inline-flex items-center gap-1.5"
                >
                  Discover Shows
                </Link>
              </li>
              <li>
                <Link
                  to="/airing-today-tv"
                  onClick={scrollToTop}
                  className="text-muted-foreground hover:text-purple-400 transition-colors inline-flex items-center gap-1.5"
                >
                  Airing Today
                </Link>
              </li>
              <li>
                <Link
                  to="/popular-tv"
                  onClick={scrollToTop}
                  className="text-muted-foreground hover:text-purple-400 transition-colors inline-flex items-center gap-1.5"
                >
                  Popular TV Series
                </Link>
              </li>
              <li>
                <Link
                  to="/top-rated-tv"
                  onClick={scrollToTop}
                  className="text-muted-foreground hover:text-purple-400 transition-colors inline-flex items-center gap-1.5"
                >
                  Top Rated Shows
                </Link>
              </li>
              <li>
                <Link
                  to="/trending-tv"
                  onClick={scrollToTop}
                  className="text-muted-foreground hover:text-purple-400 transition-colors inline-flex items-center gap-1.5"
                >
                  Trending TV
                </Link>
              </li>
              <li>
                <Link
                  to="/people"
                  onClick={scrollToTop}
                  className="text-muted-foreground hover:text-purple-400 transition-colors inline-flex items-center gap-1.5"
                >
                  Cast & Celebrities
                </Link>
              </li>
            </ul>
          </div>

          {/* Explore & Quick Search Column (lg:col-span-4) */}
          <div className="space-y-5 lg:col-span-4">
            <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground">
              <Sparkles className="size-3.5 text-purple-400" />
              <span>Find & Stay Connected</span>
            </h4>

            {/* Quick Find Search Box */}
            <SearchBar
              value={quickSearchInput}
              onChange={setQuickSearchInput}
              onSubmit={handleQuickSearch}
              placeholder="Jump to any movie or show..."
              size="sm"
              submitButtonText="Go"
            />

          </div>
        </div>

        {/* Quick Genre Cloud Row */}
        <div className="mt-12 pt-8 border-t border-border/30 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Layers className="size-3.5 text-purple-400" />
              Popular Genres
            </span>
            <Link
              to="/movie"
              onClick={scrollToTop}
              className="text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors"
            >
              Browse All Filters &rarr;
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {GENRES.map((g) => (
              <Link
                key={g.id}
                to={`/movie`}
                onClick={scrollToTop}
                className="rounded-lg border border-border/40 bg-card/40 px-2.5 py-1 text-xs text-muted-foreground hover:border-purple-500/40 hover:bg-purple-500/10 hover:text-purple-400 transition-all hover:scale-[1.02]"
              >
                {g.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Sub-Footer Bar */}
      <div className="border-t border-border/30 bg-muted/15 py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          {/* Disclaimer & Copyright */}
          <div className="space-y-1 text-center md:text-left">
            <p className="max-w-2xl leading-relaxed text-[11px] text-muted-foreground/80">
              <strong className="text-foreground/90">TMDB Attribution:</strong> This product uses the TMDB API
              but is not endorsed or certified by TMDB. Streaming UI does not host any video files; media is
              streamed from non-affiliated third-party servers.
            </p>
            <p className="text-[11px] pt-1">
              &copy; {new Date().getFullYear()} Streaming UI. Crafted for movie & TV enthusiasts.
            </p>
          </div>

          {/* Action Links & Back to Top */}
          <div className="flex flex-wrap items-center gap-4 shrink-0">
            <div className="flex items-center gap-3 text-xs">
              <button
                type="button"
                onClick={() => setActiveModal("dmca")}
                className="hover:text-foreground transition-colors cursor-pointer underline-offset-4 hover:underline"
              >
                DMCA
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => setActiveModal("privacy")}
                className="hover:text-foreground transition-colors cursor-pointer underline-offset-4 hover:underline"
              >
                Privacy
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => setActiveModal("terms")}
                className="hover:text-foreground transition-colors cursor-pointer underline-offset-4 hover:underline"
              >
                Terms
              </button>
            </div>

            {/* Back to top button */}
            <button
              onClick={scrollToTop}
              className="cursor-pointer group flex items-center gap-1.5 rounded-full border border-border/50 bg-card/80 px-3.5 py-1.5 text-xs font-semibold text-foreground shadow-sm hover:border-purple-500/50 hover:bg-purple-500/10 hover:text-purple-400 transition-all active:scale-95"
              title="Back to top of page"
            >
              <span>Top</span>
              <ChevronUp className="size-3.5 transition-transform group-hover:-translate-y-0.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Info / Policy Modal Dialog */}
      {activeModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="relative w-full max-w-lg rounded-2xl border border-border bg-background p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-5 text-purple-400" />
                <h3 className="text-lg font-bold text-foreground">
                  {activeModal === "dmca" && "DMCA & Content Disclaimer"}
                  {activeModal === "privacy" && "Privacy Notice"}
                  {activeModal === "terms" && "Terms of Use"}
                </h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-muted-foreground max-h-[60vh] overflow-y-auto pr-1">
              {activeModal === "dmca" && (
                <>
                  <p>
                    Streaming UI operates strictly as an open-source visual front-end interface and informational
                    index powered by TMDB. We do not upload, host, transmit, or maintain any video files or media
                    content on our servers.
                  </p>
                  <p>
                    All video streams and embeds are fetched dynamically from external third-party servers. If you believe
                    your copyrighted material is linked improperly, please contact the third-party web host directly.
                  </p>
                  <p>
                    TMDB API usage complies with TMDB API Terms of Use. TMDB does not endorse or sponsor this application.
                  </p>
                </>
              )}

              {activeModal === "privacy" && (
                <>
                  <p>
                    Streaming UI respects your privacy. We do not track personal identifying information, sell user data,
                    or require mandatory account registration to browse movies and television shows.
                  </p>
                  <p>
                    Local preferences such as theme selection (dark/light) and active streaming server preferences are saved
                    locally in your browser's localStorage for convenience.
                  </p>
                </>
              )}

              {activeModal === "terms" && (
                <>
                  <p>
                    By using Streaming UI, you acknowledge that this web application is intended for personal and educational
                    exploration of cinematic data provided by The Movie Database (TMDB).
                  </p>
                  <p>
                    You agree not to use the service in violation of applicable laws or third-party service provider guidelines.
                  </p>
                </>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="cursor-pointer rounded-xl bg-purple-600 hover:bg-purple-500 px-4 py-2 text-xs font-bold text-white transition-all shadow"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  )
}
