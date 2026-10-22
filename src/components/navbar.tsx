import { useEffect, useState, useRef } from "react"
import { NavLink, useNavigate, useLocation, useSearchParams } from "react-router"
import { AnimatedThemeToggler } from "./ui/animated-theme-toggler"
import { SparklesText } from "./ui/sparkles-text"
import { SearchBar } from "./ui/search-bar"
import {
  Menu,
  X,
  Search,
  Film,
  Tv,
  Flame,
  TrendingUp,
  Home,
  ChevronRight,
  Users,
  Sparkles,
} from "lucide-react"
import NavigationMenuDemo from "./shadcn-studio/navigation-menu/navigation-menu-09"
import popcornLogo from "@/assets/popcorn-svgrepo-com.svg"
import { useDebounce } from "@/hooks/use-debounce"
import { cn } from "@/lib/utils"

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const [isInputFocused, setIsInputFocused] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()

  const isSearchPage = location.pathname === "/search"
  const urlQuery = isSearchPage ? searchParams.get("q") || "" : ""

  const [searchQuery, setSearchQuery] = useState(urlQuery)
  const [prevUrlQuery, setPrevUrlQuery] = useState(urlQuery)
  const [prevPathname, setPrevPathname] = useState(location.pathname)
  const isInitialMount = useRef(true)
  const lastNavigatedQueryRef = useRef(urlQuery)

  // Adjust state during render when URL query or pathname changes
  if (location.pathname !== prevPathname) {
    setPrevPathname(location.pathname)
    setPrevUrlQuery(urlQuery)
    setIsInputFocused(false)
    setIsMobileMenuOpen(false)
    setIsMobileSearchOpen(false)
    if (location.pathname === "/search") {
      setSearchQuery(urlQuery)
      lastNavigatedQueryRef.current = urlQuery
    } else {
      setSearchQuery("")
      lastNavigatedQueryRef.current = ""
    }
  } else if (urlQuery !== prevUrlQuery) {
    setPrevUrlQuery(urlQuery)
    if (!isInputFocused) {
      setSearchQuery(urlQuery)
      lastNavigatedQueryRef.current = urlQuery
    }
  }

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isMobileMenuOpen])

  // Global keyboard shortcuts (Cmd+K / Ctrl+K) and Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMobileMenuOpen(false)
        setIsMobileSearchOpen(false)
        setIsInputFocused(false)
        searchInputRef.current?.blur()
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        if (window.innerWidth < 768) {
          setIsMobileSearchOpen(true)
        } else {
          searchInputRef.current?.focus()
        }
      }
    }

    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false)
        setIsMobileSearchOpen(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  const debouncedQuery = useDebounce(searchQuery, 400)

  // React to debounced query changes
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }

    // Only auto-navigate if the user is actively typing into the search input
    if (!isInputFocused) {
      return
    }

    const trimmed = debouncedQuery.trim()

    // Prevent redundant navigation if query hasn't changed
    if (trimmed === lastNavigatedQueryRef.current) {
      return
    }

    if (isSearchPage) {
      if (trimmed !== urlQuery) {
        lastNavigatedQueryRef.current = trimmed
        if (trimmed) {
          navigate(`/search?q=${encodeURIComponent(trimmed)}`, { replace: true })
        } else {
          navigate("/search", { replace: true })
        }
      }
    } else {
      if (trimmed) {
        lastNavigatedQueryRef.current = trimmed
        navigate(`/search?q=${encodeURIComponent(trimmed)}`)
      }
    }
  }, [debouncedQuery, isSearchPage, urlQuery, isInputFocused, navigate])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsInputFocused(false)
    searchInputRef.current?.blur()
    const trimmed = searchQuery.trim()
    lastNavigatedQueryRef.current = trimmed
    if (trimmed) {
      navigate(`/search?q=${encodeURIComponent(trimmed)}`, {
        replace: isSearchPage,
      })
    } else {
      navigate("/search")
    }
    setIsMobileSearchOpen(false)
    setIsMobileMenuOpen(false)
  }

  const handleClearSearch = () => {
    setSearchQuery("")
    lastNavigatedQueryRef.current = ""
    if (isSearchPage) {
      navigate("/search", { replace: true })
    }
  }

  // Handle scroll detection for dynamic glassmorphic elevation
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <>
      {/* Fixed Header */}
      <header
        className={cn(
          "fixed top-0 inset-x-0 z-50 transition-all duration-300",
          isScrolled || isMobileMenuOpen || isMobileSearchOpen
            ? "bg-background/80 shadow-lg shadow-black/10 backdrop-blur-xl"
            : "bg-transparent"
        )}
      >
        <div className="mx-auto flex h-16 sm:h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Left Cluster: Logo & Desktop Navigation */}
          <div className="flex items-center gap-6 xl:gap-8">
            {/* Brand Logo */}
            <NavLink
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="group flex items-center gap-2.5 transition-transform duration-200 hover:scale-[1.02]"
            >
              <div className="relative flex size-9 sm:size-10 items-center justify-center rounded-xl bg-purple-500/15 border border-purple-500/25 shadow-sm shadow-purple-500/10 group-hover:border-purple-500/40 group-hover:bg-purple-500/20 transition-all">
                <img
                  className="h-5 sm:h-6 w-auto transition-transform duration-300 group-hover:scale-110"
                  src={popcornLogo}
                  alt="Streaming UI Logo"
                />
              </div>
              <SparklesText
                sparklesCount={2}
                className="text-lg sm:text-xl font-black tracking-tight"
              >
                Streaming UI
              </SparklesText>
            </NavLink>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center">
              <NavigationMenuDemo />
            </div>
          </div>

          {/* Right Cluster: Desktop Search Bar + Theme Toggler + Mobile Triggers */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Desktop Search Bar (md+ screens) */}
            <div className="hidden md:block w-48 lg:w-64 xl:w-72">
              <SearchBar
                inputRef={searchInputRef}
                value={searchQuery}
                onChange={setSearchQuery}
                onSubmit={handleSearchSubmit}
                onClear={handleClearSearch}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
                placeholder="Search movies, shows..."
                size="sm"
                shortcutKey="⌘K"
              />
            </div>

            {/* Mobile & Tablet Search Toggle Button */}
            <button
              onClick={() => {
                setIsMobileSearchOpen(!isMobileSearchOpen)
                setIsMobileMenuOpen(false)
              }}
              className="md:hidden cursor-pointer flex size-10 items-center justify-center rounded-full border border-border/40 dark:border-white/10 bg-muted/30 dark:bg-white/5 hover:bg-muted/60 dark:hover:bg-white/15 text-foreground backdrop-blur-md transition-colors"
              title="Search"
              aria-label="Search"
            >
              <Search className="size-4.5" />
            </button>

            {/* Theme Toggler */}
            <div className="flex items-center justify-center size-10 rounded-full border border-border/40 dark:border-white/10 bg-muted/30 dark:bg-white/5 hover:bg-muted/60 dark:hover:bg-white/15 backdrop-blur-md transition-all">
              <AnimatedThemeToggler
                className="p-2 transition text-foreground"
                variant="circle"
                duration={400}
              />
            </div>

            {/* Mobile & Tablet Menu Hamburger Button */}
            <button
              onClick={() => {
                setIsMobileMenuOpen(!isMobileMenuOpen)
                setIsMobileSearchOpen(false)
              }}
              className="md:hidden cursor-pointer flex size-10 items-center justify-center rounded-full border border-border/40 dark:border-white/10 bg-muted/30 dark:bg-white/5 hover:bg-muted/60 dark:hover:bg-white/15 text-foreground backdrop-blur-md transition-colors"
              title={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="size-5" />
              ) : (
                <Menu className="size-5" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile & Tablet Search Dropdown */}
      {isMobileSearchOpen && (
        <div className="fixed top-16 sm:top-18 left-0 right-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border/40 p-4 md:hidden animate-in slide-in-from-top duration-300 shadow-xl">
          <div className="max-w-xl mx-auto">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onSubmit={handleSearchSubmit}
              onClear={handleClearSearch}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              placeholder="Search movies, TV shows, actors..."
              size="md"
              autoFocus
            />
          </div>
        </div>
      )}

      {/* Mobile & Tablet Menu Drawer */}
      {isMobileMenuOpen && (
        <div
          id="mobile-tablet-menu"
          className="fixed inset-x-0 bottom-0 top-16 sm:top-18 z-40 flex flex-col bg-background/95 backdrop-blur-2xl border-t border-border/40 overflow-y-auto md:hidden animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <nav className="w-full max-w-lg mx-auto px-4 sm:px-6 py-6 flex flex-col min-h-full justify-between pb-12">
            <div className="space-y-6">
              {/* Integrated Search Box */}
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                onSubmit={handleSearchSubmit}
                onClear={handleClearSearch}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
                placeholder="Search movies, shows, anime..."
                size="md"
              />

              {/* Navigation Links */}
              <div className="flex flex-col space-y-1.5">
                {/* Home */}
                <NavLink
                  to="/"
                  end
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all",
                      isActive
                        ? "bg-purple-500/15 text-purple-400 font-semibold border border-purple-500/30"
                        : "text-foreground hover:bg-muted/50 border border-transparent"
                    )
                  }
                >
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                      <Home className="size-4" />
                    </div>
                    <span className="font-medium">Home</span>
                  </div>
                  <ChevronRight className="size-4 text-muted-foreground/60" />
                </NavLink>

                {/* Movies */}
                <NavLink
                  to="/movie"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all",
                      isActive
                        ? "bg-purple-500/15 text-purple-400 font-semibold border border-purple-500/30"
                        : "text-foreground hover:bg-muted/50 border border-transparent"
                    )
                  }
                >
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                      <Film className="size-4" />
                    </div>
                    <span className="font-medium">Movies</span>
                  </div>
                  <ChevronRight className="size-4 text-muted-foreground/60" />
                </NavLink>

                {/* TV Shows */}
                <NavLink
                  to="/tv-shows"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all",
                      isActive
                        ? "bg-purple-500/15 text-purple-400 font-semibold border border-purple-500/30"
                        : "text-foreground hover:bg-muted/50 border border-transparent"
                    )
                  }
                >
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                      <Tv className="size-4" />
                    </div>
                    <span className="font-medium">TV Shows</span>
                  </div>
                  <ChevronRight className="size-4 text-muted-foreground/60" />
                </NavLink>

                {/* Anime */}
                <NavLink
                  to="/anime"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all",
                      isActive
                        ? "bg-purple-500/15 text-purple-400 font-semibold border border-purple-500/30"
                        : "text-foreground hover:bg-muted/50 border border-transparent"
                    )
                  }
                >
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                      <Sparkles className="size-4" />
                    </div>
                    <span className="font-medium">Anime</span>
                  </div>
                  <ChevronRight className="size-4 text-muted-foreground/60" />
                </NavLink>

                {/* People */}
                <NavLink
                  to="/people"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all",
                      isActive
                        ? "bg-purple-500/15 text-purple-400 font-semibold border border-purple-500/30"
                        : "text-foreground hover:bg-muted/50 border border-transparent"
                    )
                  }
                >
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                      <Users className="size-4" />
                    </div>
                    <span className="font-medium">People</span>
                  </div>
                  <ChevronRight className="size-4 text-muted-foreground/60" />
                </NavLink>
              </div>

              {/* Trending Section */}
              <div className="flex flex-col space-y-2 pt-2 border-t border-border/30">
                <div className="flex items-center gap-2 px-1 text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  <Flame className="size-3.5 text-amber-400" />
                  <span>Trending</span>
                </div>
                <div className="space-y-1">
                  <NavLink
                    to="/trending-all"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm transition-all",
                        isActive
                          ? "bg-amber-500/15 text-amber-400 font-semibold border border-amber-500/30"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50 font-medium border border-transparent"
                      )
                    }
                  >
                    <div className="flex items-center gap-2.5">
                      <TrendingUp className="size-3.5 text-amber-400" />
                      <span>All Trending</span>
                    </div>
                    <ChevronRight className="size-3.5 text-muted-foreground/50" />
                  </NavLink>

                  <NavLink
                    to="/trending-movie"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm transition-all",
                        isActive
                          ? "bg-rose-500/15 text-rose-400 font-semibold border border-rose-500/30"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50 font-medium border border-transparent"
                      )
                    }
                  >
                    <div className="flex items-center gap-2.5">
                      <Film className="size-3.5 text-rose-400" />
                      <span>Trending Movies</span>
                    </div>
                    <ChevronRight className="size-3.5 text-muted-foreground/50" />
                  </NavLink>

                  <NavLink
                    to="/trending-tv"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm transition-all",
                        isActive
                          ? "bg-sky-500/15 text-sky-400 font-semibold border border-sky-500/30"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50 font-medium border border-transparent"
                      )
                    }
                  >
                    <div className="flex items-center gap-2.5">
                      <Tv className="size-3.5 text-sky-400" />
                      <span>Trending TV Shows</span>
                    </div>
                    <ChevronRight className="size-3.5 text-muted-foreground/50" />
                  </NavLink>
                </div>
              </div>
            </div>

            {/* Bottom Drawer Footer */}
            <div className="mt-8 pt-4 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
              <span>Streaming UI • TMDB</span>
              <div className="flex items-center gap-2">
                <span>Theme</span>
                <AnimatedThemeToggler
                  className="rounded-full bg-muted/60 p-1.5 hover:bg-muted transition"
                  variant="circle"
                  duration={400}
                />
              </div>
            </div>
          </nav>
        </div>
      )}
    </>
  )
}
