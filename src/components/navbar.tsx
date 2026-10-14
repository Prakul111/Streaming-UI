import { useEffect, useState, useRef } from "react"
import { Button } from "@base-ui/react/button"
import { NavLink, Outlet, useNavigate, useLocation, useSearchParams } from "react-router"
import { Field } from "@base-ui/react/field"
import { Input } from "./ui/input"
import { AnimatedThemeToggler } from "./ui/animated-theme-toggler"
import { SparklesText } from "./ui/sparkles-text"
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
} from "lucide-react"
import NavigationMenuDemo from "./shadcn-studio/navigation-menu/navigation-menu-09"
import popcornLogo from "@/assets/popcorn-svgrepo-com.svg"
import { useDebounce } from "@/hooks/use-debounce"

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const [isInputFocused, setIsInputFocused] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()

  const isSearchPage = location.pathname === "/search"
  const urlQuery = isSearchPage ? searchParams.get("q") || "" : ""

  const [searchQuery, setSearchQuery] = useState(urlQuery)
  const [prevUrlQuery, setPrevUrlQuery] = useState(urlQuery)
  const [prevPathname, setPrevPathname] = useState(location.pathname)

  const isInitialMount = useRef(true)

  // Adjust state during render when URL query or pathname changes
  if (location.pathname !== prevPathname) {
    setPrevPathname(location.pathname)
    setPrevUrlQuery(urlQuery)
    setIsMobileMenuOpen(false)
    setIsMobileSearchOpen(false)
    if (location.pathname === "/search") {
      setSearchQuery(urlQuery)
    } else {
      setSearchQuery("")
    }
  } else if (urlQuery !== prevUrlQuery) {
    setPrevUrlQuery(urlQuery)
    if (!isInputFocused) {
      setSearchQuery(urlQuery)
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

  // Close mobile menu on Escape key press or desktop resize
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMobileMenuOpen(false)
        setIsMobileSearchOpen(false)
      }
    }
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
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

    const trimmed = debouncedQuery.trim()

    if (isSearchPage) {
      if (trimmed !== urlQuery) {
        if (trimmed) {
          navigate(`/search?q=${encodeURIComponent(trimmed)}`, { replace: true })
        } else {
          navigate("/search", { replace: true })
        }
      }
    } else {
      if (trimmed) {
        navigate(`/search?q=${encodeURIComponent(trimmed)}`)
      }
    }
  }, [debouncedQuery, isSearchPage, urlQuery, navigate])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = searchQuery.trim()
    if (trimmed) {
      navigate(`/search?q=${encodeURIComponent(trimmed)}`, {
        replace: isSearchPage,
      })
      setIsMobileSearchOpen(false)
      setIsMobileMenuOpen(false)
    }
  }

  const handleClearSearch = () => {
    setSearchQuery("")
    if (isSearchPage) {
      navigate("/search", { replace: true })
    }
  }

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="bg-background text-foreground min-h-screen flex flex-col">
      {/* Fixed Header */}
      <header
        className={`fixed top-0 right-0 left-0 z-50 flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 transition-all duration-300 ${
          isScrolled || isMobileMenuOpen || isMobileSearchOpen
            ? "border-b border-border/40 bg-background/85 shadow-sm backdrop-blur-md"
            : "border-b border-transparent bg-transparent"
        }`}
      >
        <div className="flex items-center gap-x-1 shrink-0">
          <NavLink to="/" onClick={() => setIsMobileMenuOpen(false)}>
            <img
              className="h-5 sm:h-6"
              src={popcornLogo}
              alt="Streaming UI Logo"
            />
          </NavLink>
          <NavLink to="/" onClick={() => setIsMobileMenuOpen(false)}>
            <SparklesText
              sparklesCount={2}
              className="text-base sm:text-lg font-bold tracking-tight"
            >
              Streaming UI
            </SparklesText>
          </NavLink>
        </div>

        {/* Desktop Search (lg+ screens) */}
        <form onSubmit={handleSearchSubmit} className="hidden lg:flex items-center justify-center pl-8">
          <Field.Root className="flex items-center justify-center gap-2">
            <div className="relative flex items-center">
              <Input
                className="rounded-md pr-8"
                type="search"
                placeholder="Search..."
                value={searchQuery}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-2 text-muted-foreground hover:text-foreground cursor-pointer p-0.5 rounded-full"
                  title="Clear search"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
            <Button type="submit" className="cursor-pointer rounded-md border border-border px-3 py-2 text-sm font-medium transition hover:bg-gray-500/45">
              Search
            </Button>
          </Field.Root>
        </form>

        <div className="flex items-center gap-2">
          {/* Mobile & Tablet Search Toggle Button */}
          <button
            onClick={() => {
              setIsMobileSearchOpen(!isMobileSearchOpen)
              setIsMobileMenuOpen(false)
            }}
            className="lg:hidden cursor-pointer flex items-center justify-center rounded-full p-2 text-foreground hover:bg-muted/50 transition-colors"
            title="Search"
            aria-label="Search"
          >
            <Search className="size-5" />
          </button>

          {/* Desktop Menu (lg+ screens) */}
          <div className="hidden lg:flex items-center">
            <NavigationMenuDemo />
          </div>

          <AnimatedThemeToggler
            className="rounded-full bg-gray-500/15 p-2 transition hover:bg-gray-500/30"
            variant="circle"
            duration={400}
          />

          {/* Mobile & Tablet Menu Hamburger Button */}
          <button
            onClick={() => {
              setIsMobileMenuOpen(!isMobileMenuOpen)
              setIsMobileSearchOpen(false)
            }}
            className="lg:hidden cursor-pointer flex items-center justify-center rounded-full p-2 text-foreground hover:bg-muted/50 transition-colors"
            title={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </header>

      {/* Mobile & Tablet Search Dropdown */}
      {isMobileSearchOpen && (
        <div className="fixed top-[57px] sm:top-[65px] left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-b border-border/40 p-4 lg:hidden animate-in slide-in-from-top duration-300">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 max-w-xl mx-auto">
            <div className="relative flex-1">
              <Input
                className="w-full rounded-md pr-8"
                type="search"
                placeholder="Search for movies or shows..."
                autoFocus
                value={searchQuery}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer p-0.5 rounded-full"
                  title="Clear search"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
            <Button type="submit" className="cursor-pointer rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-muted/50 transition-colors">
              Search
            </Button>
          </form>
        </div>
      )}

      {/* Mobile & Tablet Menu Drawer */}
      {isMobileMenuOpen && (
        <div
          id="mobile-tablet-menu"
          className="fixed inset-x-0 bottom-0 top-[57px] sm:top-[65px] z-40 flex flex-col bg-background/95 backdrop-blur-xl border-t border-border/40 overflow-y-auto lg:hidden animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <nav className="w-full max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-5 flex flex-col min-h-full justify-between pb-12">
            <div className="space-y-6">
              {/* Integrated Search Box */}
              <form onSubmit={handleSearchSubmit} className="relative w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                <Input
                  type="search"
                  placeholder="Search movies, TV shows, actors..."
                  value={searchQuery}
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={() => setIsInputFocused(false)}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-muted/40 border-border/50 text-sm focus:bg-background transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer p-0.5 rounded-full"
                    title="Clear search"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </form>

              {/* Quick Home Feed Link */}
              <NavLink
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-primary/10 text-primary border border-primary/25 font-semibold"
                      : "text-foreground hover:bg-muted/50 border border-transparent"
                  }`
                }
              >
                <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Home className="size-4" />
                </div>
                <div className="flex-1 font-medium">Home Feed</div>
                <ChevronRight className="size-4 text-muted-foreground/60" />
              </NavLink>

              {/* Quick Navigation Links */}
              <div className="flex flex-col space-y-1.5">
                <NavLink
                  to="/movie"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? "bg-purple-500/15 text-purple-400 font-semibold border border-purple-500/30"
                        : "text-foreground hover:bg-muted/50 border border-transparent"
                    }`
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

                <NavLink
                  to="/tv-shows"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? "bg-purple-500/15 text-purple-400 font-semibold border border-purple-500/30"
                        : "text-foreground hover:bg-muted/50 border border-transparent"
                    }`
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

                <NavLink
                  to="/people"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? "bg-purple-500/15 text-purple-400 font-semibold border border-purple-500/30"
                        : "text-foreground hover:bg-muted/50 border border-transparent"
                    }`
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
              <div className="flex flex-col space-y-2">
                  <div className="flex items-center gap-2 px-1 text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    <Flame className="size-3.5 text-amber-400" />
                    <span>Trending</span>
                  </div>
                  <div className="space-y-1">
                    <NavLink
                      to="/trending-all"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm transition-all ${
                          isActive
                            ? "bg-amber-500/15 text-amber-400 font-semibold border border-amber-500/30"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50 font-medium border border-transparent"
                        }`
                      }
                    >
                      <div className="flex items-center gap-2.5">
                        <TrendingUp className="size-3.5 text-muted-foreground" />
                        <span>All Trending</span>
                      </div>
                      <ChevronRight className="size-3.5 text-muted-foreground/50" />
                    </NavLink>

                    <NavLink
                      to="/trending-movie"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm transition-all ${
                          isActive
                            ? "bg-amber-500/15 text-amber-400 font-semibold border border-amber-500/30"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50 font-medium border border-transparent"
                        }`
                      }
                    >
                      <div className="flex items-center gap-2.5">
                        <Film className="size-3.5 text-muted-foreground" />
                        <span>Trending Movies</span>
                      </div>
                      <ChevronRight className="size-3.5 text-muted-foreground/50" />
                    </NavLink>

                    <NavLink
                      to="/trending-tv"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm transition-all ${
                          isActive
                            ? "bg-amber-500/15 text-amber-400 font-semibold border border-amber-500/30"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50 font-medium border border-transparent"
                        }`
                      }
                    >
                      <div className="flex items-center gap-2.5">
                        <Tv className="size-3.5 text-muted-foreground" />
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

      {/* Page Content */}
      <main className="w-full flex-grow flex flex-col">
        <Outlet />
      </main>
    </div>
  )
}
