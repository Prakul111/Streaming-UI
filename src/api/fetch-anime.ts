import { queryOptions } from "@tanstack/react-query"
import { tmdbFetch } from "./tmdb-client"

export interface AnimeItem {
  id: number
  title?: string
  name?: string
  poster_path: string | null
  backdrop_path?: string | null
  vote_average: number
  release_date?: string
  first_air_date?: string
  overview?: string
  genre_ids?: number[]
  popularity?: number
  media_type?: "movie" | "tv"
}

export interface AnimeApiResponse {
  page: number
  results: AnimeItem[]
  total_pages: number
  total_results: number
}

const DEFAULT_STALE_TIME = 1000 * 60 * 5

export interface DiscoverAnimeParams {
  page?: number
  sortBy?: string
  format?: "all" | "tv" | "movie"
  withGenres?: string
  airDateGte?: string
  airDateLte?: string
  firstAirDateGte?: string
  firstAirDateLte?: string
  releaseDateGte?: string
  releaseDateLte?: string
  voteAverageGte?: number
  voteCountGte?: number
  voteCountLte?: number
  withWatchProviders?: string
  withWatchMonetizationTypes?: string
  watchRegion?: string
}

export function discoverAnimeQuery(params: DiscoverAnimeParams = {}) {
  const page = params.page ?? 1
  const format = params.format ?? "all"
  const sortBy = params.sortBy ?? "popularity.desc"

  return queryOptions<AnimeApiResponse>({
    queryKey: ["discoverAnime", { ...params, page, format, sortBy }],
    queryFn: async () => {
      // Base TV params
      const tvParams: Record<string, string | number | boolean> = {
        page,
        sort_by: sortBy,
        with_genres: params.withGenres ? `16,${params.withGenres}` : "16",
        with_original_language: "ja",
      }

      // Base Movie params
      const movieParams: Record<string, string | number | boolean> = {
        page,
        sort_by: sortBy,
        with_genres: params.withGenres ? `16,${params.withGenres}` : "16",
        with_original_language: "ja",
      }

      if (params.airDateGte) {
        tvParams["air_date.gte"] = params.airDateGte
      }
      if (params.airDateLte) {
        tvParams["air_date.lte"] = params.airDateLte
      }
      if (params.firstAirDateGte) {
        tvParams["first_air_date.gte"] = params.firstAirDateGte
      }
      if (params.firstAirDateLte) {
        tvParams["first_air_date.lte"] = params.firstAirDateLte
      }
      if (params.releaseDateGte) {
        movieParams["primary_release_date.gte"] = params.releaseDateGte
      }
      if (params.releaseDateLte) {
        movieParams["primary_release_date.lte"] = params.releaseDateLte
      }
      if (params.voteAverageGte !== undefined) {
        tvParams["vote_average.gte"] = params.voteAverageGte
        movieParams["vote_average.gte"] = params.voteAverageGte
      }
      if (params.voteCountGte !== undefined) {
        tvParams["vote_count.gte"] = params.voteCountGte
        movieParams["vote_count.gte"] = params.voteCountGte
      }
      if (params.voteCountLte !== undefined) {
        tvParams["vote_count.lte"] = params.voteCountLte
        movieParams["vote_count.lte"] = params.voteCountLte
      }
      if (params.watchRegion) {
        tvParams.watch_region = params.watchRegion
        movieParams.watch_region = params.watchRegion
      }
      if (params.withWatchProviders) {
        tvParams.with_watch_providers = params.withWatchProviders
        movieParams.with_watch_providers = params.withWatchProviders
      }
      if (params.withWatchMonetizationTypes) {
        tvParams.with_watch_monetization_types = params.withWatchMonetizationTypes
        movieParams.with_watch_monetization_types = params.withWatchMonetizationTypes
      }

      if (format === "tv") {
        const data = await tmdbFetch<any>("discover/tv", { params: tvParams })
        return {
          page: data.page,
          total_pages: data.total_pages,
          total_results: data.total_results,
          results: (data.results || []).map((x: any) => ({
            ...x,
            title: x.name,
            release_date: x.first_air_date,
            media_type: "tv" as const,
          })),
        }
      }

      if (format === "movie") {
        const data = await tmdbFetch<any>("discover/movie", { params: movieParams })
        return {
          page: data.page,
          total_pages: data.total_pages,
          total_results: data.total_results,
          results: (data.results || []).map((x: any) => ({
            ...x,
            media_type: "movie" as const,
          })),
        }
      }

      // Format === "all": Fetch both TV anime and Movie anime, then combine
      const [tvData, movieData] = await Promise.all([
        tmdbFetch<any>("discover/tv", { params: tvParams }).catch(() => ({ results: [], total_pages: 1, total_results: 0 })),
        tmdbFetch<any>("discover/movie", { params: movieParams }).catch(() => ({ results: [], total_pages: 1, total_results: 0 })),
      ])

      const tvResults: AnimeItem[] = (tvData.results || []).map((x: any) => ({
        ...x,
        title: x.name,
        release_date: x.first_air_date,
        media_type: "tv" as const,
      }))

      const movieResults: AnimeItem[] = (movieData.results || []).map((x: any) => ({
        ...x,
        media_type: "movie" as const,
      }))

      // Combine and sort by chosen criteria
      const combined = [...tvResults, ...movieResults]

      if (sortBy === "popularity.asc") {
        combined.sort((a, b) => (a.popularity || 0) - (b.popularity || 0))
      } else if (sortBy === "vote_average.desc") {
        combined.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0))
      } else if (sortBy === "vote_average.asc") {
        combined.sort((a, b) => (a.vote_average || 0) - (b.vote_average || 0))
      } else if (sortBy.includes("date.desc")) {
        combined.sort(
          (a, b) =>
            new Date(b.release_date || b.first_air_date || 0).getTime() -
            new Date(a.release_date || a.first_air_date || 0).getTime()
        )
      } else if (sortBy.includes("date.asc")) {
        combined.sort(
          (a, b) =>
            new Date(a.release_date || a.first_air_date || 0).getTime() -
            new Date(b.release_date || b.first_air_date || 0).getTime()
        )
      } else {
        // Default: popularity.desc
        combined.sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
      }

      return {
        page,
        total_pages: Math.max(tvData.total_pages || 1, movieData.total_pages || 1),
        total_results: (tvData.total_results || 0) + (movieData.total_results || 0),
        results: combined.slice(0, 20),
      }
    },
    staleTime: DEFAULT_STALE_TIME,
  })
}

