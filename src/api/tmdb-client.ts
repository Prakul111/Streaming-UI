// Candidate TMDB API endpoints in fallback order:
// 1. VITE_TMDB_BASE_URL (if custom proxy provided in .env)
// 2. /api/tmdb - Proxied by Vite server (dev/preview) or Vercel edge rewrite; completely immune to ISP blocks
// 3. https://api.tmdb.org/3 - TMDB's official alternate domain (unblocked by Indian ISPs like Jio/Airtel)
// 4. https://api.themoviedb.org/3 - Primary TMDB domain
const CANDIDATE_BASE_URLS: string[] = [
  ...(import.meta.env.VITE_TMDB_BASE_URL ? [import.meta.env.VITE_TMDB_BASE_URL] : []),
  "/api/tmdb",
  "https://api.tmdb.org/3",
  "https://api.themoviedb.org/3",
]

const STORAGE_ENDPOINT_KEY = "tmdb_active_endpoint"

function getStoredEndpoint(): string {
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      const saved = window.localStorage.getItem(STORAGE_ENDPOINT_KEY)
      if (saved && CANDIDATE_BASE_URLS.includes(saved)) {
        return saved
      }
    } catch {}
  }
  // Default to /api/tmdb if in browser/dev, otherwise api.tmdb.org
  return CANDIDATE_BASE_URLS[0]
}

let activeBaseUrl = getStoredEndpoint()

function setWorkingEndpoint(url: string) {
  activeBaseUrl = url
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      window.localStorage.setItem(STORAGE_ENDPOINT_KEY, url)
    } catch {}
  }
}

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

  if (memoryCache.size > 200) {
    const firstKey = memoryCache.keys().next().value
    if (firstKey) memoryCache.delete(firstKey)
  }

  try {
    if (typeof window !== "undefined" && window.sessionStorage) {
      window.sessionStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(record))
    }
  } catch {
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

function buildTargetUrl(
  base: string,
  cleanEndpoint: string,
  params?: Record<string, string | number | boolean>
): URL {
  const baseOrigin =
    typeof window !== "undefined" && window.location?.origin
      ? window.location.origin
      : "http://localhost:5173"
  const url = new URL(`${base.replace(/\/$/, "")}/${cleanEndpoint.replace(/^\//, "")}`, baseOrigin)
  url.searchParams.set("language", "en-US")
  if (params) {
    Object.entries(params).forEach(([key, val]) => {
      url.searchParams.set(key, String(val))
    })
  }
  return url
}

export async function tmdbFetch<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { params, headers, skipCache = false, ...restOptions } = options
  const cleanEndpoint = endpoint.replace(/^\//, "")

  // Consistent logical cache key independent of which base URL endpoint is used
  const sampleUrl = buildTargetUrl("/api/tmdb", cleanEndpoint, params)
  const cacheKey = sampleUrl.pathname + sampleUrl.search

  // Check cache unless explicitly skipped
  if (!skipCache) {
    const cached = getCachedData<T>(cacheKey)
    if (cached) {
      if (cached.isFresh) {
        return cached.data
      }
      backgroundRevalidate(cleanEndpoint, params, cacheKey, headers, restOptions)
      return cached.data
    }
  }

  // Deduplicate in-flight requests
  const existingPromise = pendingRequests.get(cacheKey)
  if (existingPromise) {
    return existingPromise as Promise<T>
  }

  const fetchPromise = (async () => {
    // Endpoints to try: active endpoint first, followed by remaining candidates
    const endpointsToTry = [
      activeBaseUrl,
      ...CANDIDATE_BASE_URLS.filter((u) => u !== activeBaseUrl),
    ]

    let lastError: any = null

    for (const base of endpointsToTry) {
      const targetUrl = buildTargetUrl(base, cleanEndpoint, params)
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 6500)

      try {
        const response = await fetch(targetUrl.toString(), {
          ...restOptions,
          signal: controller.signal,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_TMDB_API}`,
            ...headers,
          },
        })

        clearTimeout(timeoutId)

        if (response.ok) {
          const json = (await response.json()) as T
          setCachedData(cacheKey, json)
          if (activeBaseUrl !== base) {
            setWorkingEndpoint(base)
          }
          return json
        } else if (response.status === 404 && base === "/api/tmdb") {
          // Proxy endpoint not mounted on current static host; silently failover to api.tmdb.org
          continue
        } else {
          lastError = new Error(`TMDB API error: ${response.status} ${response.statusText}`)
        }
      } catch (err: any) {
        clearTimeout(timeoutId)
        lastError = err
        // Network error, DNS block, or timeout: proceed to next candidate endpoint
      }
    }

    // If all candidate endpoints failed, fallback to stale cache if present
    const staleFallback = getCachedData<T>(cacheKey)
    if (staleFallback) {
      return staleFallback.data
    }

    throw lastError || new Error("Failed to reach TMDB API on any endpoint")
  })().finally(() => {
    pendingRequests.delete(cacheKey)
  })

  pendingRequests.set(cacheKey, fetchPromise)
  return fetchPromise
}

// Background revalidation without blocking caller
function backgroundRevalidate(
  cleanEndpoint: string,
  params: Record<string, string | number | boolean> | undefined,
  cacheKey: string,
  headers: HeadersInit | undefined,
  restOptions: RequestInit
) {
  if (pendingRequests.has(cacheKey)) return

  const p = (async () => {
    const endpointsToTry = [
      activeBaseUrl,
      ...CANDIDATE_BASE_URLS.filter((u) => u !== activeBaseUrl),
    ]

    for (const base of endpointsToTry) {
      const targetUrl = buildTargetUrl(base, cleanEndpoint, params)
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 8000)

      try {
        const res = await fetch(targetUrl.toString(), {
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
          if (activeBaseUrl !== base) {
            setWorkingEndpoint(base)
          }
          break
        }
      } catch {
        clearTimeout(timeoutId)
      }
    }
  })().finally(() => {
    pendingRequests.delete(cacheKey)
  })

  pendingRequests.set(cacheKey, p)
}
