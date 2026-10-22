const TMDB_BASE_URL =
  import.meta.env.VITE_TMDB_BASE_URL ||
  (import.meta.env.DEV ? "/api/tmdb" : "https://api.themoviedb.org/3")

export interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean>
  skipCache?: boolean
}

// In-memory request deduplication map to prevent simultaneous duplicate HTTP requests
const pendingRequests = new Map<string, Promise<any>>()

// In-memory memory cache for instant synchronous lookups
const memoryCache = new Map<string, { data: any; timestamp: number }>()

// Cache durations
const FRESH_CACHE_TTL = 1000 * 60 * 15 // 15 minutes fresh
const MAX_CACHE_AGE = 1000 * 60 * 60 * 24 // 24 hours stale-while-revalidate

const STORAGE_PREFIX = "tmdb_c_"

function getCachedData<T>(key: string): { data: T; isFresh: boolean } | null {
  const now = Date.now()

  // 1. Check in-memory cache first (0ms)
  const mem = memoryCache.get(key)
  if (mem) {
    const isFresh = now - mem.timestamp < FRESH_CACHE_TTL
    return { data: mem.data as T, isFresh }
  }

  // 2. Check sessionStorage
  try {
    if (typeof window !== "undefined" && window.sessionStorage) {
      const stored = window.sessionStorage.getItem(STORAGE_PREFIX + key)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed && parsed.timestamp && now - parsed.timestamp < MAX_CACHE_AGE) {
          // Re-populate memory cache
          memoryCache.set(key, parsed)
          const isFresh = now - parsed.timestamp < FRESH_CACHE_TTL
          return { data: parsed.data as T, isFresh }
        }
      }
    }
  } catch {
    // Ignore storage errors (quota, incognito)
  }

  return null
}

function setCachedData(key: string, data: any): void {
  const record = { data, timestamp: Date.now() }
  memoryCache.set(key, record)

  // Keep in-memory cache pruned
  if (memoryCache.size > 200) {
    const firstKey = memoryCache.keys().next().value
    if (firstKey) memoryCache.delete(firstKey)
  }

  try {
    if (typeof window !== "undefined" && window.sessionStorage) {
      window.sessionStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(record))
    }
  } catch {
    // If quota exceeded, clear older tmdb cache entries
    try {
      if (typeof window !== "undefined" && window.sessionStorage) {
        Object.keys(window.sessionStorage).forEach((k) => {
          if (k.startsWith(STORAGE_PREFIX)) {
            window.sessionStorage.removeItem(k)
          }
        })
      }
    } catch {}
  }
}

export async function tmdbFetch<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { params, headers, skipCache = false, ...restOptions } = options

  // Build URL with query params
  const baseUrl = TMDB_BASE_URL.replace(/\/$/, "")
  const cleanEndpoint = endpoint.replace(/^\//, "")
  const baseOrigin =
    typeof window !== "undefined" && window.location?.origin
      ? window.location.origin
      : "http://localhost:5173"
  const url = new URL(`${baseUrl}/${cleanEndpoint}`, baseOrigin)
  url.searchParams.set("language", "en-US")
  if (params) {
    Object.entries(params).forEach(([key, val]) => {
      url.searchParams.set(key, String(val))
    })
  }

  const cacheKey = url.pathname + url.search

  // Check cache unless explicitly skipped
  if (!skipCache) {
    const cached = getCachedData<T>(cacheKey)
    if (cached) {
      // If fresh, return immediately with 0 network latency!
      if (cached.isFresh) {
        return cached.data
      }

      // If stale, return cached data immediately and revalidate in background
      backgroundRevalidate(url.toString(), cacheKey, headers, restOptions)
      return cached.data
    }
  }

  // Deduplicate in-flight requests
  const existingPromise = pendingRequests.get(cacheKey)
  if (existingPromise) {
    return existingPromise as Promise<T>
  }

  const fetchPromise = (async () => {
    // Set an 8-second timeout for slow network resilience
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000)

    try {
      const response = await fetch(url.toString(), {
        ...restOptions,
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_TMDB_API}`,
          ...headers,
        },
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.status} ${response.statusText}`)
      }

      const json = (await response.json()) as T
      setCachedData(cacheKey, json)
      return json
    } catch (err) {
      clearTimeout(timeoutId)
      // If network fails or times out on slow network, fallback to any cached data
      const staleFallback = getCachedData<T>(cacheKey)
      if (staleFallback) {
        return staleFallback.data
      }
      throw err
    } finally {
      pendingRequests.delete(cacheKey)
    }
  })()

  pendingRequests.set(cacheKey, fetchPromise)
  return fetchPromise
}

// Background revalidation without blocking caller
function backgroundRevalidate(
  urlString: string,
  cacheKey: string,
  headers: HeadersInit | undefined,
  restOptions: RequestInit
) {
  if (pendingRequests.has(cacheKey)) return

  const p = (async () => {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)
      const res = await fetch(urlString, {
        ...restOptions,
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_TMDB_API}`,
          ...headers,
        },
      })
      clearTimeout(timeoutId)
      if (res.ok) {
        const json = await res.json()
        setCachedData(cacheKey, json)
      }
    } catch {
      // Silently ignore background revalidation errors
    } finally {
      pendingRequests.delete(cacheKey)
    }
  })()

  pendingRequests.set(cacheKey, p)
}
