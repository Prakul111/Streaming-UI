import { queryOptions } from "@tanstack/react-query"
import { tmdbFetch } from "./tmdb-client"

interface MovieListParams {
  page?: number
}

// 5 minutes stale time since movie/TV list data doesn't change rapidly
const DEFAULT_STALE_TIME = 1000 * 60 * 5

export function nowPlayingQuery(params: MovieListParams = {}) {
  const page = params.page ?? 1
  return queryOptions({
    queryKey: ["nowPlaying", { page }],
    queryFn: () => tmdbFetch<any>("movie/now_playing", { params: { page } }),
    staleTime: DEFAULT_STALE_TIME,
  })
}

export function popularMovieQuery(params: MovieListParams = {}) {
  const page = params.page ?? 1
  return queryOptions({
    queryKey: ["popularMovies", { page }],
    queryFn: () => tmdbFetch<any>("movie/popular", { params: { page } }),
    staleTime: DEFAULT_STALE_TIME,
  })
}

export function topRatedQuery(params: MovieListParams = {}) {
  const page = params.page ?? 1
  return queryOptions({
    queryKey: ["topRated", { page }],
    queryFn: () => tmdbFetch<any>("movie/top_rated", { params: { page } }),
    staleTime: DEFAULT_STALE_TIME,
  })
}

export function upcomingQuery(params: MovieListParams = {}) {
  const page = params.page ?? 1
  return queryOptions({
    queryKey: ["upcoming", { page }],
    queryFn: () => tmdbFetch<any>("movie/upcoming", { params: { page } }),
    staleTime: DEFAULT_STALE_TIME,
  })
}

export interface DiscoverMoviesParams {
  page?: number
  sortBy?: string
  withGenres?: string
  releaseDateGte?: string
  releaseDateLte?: string
}

export function discoverMoviesQuery(params: DiscoverMoviesParams = {}) {
  const page = params.page ?? 1
  const queryParams: Record<string, string | number | boolean> = {
    page,
    sort_by: params.sortBy ?? "popularity.desc",
  }

  if (params.withGenres) {
    queryParams.with_genres = params.withGenres
  }
  if (params.releaseDateGte) {
    queryParams["primary_release_date.gte"] = params.releaseDateGte
  }
  if (params.releaseDateLte) {
    queryParams["primary_release_date.lte"] = params.releaseDateLte
  }

  return queryOptions({
    queryKey: ["discoverMovies", params],
    queryFn: () => tmdbFetch<any>("discover/movie", { params: queryParams }),
    staleTime: DEFAULT_STALE_TIME,
  })
}

export function movieDetailsQuery(id: number) {
  return queryOptions({
    queryKey: ["movieDetails", id],
    queryFn: () => tmdbFetch<any>(`movie/${id}`),
    staleTime: DEFAULT_STALE_TIME,
  })
}

export function movieCreditsQuery(id: number) {
  return queryOptions({
    queryKey: ["movieCredits", id],
    queryFn: () => tmdbFetch<any>(`movie/${id}/credits`),
    staleTime: DEFAULT_STALE_TIME,
  })
}

export function movieVideosQuery(id: number) {
  return queryOptions({
    queryKey: ["movieVideos", id],
    queryFn: () => tmdbFetch<any>(`movie/${id}/videos`),
    staleTime: DEFAULT_STALE_TIME,
  })
}

export function movieRecommendationsQuery(id: number) {
  return queryOptions({
    queryKey: ["movieRecommendations", id],
    queryFn: () => tmdbFetch<any>(`movie/${id}/recommendations`),
    staleTime: DEFAULT_STALE_TIME,
  })
}

// // Now Playing ----------------------------------------------------------------

// export function nowPlayingQuery() {
//   return queryOptions({
//     queryKey: ["nowPlaying"],
//     queryFn: fetchNowPlaying,
//   })
// }

// const fetchNowPlaying = async function () {
//   const res = await fetch(
//     "https://api.themoviedb.org/3/movie/now_playing?language=en-US&page=1",
//     {
//       headers: {
//         Authorization: `Bearer ${import.meta.env.VITE_TMDB_API}`,
//       },
//     }
//   )
//   return await res.json()
// }

// // Popular ----------------------------------------------------------------------
// export function popularMovieQuery() {
//   return queryOptions({
//     queryKey: ["popularMovies"],
//     queryFn: fetchPopularMovie,
//   })
// }

// const fetchPopularMovie = async function () {
//   const res = await fetch(
//     "https://api.themoviedb.org/3/movie/popular?language=en-US&page=1",
//     {
//       headers: {
//         Authorization: `Bearer ${import.meta.env.VITE_TMDB_API}`,
//       },
//     }
//   )
//   return await res.json()
// }

// // Top Rated ----------------------------------------------------------------------

// export function topRatedQuery() {
//   return queryOptions({
//     queryKey: ["topRated"],
//     queryFn: fetchTopRated,
//   })
// }

// const fetchTopRated = async function () {
//   const res = await fetch(
//     "https://api.themoviedb.org/3/movie/top_rated?language=en-US&page=1",
//     {
//       headers: {
//         Authorization: `Bearer ${import.meta.env.VITE_TMDB_API}`,
//       },
//     }
//   )
//   return await res.json()
// }
// // upcoming -----------------------------------------------------------------------
// // https://api.themoviedb.org/3/movie/upcoming?language=en-US&page=1

// export function upcomingQuery() {
//   return queryOptions({
//     queryKey: ["upcoming"],
//     queryFn: fetchUpcoming,
//   })
// }

// const fetchUpcoming = async function () {
//   const res = await fetch(
//     "https://api.themoviedb.org/3/movie/upcoming?language=en-US&page=1",
//     {
//       headers: {
//         Authorization: `Bearer ${import.meta.env.VITE_TMDB_API}`,
//       },
//     }
//   )
//   return await res.json()
// }
