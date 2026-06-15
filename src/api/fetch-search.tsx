import { queryOptions } from "@tanstack/react-query"
import { tmdbFetch } from "./tmdb-client"

interface SearchParams {
  query: string
  page?: number
}

const DEFAULT_STALE_TIME = 1000 * 60 * 5 // 5 minutes

export function multiSearchQuery(params: SearchParams) {
  const page = params.page ?? 1
  return queryOptions({
    queryKey: ["multiSearch", { query: params.query, page }],
    queryFn: () =>
      tmdbFetch<any>("search/multi", {
        params: { query: params.query, page },
      }),
    staleTime: DEFAULT_STALE_TIME,
    enabled: !!params.query,
  })
}
