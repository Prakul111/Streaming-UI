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

export interface DiscoverTvParams {
  page?: number
  sortBy?: string
  withGenres?: string
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
