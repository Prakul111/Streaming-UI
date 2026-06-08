import { useEffect, useState } from "react"
import { Button } from "@base-ui/react/button"
import { NavLink, Outlet, useNavigate } from "react-router"
import { ModeToggle } from "./mode-toggle"
import { Field } from "@base-ui/react/field"
import { Input } from "./ui/input"

export default function Navbar() {
  const navigate = useNavigate()
  const [isScrolled, setIsScrolled] = useState(false)

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
    <div className="-screen bg-background p-4 text-foreground">
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
            <h2 className="text-lg font-bold tracking-tight">Streaming UI</h2>
          </NavLink>
        </div>
        <div>
          <Field.Root className="flex items-center gap-2">
            <Input type="search" placeholder="Search..." />
            <Button className="cursor-pointer rounded-md border border-border px-3 py-1.5 text-sm font-medium transition hover:bg-gray-500/45">
              Search
            </Button>
          </Field.Root>
        </div>

        <div className="flex items-center gap-2">
          <Button
            className="cursor-pointer rounded-md p-2 text-sm font-medium transition transform-3d hover:bg-gray-500/25"
            onClick={() => {
              navigate("/movie-details")
            }}
          >
            Movie
          </Button>
          <Button
            className="cursor-pointer rounded-md p-2 text-sm font-medium transition transform-3d hover:bg-gray-500/45"
            onClick={() => {
              navigate("/tv-details")
            }}
          >
            Tv Details
          </Button>
          <ModeToggle />
        </div>
      </header>

      {/* Page Content */}
      <main className="px-6 pt-20">
        <Outlet />
      </main>
    </div>
  )
}
