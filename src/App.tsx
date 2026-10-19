import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { createBrowserRouter, RouterProvider, Outlet, ScrollRestoration } from "react-router"
import HomePage from "./components/pages/HomePage"
import ErrorPage from "./components/pages/ErrorPage"
import MovieDetails from "./components/pages/MovieDetails"
import TvDetails from "./components/pages/TvDetails"
import Navbar from "./components/navbar"
import { ThemeProvider } from "./components/theme-provider"
import Movie from "./components/pages/movie/Movie"
import TvShows from "./components/pages/tv-show/TvShows"
import TrendingAll from "./components/pages/TrendingAll"
import TrendingMovie from "./components/pages/movie/TrendingMovie"
import TrendingTv from "./components/pages/tv-show/TrendingTv"
import SearchPage from "./components/pages/SearchPage"
import People from "./components/pages/people/People"
import PersonDetails from "./components/pages/PersonDetails"
import Footer from "./components/footer"

const queryClient = new QueryClient()

function RootLayout() {
  return (
    <div className="bg-background text-foreground min-h-screen flex flex-col selection:bg-purple-500/30 selection:text-purple-200">
      <ScrollRestoration />
      <Navbar />
      <main className="w-full flex-grow flex flex-col">
        <Outlet />
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
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ThemeProvider>
  )
}

export default App
