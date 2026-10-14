import { queryOptions } from "@tanstack/react-query"
import { tmdbFetch } from "./tmdb-client"

const DEFAULT_STALE_TIME = 1000 * 60 * 5 // 5 minutes

export interface KnownForItem {
  id: number
  title?: string
  name?: string
  media_type: "movie" | "tv"
  poster_path: string | null
  backdrop_path: string | null
  overview?: string
  release_date?: string
  first_air_date?: string
  vote_average?: number
}

export interface PersonItem {
  id: number
  name: string
  original_name?: string
  profile_path: string | null
  known_for_department: string
  popularity: number
  known_for?: KnownForItem[]
  gender?: number
}

export interface PopularPeopleResponse {
  page: number
  results: PersonItem[]
  total_pages: number
  total_results: number
}

export function popularPeopleQuery(page: number = 1) {
  return queryOptions({
    queryKey: ["popularPeople", { page }],
    queryFn: () =>
      tmdbFetch<PopularPeopleResponse>("person/popular", {
        params: { page },
      }),
    staleTime: DEFAULT_STALE_TIME,
  })
}

export function searchPeopleQuery(query: string, page: number = 1) {
  return queryOptions({
    queryKey: ["searchPeople", { query, page }],
    queryFn: () =>
      tmdbFetch<PopularPeopleResponse>("search/person", {
        params: { query, page },
      }),
    staleTime: DEFAULT_STALE_TIME,
    enabled: !!query,
  })
}

export interface CreditItem {
  id: number
  title?: string
  name?: string
  original_title?: string
  original_name?: string
  character?: string
  department?: string
  job?: string
  media_type: "movie" | "tv"
  poster_path: string | null
  backdrop_path: string | null
  release_date?: string
  first_air_date?: string
  vote_average?: number
  vote_count?: number
  popularity?: number
  episode_count?: number
  genre_ids?: number[]
  credit_id?: string
}

export interface ExternalIds {
  imdb_id?: string | null
  facebook_id?: string | null
  instagram_id?: string | null
  twitter_id?: string | null
  tiktok_id?: string | null
  youtube_id?: string | null
}

export interface PersonDetailsResponse {
  id: number
  name: string
  original_name?: string
  also_known_as: string[]
  biography: string
  birthday: string | null
  deathday: string | null
  gender: number
  homepage: string | null
  imdb_id: string | null
  known_for_department: string
  place_of_birth: string | null
  popularity: number
  profile_path: string | null
  combined_credits: {
    cast: CreditItem[]
    crew: CreditItem[]
  }
  external_ids?: ExternalIds
  images?: {
    profiles: Array<{ file_path: string; width: number; height: number }>
  }
}

export function personDetailsQuery(id: number) {
  return queryOptions({
    queryKey: ["personDetails", id],
    queryFn: () =>
      tmdbFetch<PersonDetailsResponse>(`person/${id}`, {
        params: { append_to_response: "combined_credits,images,external_ids" },
      }),
    staleTime: DEFAULT_STALE_TIME,
    enabled: !isNaN(id) && id > 0,
  })
}

