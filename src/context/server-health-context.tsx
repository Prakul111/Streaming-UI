import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router'
import {
  type ServerHealthMap,
  getCachedHealthMap,
  probeServersBatch,
  sortServersByHealth,
} from '@/lib/server-prober'
import { STREAMING_SERVERS, type StreamingServer } from '@/lib/streaming-servers'

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
  runHealthCheck: (servers?: StreamingServer[], _force?: boolean) => Promise<string>
  getRankedServers: (servers: StreamingServer[]) => StreamingServer[]
}

const ServerHealthContext = createContext<ServerHealthContextValue | null>(null)

export function ServerHealthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const [healthMap, setHealthMap] = useState<ServerHealthMap>(getCachedHealthMap)
  const [isProbing, setIsProbing] = useState(false)
  const [probingProgress, setProbingProgress] = useState(0)
  const [bestServerId, setBestServerId] = useState<string | null>(null)

  // Lightweight background benchmark on app mount if cache empty
  useEffect(() => {
    const cached = getCachedHealthMap()
    if (Object.keys(cached).length === 0) {
      probeServersBatch(STREAMING_SERVERS, {
        maxCandidates: 6,
        timeoutMs: 1400,
      }).then((results) => {
        setHealthMap(results.healthMap)
        setBestServerId(results.bestServerId)
      }).catch(() => {})
    }
  }, [])

  const runHealthCheck = useCallback(
    async (servers?: StreamingServer[], _force?: boolean): Promise<string> => {
      if (isProbing) return bestServerId || 'vidlink'

      setIsProbing(true)
      setProbingProgress(0)

      try {
        const targetServers = servers && servers.length > 0 ? servers : STREAMING_SERVERS
        const results = await probeServersBatch(targetServers, {
          maxCandidates: 12,
          timeoutMs: 1600,
          onProgress: (_result, completed, total) => {
            setProbingProgress(Math.round((completed / total) * 100))
          },
        })

        setHealthMap(results.healthMap)
        const sorted = sortServersByHealth(targetServers, results.healthMap)
        const winner = sorted[0]?.id || results.bestServerId || 'vidlink'
        setBestServerId(winner)
        return winner
      } catch {
        return bestServerId || 'vidlink'
      } finally {
        setIsProbing(false)
        setProbingProgress(100)
      }
    },
    [isProbing, bestServerId]
  )

  // Instant direct navigation without disruptive preflight interception
  const startPreflight = useCallback(
    (params: {
      id: number | string
      title: string
      image?: string
      mediaType?: 'movie' | 'tv'
      targetUrl: string
    }) => {
      navigate(params.targetUrl)
    },
    [navigate]
  )

  const cancelPreflight = useCallback(() => {}, [])

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
      preflightModal: null,
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
