import { queryOptions } from "@tanstack/react-query"
import { tmdbFetch } from "./tmdb-client"

interface TvListParams {
  page?: number;
}

const DEFAULT_STALE_TIME = 1000 * 60 * 5;

export function popularTvQuery(params: TvListParams = {}) {
  const page = params.page ?? 1;
  return queryOptions({
    queryKey: ["popularTv", { page }],
    queryFn: () => tmdbFetch<any>("tv/popular", { params: { page } }),
    staleTime: DEFAULT_STALE_TIME,
  })
}

export function topRatedTvQuery(params: TvListParams = {}) {
  const page = params.page ?? 1;
  return queryOptions({
    queryKey: ["topRatedTv", { page }],
    queryFn: () => tmdbFetch<any>("tv/top_rated", { params: { page } }),
    staleTime: DEFAULT_STALE_TIME,
  })
}

export interface TvShowItem {
  id: number
  name: string
  poster_path: string | null
  vote_average: number
  vote_count?: number
  first_air_date?: string
  overview?: string
  backdrop_path?: string | null
}

export interface TvListResponse {
  page: number
  results: TvShowItem[]
  total_pages: number
  total_results: number
}

export interface DiscoverTvParams {
  page?: number
  sortBy?: string
  withGenres?: string
  airDateGte?: string
  airDateLte?: string
  firstAirDateGte?: string
  firstAirDateLte?: string
  voteCountGte?: number
  voteAverageGte?: number
  voteCountLte?: number
  watchRegion?: string
  withWatchProviders?: string
  withWatchMonetizationTypes?: string
}

export function discoverTvQuery(params: DiscoverTvParams = {}) {
  const page = params.page ?? 1
  const queryParams: Record<string, string | number | boolean> = {
    page,
    sort_by: params.sortBy ?? "popularity.desc",
  }

  if (params.withGenres) {
    queryParams.with_genres = params.withGenres
  }
  if (params.airDateGte) {
    queryParams["air_date.gte"] = params.airDateGte
  }
  if (params.airDateLte) {
    queryParams["air_date.lte"] = params.airDateLte
  }
  if (params.firstAirDateGte) {
    queryParams["first_air_date.gte"] = params.firstAirDateGte
  }
  if (params.firstAirDateLte) {
    queryParams["first_air_date.lte"] = params.firstAirDateLte
  }
  if (params.watchRegion) {
    queryParams.watch_region = params.watchRegion
  }
  if (params.withWatchProviders) {
    queryParams.with_watch_providers = params.withWatchProviders
  }
  if (params.withWatchMonetizationTypes) {
    queryParams.with_watch_monetization_types = params.withWatchMonetizationTypes
  }
  if (params.voteAverageGte !== undefined) {
    queryParams["vote_average.gte"] = params.voteAverageGte
  }
  if (params.voteCountGte !== undefined) {
    queryParams["vote_count.gte"] = params.voteCountGte
  } else if (params.sortBy?.startsWith("vote_average")) {
    queryParams["vote_count.gte"] = 100
  }
  if (params.voteCountLte !== undefined) {
    queryParams["vote_count.lte"] = params.voteCountLte
  }

  return queryOptions({
    queryKey: ["discoverTv", params],
    queryFn: () => tmdbFetch<any>("discover/tv", { params: queryParams }),
    staleTime: DEFAULT_STALE_TIME,
  })
}

export function airingTodayQuery(params: TvListParams = {}) {
  const page = params.page ?? 1;
  return queryOptions({
    queryKey: ["airingTodayTv", { page }],
    queryFn: () => tmdbFetch<any>("tv/airing_today", { params: { page } }),
    staleTime: DEFAULT_STALE_TIME,
  })
}

export function tvDetailsQuery(id: number) {
  return queryOptions({
    queryKey: ["tvDetails", id],
    queryFn: () => tmdbFetch<any>(`tv/${id}`),
    staleTime: DEFAULT_STALE_TIME,
  })
}

export function tvCreditsQuery(id: number) {
  return queryOptions({
    queryKey: ["tvCredits", id],
    queryFn: () => tmdbFetch<any>(`tv/${id}/credits`),
    staleTime: DEFAULT_STALE_TIME,
  })
}

export function tvVideosQuery(id: number) {
  return queryOptions({
    queryKey: ["tvVideos", id],
    queryFn: () => tmdbFetch<any>(`tv/${id}/videos`),
    staleTime: DEFAULT_STALE_TIME,
  })
}

export function tvRecommendationsQuery(id: number) {
  return queryOptions({
    queryKey: ["tvRecommendations", id],
    queryFn: () => tmdbFetch<any>(`tv/${id}/recommendations`),
    staleTime: DEFAULT_STALE_TIME,
  })
}

export function tvSeasonQuery(tvId: number, seasonNumber: number) {
  return queryOptions({
    queryKey: ["tvSeason", tvId, seasonNumber],
    queryFn: () => tmdbFetch<any>(`tv/${tvId}/season/${seasonNumber}`),
    staleTime: DEFAULT_STALE_TIME,
  })
}

export function searchTvShowsQuery(query: string, page: number = 1) {
  return queryOptions({
    queryKey: ["searchTvShows", { query, page }],
    queryFn: () =>
      tmdbFetch<any>("search/tv", {
        params: { query, page },
      }),
    staleTime: DEFAULT_STALE_TIME,
    enabled: !!query.trim(),
  })
}