export function searchAnimeQuery(query: string, page: number = 1) {
  return queryOptions<AnimeApiResponse>({
    queryKey: ["searchAnime", { query, page }],
    queryFn: async () => {
      if (!query.trim()) {
        return { page: 1, results: [], total_pages: 1, total_results: 0 }
      }

      // Search multi so both Anime TV and Anime Movies are returned
      const data = await tmdbFetch<any>("search/multi", {
        params: { query, page },
      })

      // Prioritize anime/animation items, but keep relevant media
      const rawResults = data.results || []
      const results: AnimeItem[] = rawResults
        .filter((item: any) => item.media_type === "tv" || item.media_type === "movie")
        .map((x: any) => ({
          ...x,
          title: x.title || x.name,
          release_date: x.release_date || x.first_air_date,
          media_type: (x.media_type || (x.name ? "tv" : "movie")) as "movie" | "tv",
        }))
        // Boost animation or Japanese items towards the top
        .sort((a: any, b: any) => {
          const aIsAnime = (a.genre_ids?.includes(16) || a.original_language === "ja") ? 1 : 0
          const bIsAnime = (b.genre_ids?.includes(16) || b.original_language === "ja") ? 1 : 0
          if (aIsAnime !== bIsAnime) return bIsAnime - aIsAnime
          return (b.popularity || 0) - (a.popularity || 0)
        })

      return {
        page: data.page,
        total_pages: data.total_pages,
        total_results: data.total_results,
        results,
      }
    },
    staleTime: DEFAULT_STALE_TIME,
    enabled: !!query.trim(),
  })
}
