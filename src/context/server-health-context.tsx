import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router'
import {
  type ServerHealthMap,
  type ServerHealthResult,
  getCachedHealthMap,
  probeServersBatch,
  sortServersByHealth,
} from '@/lib/server-prober'
import { STREAMING_SERVERS, type StreamingServer, setStoredServerId } from '@/lib/streaming-servers'

export interface PreflightModalState {
  isOpen: boolean
  id?: number | string
  title: string
  image?: string
  mediaType: 'movie' | 'tv'
  targetUrl: string
  testedCount: number
  totalCount: number
  latestTestedServer?: string
  latestLatency?: number
  bestServerFound?: string
}

interface ServerHealthContextValue {
  healthMap: ServerHealthMap
  isProbing: boolean
  probingProgress: number
  bestServerId: string | null
  preflightModal: PreflightModalState | null
  startPreflight: (params: {
    id: number | string
    title: string
    image?: string
    mediaType?: 'movie' | 'tv'
    targetUrl: string
  }) => void
  cancelPreflight: () => void
  runHealthCheck: (servers?: StreamingServer[], force?: boolean) => Promise<string>
  getRankedServers: (servers: StreamingServer[]) => StreamingServer[]
}

const ServerHealthContext = createContext<ServerHealthContextValue | null>(null)

export function ServerHealthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const [healthMap, setHealthMap] = useState<ServerHealthMap>(getCachedHealthMap)
  const [isProbing, setIsProbing] = useState(false)
  const [probingProgress, setProbingProgress] = useState(0)
  const [bestServerId, setBestServerId] = useState<string | null>(null)
  const [preflightModal, setPreflightModal] = useState<PreflightModalState | null>(null)

  // Run initial lightweight benchmark if cache is completely empty
  useEffect(() => {
    const cached = getCachedHealthMap()
    if (Object.keys(cached).length === 0) {
      // Background non-blocking warm up on first app visit
      probeServersBatch(STREAMING_SERVERS, {
        maxCandidates: 6,
        timeoutMs: 1800,
      }).then(({ healthMap: updated, bestServerId: best }) => {
        setHealthMap(updated)
        setBestServerId(best)
      })
    }
  }, [])

  const runHealthCheck = useCallback(
    async (servers: StreamingServer[] = STREAMING_SERVERS, force = false): Promise<string> => {
      if (isProbing && !force) return bestServerId || 'cinesrc'

      setIsProbing(true)
      setProbingProgress(5)

      try {
        const { healthMap: updated, bestServerId: best } = await probeServersBatch(servers, {
          maxCandidates: 14,
          timeoutMs: 2000,
          onProgress: (_res, completed, total) => {
            setProbingProgress(Math.round((completed / total) * 100))
          },
        })

        setHealthMap(updated)
        setBestServerId(best)
        setStoredServerId(best)
        return best
      } finally {
        setIsProbing(false)
        setProbingProgress(100)
      }
    },
    [isProbing, bestServerId]
  )

  const startPreflight = useCallback(
    (params: {
      id: number | string
      title: string
      image?: string
      mediaType?: 'movie' | 'tv'
      targetUrl: string
    }) => {
      const mediaType = params.mediaType || 'movie'

      // Check if we already have fresh tested results (< 15 mins)
      const cached = getCachedHealthMap()
      const hasFreshResults = Object.keys(cached).length >= 4

      // If already fresh, fast-track navigation
      if (hasFreshResults) {
        // Quick ranking check
        const sorted = sortServersByHealth(STREAMING_SERVERS, cached)
        const winner = sorted[0]?.id || 'cinesrc'
        setStoredServerId(winner)
        navigate(params.targetUrl)
        return
      }

      // Otherwise, open the cinematic pre-flight testing modal
      setPreflightModal({
        isOpen: true,
        id: params.id,
        title: params.title,
        image: params.image,
        mediaType,
        targetUrl: params.targetUrl,
        testedCount: 0,
        totalCount: 10,
        latestTestedServer: 'Initializing...',
      })

      // Run live concurrent probe for top 10 servers
      probeServersBatch(STREAMING_SERVERS, {
        tmdbId: params.id,
        mediaType,
        maxCandidates: 10,
        timeoutMs: 1800,
        onProgress: (result: ServerHealthResult, completed: number, total: number) => {
          setPreflightModal((prev) => {
            if (!prev) return null
            return {
              ...prev,
              testedCount: completed,
              totalCount: total,
              latestTestedServer: result.serverName,
              latestLatency: result.latencyMs,
              bestServerFound: result.status === 'optimal' || result.status === 'fast' ? result.serverName : prev.bestServerFound,
            }
          })
        },
      }).then(({ healthMap: updated, bestServerId: best }) => {
        setHealthMap(updated)
        setBestServerId(best)
        setStoredServerId(best)

        // Smooth transition to target page
        setTimeout(() => {
          setPreflightModal(null)
          navigate(params.targetUrl)
        }, 350)
      }).catch(() => {
        // Fallback on error
        setPreflightModal(null)
        navigate(params.targetUrl)
      })
    },
    [navigate]
  )

  const cancelPreflight = useCallback(() => {
    if (preflightModal) {
      const target = preflightModal.targetUrl
      setPreflightModal(null)
      navigate(target)
    }
  }, [preflightModal, navigate])

  const getRankedServers = useCallback(
    (servers: StreamingServer[]): StreamingServer[] => {
      return sortServersByHealth(servers, healthMap)
    },
    [healthMap]
  )

  const value = useMemo(
    () => ({
      healthMap,
      isProbing,
      probingProgress,
      bestServerId,
      preflightModal,
      startPreflight,
      cancelPreflight,
      runHealthCheck,
      getRankedServers,
    }),
    [
      healthMap,
      isProbing,
      probingProgress,
      bestServerId,
      preflightModal,
      startPreflight,
      cancelPreflight,
      runHealthCheck,
      getRankedServers,
    ]
  )

  return (
    <ServerHealthContext.Provider value={value}>
      {children}
    </ServerHealthContext.Provider>
  )
}

export function useServerHealth() {
  const context = useContext(ServerHealthContext)
  if (!context) {
    throw new Error('useServerHealth must be used within a ServerHealthProvider')
  }
  return context
}
