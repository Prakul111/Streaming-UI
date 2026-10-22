import { lazy, Suspense } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { createBrowserRouter, RouterProvider, Outlet, ScrollRestoration } from "react-router"
import Navbar from "./components/navbar"
import { ThemeProvider } from "./components/theme-provider"
import Footer from "./components/footer"

// Lazy-loaded routes for code-splitting and fast initial page load
const HomePage = lazy(() => import("./components/pages/HomePage"))
const MovieDetails = lazy(() => import("./components/pages/MovieDetails"))
const TvDetails = lazy(() => import("./components/pages/TvDetails"))
const Movie = lazy(() => import("./components/pages/movie/Movie"))
const TvShows = lazy(() => import("./components/pages/tv-show/TvShows"))
const Anime = lazy(() => import("./components/pages/anime/Anime"))
const TrendingAll = lazy(() => import("./components/pages/TrendingAll"))
const TrendingMovie = lazy(() => import("./components/pages/movie/TrendingMovie"))
const TrendingTv = lazy(() => import("./components/pages/tv-show/TrendingTv"))
const SearchPage = lazy(() => import("./components/pages/SearchPage"))
const People = lazy(() => import("./components/pages/people/People"))
const PersonDetails = lazy(() => import("./components/pages/PersonDetails"))
const ErrorPage = lazy(() => import("./components/pages/ErrorPage"))

// DevTools dynamically imported only in development
const ReactQueryDevtools = import.meta.env.DEV
  ? lazy(() =>
      import("@tanstack/react-query-devtools").then((mod) => ({
        default: mod.ReactQueryDevtools,
      }))
    )
  : () => null

// High-performance query client configuration:
// Cache API data for 5 minutes fresh, 30 minutes in memory; disable window focus refetch storm
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: 1,
    },
  },
})

function PageFallback() {
  return (
    <div className="w-full flex-1 min-h-[70vh] flex flex-col items-center justify-center p-6 gap-3">
      <div className="size-9 rounded-full border-2 border-purple-500/20 border-t-purple-500 animate-spin" />
      <span className="text-xs font-semibold text-muted-foreground animate-pulse tracking-wide">
        Loading...
      </span>
    </div>
  )
}

function RootLayout() {
  return (
    <div className="bg-background text-foreground min-h-screen flex flex-col selection:bg-purple-500/30 selection:text-purple-200">
      <ScrollRestoration />
      <Navbar />
      <main className="w-full flex-grow flex flex-col">
        <Suspense fallback={<PageFallback />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "/movie-details/:id",
        element: <MovieDetails />,
      },
      {
        path: "/movie/:id",
        element: <MovieDetails />,
      },
      {
        path: "/tv-details/:id",
        element: <TvDetails />,
      },
      {
        path: "/tv/:id",
        element: <TvDetails />,
      },
      {
        path: "/movie",
        element: <Movie />,
      },
      {
        path: "/now-playing-movie",
        element: <Movie />,
      },
      {
        path: "/popular-movie",
        element: <Movie />,
      },
      {
        path: "/top-rated-movie",
        element: <Movie />,
      },
      {
        path: "/tv-shows",
        element: <TvShows />,
      },
      {
        path: "/popular-tv",
        element: <TvShows />,
      },
      {
        path: "/top-rated-tv",
        element: <TvShows />,
      },
      {
        path: "/airing-today-tv",
        element: <TvShows />,
      },
      {
        path: "/anime",
        element: <Anime />,
      },
      {
        path: "/popular-anime",
        element: <Anime />,
      },
      {
        path: "/top-rated-anime",
        element: <Anime />,
      },
      {
        path: "/trending-all",
        element: <TrendingAll />,
      },
      {
        path: "/trending-movie",
        element: <TrendingMovie />,
      },
      {
        path: "/trending-tv",
        element: <TrendingTv />,
      },
      {
        path: "/search",
        element: <SearchPage />,
      },
      {
        path: "/people",
        element: <People />,
      },
      {
        path: "/person/:id",
        element: <PersonDetails />,
      },
      {
        path: "/person-details/:id",
        element: <PersonDetails />,
      },
      {
        path: "/people/:id",
        element: <PersonDetails />,
      },
      {
        path: "*",
        element: <ErrorPage />,
      },
    ],
  },
])

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="theme">
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        {import.meta.env.DEV && (
          <Suspense fallback={null}>
            <ReactQueryDevtools initialIsOpen={false} />
          </Suspense>
        )}
      </QueryClientProvider>
    </ThemeProvider>
  )
}

export default App
