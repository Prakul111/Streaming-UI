import { queryOptions } from "@tanstack/react-query"
import { tmdbFetch } from "./tmdb-client"

interface TrendingParams {
  page?: number
  timeWindow?: "day" | "week"
}

const DEFAULT_STALE_TIME = 1000 * 60 * 5 // 5 minutes

export function trendingAllQuery(params: TrendingParams = {}) {
  const page = params.page ?? 1
  const timeWindow = params.timeWindow ?? "day"
  return queryOptions({
    queryKey: ["trendingAll", { page, timeWindow }],
    queryFn: () => tmdbFetch<any>(`trending/all/${timeWindow}`, { params: { page } }),
    staleTime: DEFAULT_STALE_TIME,
  })
}

export function trendingMovieQuery(params: TrendingParams = {}) {
  const page = params.page ?? 1
  const timeWindow = params.timeWindow ?? "day"
  return queryOptions({
    queryKey: ["trendingMovie", { page, timeWindow }],
    queryFn: () => tmdbFetch<any>(`trending/movie/${timeWindow}`, { params: { page } }),
    staleTime: DEFAULT_STALE_TIME,
  })
}

export function trendingTvQuery(params: TrendingParams = {}) {
  const page = params.page ?? 1
  const timeWindow = params.timeWindow ?? "day"
  return queryOptions({
    queryKey: ["trendingTv", { page, timeWindow }],
    queryFn: () => tmdbFetch<any>(`trending/tv/${timeWindow}`, { params: { page } }),
    staleTime: DEFAULT_STALE_TIME,
  })
}
