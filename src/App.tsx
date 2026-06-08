import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { createBrowserRouter, Outlet } from "react-router"
import { RouterProvider } from "react-router/dom"
import HomePage from "./components/pages/HomePage"
import ErrorPage from "./components/pages/ErrorPage"
import MovieDetails from "./components/pages/MovieDetails"
import TvDetails from "./components/pages/TvDetails"
import Navbar from "./components/navbar"

const queryClient = new QueryClient()

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navbar />,
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "/movie-details",
        element: <MovieDetails />,
      },
      {
        path: "/tv-details",
        element: <TvDetails />,
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
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export default App
