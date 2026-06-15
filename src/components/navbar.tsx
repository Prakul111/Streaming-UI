import { useEffect, useState } from "react"
import { Button } from "@base-ui/react/button"
import { NavLink, Outlet, useNavigate } from "react-router"
import { Field } from "@base-ui/react/field"
import { Input } from "./ui/input"
import { AnimatedThemeToggler } from "./ui/animated-theme-toggler"
import { SparklesText } from "./ui/sparkles-text"
import NavigationMenuDemo from "./shadcn-studio/navigation-menu/navigation-menu-09"

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const navigate = useNavigate()

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
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
          isScrolled
            ? "border-b border-border/40 bg-background/80 shadow-sm backdrop-blur-md"
            : "border-b border-transparent bg-transparent"
        }`}
      >
        <div className="flex items-center gap-x-1">
          <NavLink
            to="/"
            // className="cursor-pointer rounded-md p-2 text-sm font-medium"
          >
            <img
              className="h-6"
              src="/src/assets/popcorn-svgrepo-com.svg"
            ></img>
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
        <form onSubmit={handleSearchSubmit} className="flex items-center justify-center pl-8">
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

        <div className="flex items-center justify-center">
          <NavigationMenuDemo />
          <AnimatedThemeToggler
            className="ml-4 rounded-full bg-gray-500/40 p-1.5"
            variant="circle"
            duration={400}
          />
        </div>
      </header>

      {/* Page Content */}
      <main className="w-full flex-grow flex flex-col">
        <Outlet />
      </main>
    </div>
  )
}
