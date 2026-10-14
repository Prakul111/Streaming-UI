import { Link } from "react-router"
import { ArrowLeft, Home, Film } from "lucide-react"

export default function ErrorPage() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 sm:px-6 text-center text-foreground selection:bg-purple-500/30 selection:text-purple-200">
      <div className="relative flex flex-col items-center max-w-md">
        {/* Film / Popcorn background decoration */}
        <div className="absolute -top-16 opacity-10 animate-pulse">
          <Film className="size-28 sm:size-36 text-purple-400" />
        </div>

        {/* Big 404 text */}
        <h1 className="text-7xl sm:text-8xl md:text-9xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-500 drop-shadow-[0_0_50px_rgba(168,85,247,0.3)] animate-bounce duration-1000">
          404
        </h1>

        {/* Caption */}
        <h2 className="mt-6 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Lost in the cinematic void
        </h2>
        
        <p className="mt-4 text-sm md:text-base text-muted-foreground/80 leading-relaxed max-w-sm">
          The page you are looking for has either been deleted, moved, or never existed in our database. Let's get you back on track!
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full justify-center">
          <Link
            to="/"
            className="cursor-pointer flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 hover:scale-105 transition-all active:scale-95"
          >
            <Home className="size-4" />
            Go back Home
          </Link>

          <button
            onClick={() => window.history.back()}
            className="cursor-pointer flex items-center justify-center gap-2 rounded-full border border-border/80 bg-muted/40 hover:bg-muted/70 text-foreground px-6 py-3 text-sm font-semibold hover:scale-105 transition-all active:scale-95"
          >
            <ArrowLeft className="size-4" />
            Previous Page
          </button>
        </div>
      </div>
    </div>
  )
}
