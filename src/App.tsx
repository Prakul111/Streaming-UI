import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { createBrowserRouter } from "react-router"
import { RouterProvider } from "react-router/dom"
import HomePage from "./components/pages/HomePage"
import ErrorPage from "./components/pages/ErrorPage"
import MovieDetails from "./components/pages/MovieDetails"
import TvDetails from "./components/pages/TvDetails"
import Navbar from "./components/navbar"
import { ThemeProvider } from "./components/theme-provider"
import PopularMovie from "./components/pages/movie/PopularMovie"
import TopRatedMovie from "./components/pages/movie/TopRatedMovie"
import PopularTv from "./components/pages/tv-show/PopularTv"
import TopRatedTv from "./components/pages/tv-show/TopRatedTv"
import NowPlayingMovie from "./components/pages/movie/NowPlayingMovie"
import AiringTodayTv from "./components/pages/tv-show/AiringTodayTv"
import TrendingAll from "./components/pages/TrendingAll"
import TrendingMovie from "./components/pages/movie/TrendingMovie"
import TrendingTv from "./components/pages/tv-show/TrendingTv"
import SearchPage from "./components/pages/SearchPage"
import Footer from "./components/footer"

const queryClient = new QueryClient()

const router = createBrowserRouter([
  {
    path: "/",
    element: [<Navbar />, <Footer />],
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
        path: "/tv-details/:id",
        element: <TvDetails />,
      },
      {
        path: "/now-playing-movie",
        element: <NowPlayingMovie />,
      },
      {
        path: "/popular-movie",
        element: <PopularMovie />,
      },
      {
        path: "/top-rated-movie",
        element: <TopRatedMovie />,
      },
      {
        path: "/popular-tv",
        element: <PopularTv />,
      },
      {
        path: "/top-rated-tv",
        element: <TopRatedTv />,
      },
      {
        path: "/airing-today-tv",
        element: <AiringTodayTv />,
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
        path: "*",
        element: <ErrorPage />,
      },
    ],
  },
])

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ThemeProvider>
  )
}

export default App
