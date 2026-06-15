import { useEffect, useState } from "react"
import { Button } from "@base-ui/react/button"
import { NavLink, Outlet, useNavigate } from "react-router"
import { Field } from "@base-ui/react/field"
import { Input } from "./ui/input"
import { AnimatedThemeToggler } from "./ui/animated-theme-toggler"
import { SparklesText } from "./ui/sparkles-text"
import { Menu, X, Search } from "lucide-react"
import NavigationMenuDemo from "./shadcn-studio/navigation-menu/navigation-menu-09"
import popcornLogo from "@/assets/popcorn-svgrepo-com.svg"

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const navigate = useNavigate()

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setIsMobileSearchOpen(false)
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
        className={`fixed top-0 right-0 left-0 z-50 flex items-center justify-between px-6 py-4 transition-all duration-300 ${
          isScrolled || isMobileMenuOpen || isMobileSearchOpen
            ? "border-b border-border/40 bg-background/85 shadow-sm backdrop-blur-md"
            : "border-b border-transparent bg-transparent"
        }`}
      >
        <div className="flex items-center gap-x-1">
          <NavLink to="/">
            <img
              className="h-6"
              src={popcornLogo}
              alt="Streaming UI Logo"
            />
          </NavLink>
          <NavLink to="/">
            <SparklesText
              sparklesCount={5}
              className="text-lg font-bold tracking-tight"
            >
              Streaming UI
            </SparklesText>
          </NavLink>
        </div>

        {/* Desktop Search */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center justify-center pl-8">
          <Field.Root className="flex items-center justify-center gap-2">
            <Input
              className="rounded-md"
              type="search"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button type="submit" className="cursor-pointer rounded-md border border-border px-3 py-2 text-sm font-medium transition hover:bg-gray-500/45">
              Search
            </Button>
          </Field.Root>
        </form>

        <div className="flex items-center gap-2">
          {/* Mobile Search Toggle Button */}
          <button
            onClick={() => {
              setIsMobileSearchOpen(!isMobileSearchOpen)
              setIsMobileMenuOpen(false)
            }}
            className="md:hidden cursor-pointer flex items-center justify-center rounded-full p-2 text-foreground hover:bg-muted/50 transition-colors"
            title="Search"
          >
            <Search className="size-5" />
          </button>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center">
            <NavigationMenuDemo />
          </div>

          <AnimatedThemeToggler
            className="rounded-full bg-gray-500/15 p-2 transition hover:bg-gray-500/30"
            variant="circle"
            duration={400}
          />

          {/* Mobile Menu Hamburger Button */}
          <button
            onClick={() => {
              setIsMobileMenuOpen(!isMobileMenuOpen)
              setIsMobileSearchOpen(false)
            }}
            className="md:hidden cursor-pointer flex items-center justify-center rounded-full p-2 text-foreground hover:bg-muted/50 transition-colors"
            title="Menu"
          >
            {isMobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Search Dropdown */}
      {isMobileSearchOpen && (
        <div className="fixed top-[69px] left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-b border-border/40 p-4 md:hidden animate-in slide-in-from-top duration-300">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 max-w-xl mx-auto">
            <Input
              className="w-full rounded-md"
              type="search"
              placeholder="Search for movies or shows..."
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button type="submit" className="cursor-pointer rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-muted/50 transition-colors">
              Search
            </Button>
          </form>
        </div>
      )}

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-[69px] z-40 flex flex-col bg-background/95 backdrop-blur-lg border-t border-border/40 p-6 md:hidden overflow-y-auto animate-in fade-in duration-300">
          <nav className="flex flex-col space-y-6 max-w-xl mx-auto w-full pb-10">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Movies</h3>
              <ul className="space-y-3 pl-2">
                <li>
                  <NavLink to="/now-playing-movie" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-foreground hover:text-purple-500 transition-colors">
                    Now Playing
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/popular-movie" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-foreground hover:text-purple-500 transition-colors">
                    Popular
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/top-rated-movie" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-foreground hover:text-purple-500 transition-colors">
                    Top Rated
                  </NavLink>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">TV Shows</h3>
              <ul className="space-y-3 pl-2">
                <li>
                  <NavLink to="/popular-tv" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-foreground hover:text-purple-500 transition-colors">
                    Popular TV Shows
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/top-rated-tv" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-foreground hover:text-purple-500 transition-colors">
                    Top Rated TV Shows
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/airing-today-tv" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-foreground hover:text-purple-500 transition-colors">
                    Airing Today
                  </NavLink>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Trending</h3>
              <ul className="space-y-3 pl-2">
                <li>
                  <NavLink to="/trending-all" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-foreground hover:text-purple-500 transition-colors">
                    Trending All
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/trending-movie" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-foreground hover:text-purple-500 transition-colors">
                    Trending Movies
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/trending-tv" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-foreground hover:text-purple-500 transition-colors">
                    Trending TV Shows
                  </NavLink>
                </li>
              </ul>
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
