/**
 * Streaming Server Real-Time Latency & Health Prober
 *
 * Measures live client-to-server connection latency, filters out broken/offline
 * mirrors, and ranks servers from fastest (optimal) to slowest/offline.
 */

import type { StreamingServer } from './streaming-servers'

export type ServerHealthStatus = 'optimal' | 'fast' | 'stable' | 'slow' | 'offline'

export interface ServerHealthResult {
  serverId: string
  serverName: string
  latencyMs: number
  status: ServerHealthStatus
  lastTested: number
  isEmbeddable: boolean
  error?: string
}

export type ServerHealthMap = Record<string, ServerHealthResult>

const HEALTH_CACHE_KEY = 'streaming_server_health_cache_v2'
const BEST_SERVER_KEY = 'preferred_streaming_server_id'
const CACHE_TTL_MS = 15 * 60 * 1000 // 15 minutes freshness

/**
 * Reads cached health results from sessionStorage
 */
export function getCachedHealthMap(): ServerHealthMap {
  if (typeof window === 'undefined') return {}
  try {
    const raw = sessionStorage.getItem(HEALTH_CACHE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as { timestamp: number; data: ServerHealthMap }
    if (Date.now() - parsed.timestamp < CACHE_TTL_MS) {
      return parsed.data || {}
    }
  } catch (e) {
    console.warn('Failed to parse cached server health:', e)
  }
  return {}
}

/**
 * Persists health results to sessionStorage
 */
export function persistHealthMap(map: ServerHealthMap): void {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(
      HEALTH_CACHE_KEY,
      JSON.stringify({
        timestamp: Date.now(),
        data: map,
      })
    )
  } catch (e) {
    console.warn('Failed to persist server health cache:', e)
  }
}

/**
 * Extracts the base origin / domain from a server's embed URL for fallback pinging
 */
function getTargetProbeUrl(server: StreamingServer, tmdbId: number | string = 550, mediaType: 'movie' | 'tv' = 'movie'): string {
  try {
    const fullUrl =
      mediaType === 'movie'
        ? server.getMovieUrl({ tmdbId })
        : server.getTvUrl({ tmdbId, season: 1, episode: 1 })
    
    // Test the exact embed URL directly
    return fullUrl
  } catch {
    return 'https://cinesrc.st'
  }
}

/**
 * Probes an individual streaming server using fetch with mode: 'no-cors'.
 * In browsers, fetch with no-cors completes a full TCP/TLS + TTFB roundtrip to the server.
 * When the server responds with headers, the promise resolves and gives accurate millisecond latency.
 */
export async function probeSingleServer(
  server: StreamingServer,
  options?: {
    tmdbId?: number | string
    mediaType?: 'movie' | 'tv'
    timeoutMs?: number
  }
): Promise<ServerHealthResult> {
  const timeoutMs = options?.timeoutMs || 2200
  const testUrl = getTargetProbeUrl(server, options?.tmdbId || 550, options?.mediaType || 'movie')

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  const startTime = performance.now()

  try {
    await fetch(testUrl, {
      method: 'GET',
      mode: 'no-cors',
      cache: 'no-store',
      signal: controller.signal,
    })

    clearTimeout(timer)
    const latencyMs = Math.round(performance.now() - startTime)

    let status: ServerHealthStatus = 'stable'
    if (latencyMs < 500) status = 'optimal'
    else if (latencyMs < 950) status = 'fast'
    else if (latencyMs < 1800) status = 'stable'
    else status = 'slow'

    return {
      serverId: server.id,
      serverName: server.name,
      latencyMs,
      status,
      lastTested: Date.now(),
      isEmbeddable: true,
    }
  } catch (err: any) {
    clearTimeout(timer)
    const elapsed = Math.round(performance.now() - startTime)
    const isTimeout = err?.name === 'AbortError' || elapsed >= timeoutMs

    return {
      serverId: server.id,
      serverName: server.name,
      latencyMs: isTimeout ? timeoutMs : elapsed,
      status: 'offline',
      lastTested: Date.now(),
      isEmbeddable: false,
      error: isTimeout ? 'Timed out (>2.2s)' : 'Connection failed',
    }
  }
}

/**
 * Concurrently benchmarks a batch of streaming servers with prioritized execution.
 * Calls onProgress callback when each server finishes testing so UI can update live.
 */
export async function probeServersBatch(
  servers: StreamingServer[],
  options?: {
    tmdbId?: number | string
    mediaType?: 'movie' | 'tv'
    maxCandidates?: number
    timeoutMs?: number
    onProgress?: (result: ServerHealthResult, completed: number, total: number) => void
  }
): Promise<{ healthMap: ServerHealthMap; bestServerId: string }> {
  // Test candidate priority: user custom servers + top prominent servers
  const maxCandidates = options?.maxCandidates || 16
  const candidateServers = servers.slice(0, maxCandidates)

  const existingCache = getCachedHealthMap()
  const updatedMap: ServerHealthMap = { ...existingCache }

  let completedCount = 0
  const total = candidateServers.length

  const promises = candidateServers.map(async (server) => {
    const res = await probeSingleServer(server, {
      tmdbId: options?.tmdbId,
      mediaType: options?.mediaType,
      timeoutMs: options?.timeoutMs || 2200,
    })

    updatedMap[server.id] = res
    completedCount++

    if (options?.onProgress) {
      options.onProgress(res, completedCount, total)
    }

    return res
  })

  await Promise.allSettled(promises)
  persistHealthMap(updatedMap)

  // Determine the best performing server
  const sorted = [...candidateServers].sort((a, b) => {
    const scoreA = getServerScore(a.id, updatedMap[a.id])
    const scoreB = getServerScore(b.id, updatedMap[b.id])
    return scoreB - scoreA
  })

  const bestServer = sorted[0] || servers[0]
  const bestServerId = bestServer ? bestServer.id : 'cinesrc'

  // Persist best server as preferred
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(BEST_SERVER_KEY, bestServerId)
    } catch {
      // Ignore localStorage errors
    }
  }

  return { healthMap: updatedMap, bestServerId }
}

/**
 * Computes a comparative score for ranking servers
 */
function getServerScore(_serverId: string, result?: ServerHealthResult): number {
  if (!result) return 50 // Untested default middle weight

  if (result.status === 'offline') return -100
  if (result.status === 'slow') return 20

  // Optimal & fast get high scores, inverse to latency
  let baseScore = 100
  if (result.status === 'optimal') baseScore = 200
  else if (result.status === 'fast') baseScore = 150
  else if (result.status === 'stable') baseScore = 80

  const latencyPenalty = Math.min(result.latencyMs / 10, 80)
  return baseScore - latencyPenalty
}

/**
 * Sorts any list of StreamingServers based on health results:
 * 1. Optimal (Rank 1 - Lowest latency at top)
 * 2. Fast
 * 3. Stable
 * 4. Untested
 * 5. Slow (marked with warning)
 * 6. Offline / Degraded (placed at the very bottom)
 */
export function sortServersByHealth(
  servers: StreamingServer[],
  healthMap: ServerHealthMap
): StreamingServer[] {
  return [...servers].sort((a, b) => {
    const scoreA = getServerScore(a.id, healthMap[a.id])
    const scoreB = getServerScore(b.id, healthMap[b.id])

    if (scoreB !== scoreA) {
      return scoreB - scoreA
    }

    // Secondary sort by latency if both are tested
    const latA = healthMap[a.id]?.latencyMs ?? 9999
    const latB = healthMap[b.id]?.latencyMs ?? 9999
    return latA - latB
  })
}
