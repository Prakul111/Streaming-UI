import { useState, useEffect, useMemo, useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { STREAMING_SERVERS, type StreamingServer } from '@/lib/streaming-servers'
import { fetchApprovedServers, type DatabaseStreamingServer, isSupabaseConfigured } from '@/lib/supabase'
import { evaluateServerUrl } from '@/lib/server-url-parser'

export interface LocalCustomServer {
  id: string
  name: string
  displayName: string
  badge: string
  quality: '4K' | '1080p' | 'HD'
  speed: 'Ultra' | 'Fast' | 'Stable'
  description: string
  movie_url_pattern: string
  tv_url_pattern: string
  created_at: string
}

const LOCAL_STORAGE_KEY = 'custom_streaming_servers_v1'

function getSavedLocalServers(): LocalCustomServer[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (e) {
    console.error('Failed to parse local streaming servers:', e)
    return []
  }
}

function persistLocalServers(servers: LocalCustomServer[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(servers))
  } catch (e) {
    console.error('Failed to save local streaming servers:', e)
  }
}

/**
 * Converts a database record into a runnable StreamingServer instance
 */
function mapDatabaseServer(dbServer: DatabaseStreamingServer): StreamingServer {
  return {
    id: `db-${dbServer.id}`,
    name: dbServer.name,
    displayName: `${dbServer.display_name} 🌐`,
    badge: dbServer.badge || `${dbServer.quality} • Community`,
    quality: dbServer.quality || '1080p',
    speed: dbServer.speed || 'Fast',
    description: dbServer.description || 'Community verified server',
    getMovieUrl: ({ tmdbId, imdbId }) =>
      evaluateServerUrl(dbServer.movie_url_pattern, { tmdbId, imdbId }),
    getTvUrl: ({ tmdbId, imdbId, season, episode }) =>
      evaluateServerUrl(dbServer.tv_url_pattern, { tmdbId, imdbId, season, episode }),
  }
}

/**
 * Converts a local custom server into a runnable StreamingServer instance
 */
function mapLocalServer(localServer: LocalCustomServer): StreamingServer {
  return {
    id: `local-${localServer.id}`,
    name: localServer.name,
    displayName: `${localServer.displayName} ⚡ (My Server)`,
    badge: localServer.badge || 'Custom',
    quality: localServer.quality || '1080p',
    speed: localServer.speed || 'Fast',
    description: localServer.description || 'Custom local server',
    getMovieUrl: ({ tmdbId, imdbId }) =>
      evaluateServerUrl(localServer.movie_url_pattern, { tmdbId, imdbId }),
    getTvUrl: ({ tmdbId, imdbId, season, episode }) =>
      evaluateServerUrl(localServer.tv_url_pattern, { tmdbId, imdbId, season, episode }),
  }
}

export function useStreamingServers() {
  const queryClient = useQueryClient()
  const [localServers, setLocalServers] = useState<LocalCustomServer[]>(getSavedLocalServers)

  // Listen for storage events (if user opens multiple tabs)
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === LOCAL_STORAGE_KEY) {
        setLocalServers(getSavedLocalServers())
      }
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  // TanStack Query for approved community servers from Supabase
  const {
    data: remoteServers = [],
    isLoading: isLoadingRemote,
    refetch: refetchRemote,
  } = useQuery({
    queryKey: ['approved-streaming-servers'],
    queryFn: fetchApprovedServers,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    gcTime: 30 * 60 * 1000,
    enabled: isSupabaseConfigured,
  })

  // Add local custom server
  const addLocalServer = useCallback(
    (input: Omit<LocalCustomServer, 'id' | 'created_at'>): LocalCustomServer => {
      const newServer: LocalCustomServer = {
        ...input,
        id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        created_at: new Date().toISOString(),
      }
      const updated = [newServer, ...localServers]
      setLocalServers(updated)
      persistLocalServers(updated)
      return newServer
    },
    [localServers]
  )

  // Remove local custom server
  const removeLocalServer = useCallback(
    (id: string) => {
      const updated = localServers.filter((s) => s.id !== id && `local-${s.id}` !== id)
      setLocalServers(updated)
      persistLocalServers(updated)
    },
    [localServers]
  )

  // Unified list of all runnable servers:
  // 1. User's personal custom servers (highest priority)
  // 2. Verified community servers from Supabase
  // 3. Built-in default servers (44 servers)
  const allServers = useMemo<StreamingServer[]>(() => {
    const mappedLocal = localServers.map(mapLocalServer)
    const mappedRemote = remoteServers.map(mapDatabaseServer)

    return [...mappedLocal, ...mappedRemote, ...STREAMING_SERVERS]
  }, [localServers, remoteServers])

  return {
    servers: allServers,
    builtInServers: STREAMING_SERVERS,
    communityServers: remoteServers,
    localServers,
    isLoadingCommunity: isLoadingRemote,
    isSupabaseConfigured,
    addLocalServer,
    removeLocalServer,
    refetchCommunityServers: () => {
      queryClient.invalidateQueries({ queryKey: ['approved-streaming-servers'] })
      return refetchRemote()
    },
  }
}
