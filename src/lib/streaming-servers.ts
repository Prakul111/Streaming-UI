export interface StreamingServer {
  id: string
  name: string
  displayName: string
  badge: string
  quality: "4K" | "1080p" | "HD"
  speed: "Ultra" | "Fast" | "Stable"
  description: string
  getMovieUrl: (params: { tmdbId: number | string; imdbId?: string | null }) => string
  getTvUrl: (params: {
    tmdbId: number | string
    imdbId?: string | null
    season: number
    episode: number
  }) => string
}

export const STREAMING_SERVERS: StreamingServer[] = [
  {
    id: "autoembed",
    name: "AutoEmbed",
    displayName: "Server 1 • AutoEmbed",
    badge: "4K / 1080p",
    quality: "4K",
    speed: "Ultra",
    description: "Multi-language audio, high-speed CDN, and adaptive streaming",
    getMovieUrl: ({ tmdbId, imdbId }) =>
      `https://player.autoembed.app/embed/movie/${imdbId || tmdbId}`,
    getTvUrl: ({ tmdbId, imdbId, season, episode }) =>
      `https://player.autoembed.app/embed/tv/${imdbId || tmdbId}/${season}/${episode}`,
  },
  {
    id: "cinesrc",
    name: "CineSRC",
    displayName: "Server 2 • CineSRC",
    badge: "1080p • Fast",
    quality: "1080p",
    speed: "Ultra",
    description: "Reliable high-speed stream with multiple backup sources",
    getMovieUrl: ({ tmdbId }) =>
      `https://cinesrc.st/embed/movie/${tmdbId}`,
    getTvUrl: ({ tmdbId, season, episode }) =>
      `https://cinesrc.st/embed/tv/${tmdbId}?s=${season}&e=${episode}`,
  },
  {
    id: "2embed",
    name: "2embed",
    displayName: "Server 3 • 2embed",
    badge: "1080p • Multi-Sub",
    quality: "1080p",
    speed: "Stable",
    description: "Worldwide streaming mirror with comprehensive subtitles",
    getMovieUrl: ({ tmdbId, imdbId }) =>
      `https://www.2embed.cc/embed/${imdbId || tmdbId}`,
    getTvUrl: ({ tmdbId, imdbId, season, episode }) =>
      `https://www.2embed.cc/embedtv/${imdbId || tmdbId}&s=${season}&e=${episode}`,
  },
  {
    id: "cinemaos",
    name: "Cinemaos",
    displayName: "Server 4 • Cinemaos",
    badge: "HD • Low Buffer",
    quality: "HD",
    speed: "Fast",
    description: "Optimized video player with minimal buffering and clean layout",
    getMovieUrl: ({ tmdbId }) =>
      `https://cinemaos.tech/player/${tmdbId}`,
    getTvUrl: ({ tmdbId, season, episode }) =>
      `https://cinemaos.tech/player/${tmdbId}/${season}/${episode}`,
  },
  {
    id: "atlantic",
    name: "Atlantic",
    displayName: "Server 5 • Atlantic",
    badge: "1080p • Direct",
    quality: "1080p",
    speed: "Fast",
    description: "Direct fast-loading stream player with instant playback",
    getMovieUrl: ({ tmdbId }) =>
      `https://atlantic.st/embed/movie/${tmdbId}`,
    getTvUrl: ({ tmdbId, season, episode }) =>
      `https://atlantic.st/embed/tv/${tmdbId}/${season}/${episode}`,
  },
  {
    id: "cinextream",
    name: "Cinextream",
    displayName: "Server 6 • Cinextream",
    badge: "HD • Sub & Dub",
    quality: "HD",
    speed: "Fast",
    description: "Extensive multi-server support with sub and dub capabilities",
    getMovieUrl: ({ tmdbId }) =>
      `https://cinextream.net/api/embed/movie/${tmdbId}`,
    getTvUrl: ({ tmdbId, season, episode }) =>
      `https://cinextream.net/api/embed/tv/${tmdbId}/${season}/${episode}`,
  },
  {
    id: "fmov",
    name: "Fmov",
    displayName: "Server 7 • Fmov",
    badge: "1080p • Captions",
    quality: "1080p",
    speed: "Fast",
    description: "High quality series and movie player with integrated captions",
    getMovieUrl: ({ tmdbId }) =>
      `https://fmov.my/embed/movie/${tmdbId}`,
    getTvUrl: ({ tmdbId, season, episode }) =>
      `https://fmov.my/embed/series/${tmdbId}/${season}/${episode}`,
  },
  {
    id: "framextv",
    name: "frameXTV",
    displayName: "Server 8 • frameXTV",
    badge: "1080p • Responsive",
    quality: "1080p",
    speed: "Stable",
    description: "Modern clean player interface with fast media delivery",
    getMovieUrl: ({ tmdbId }) =>
      `https://framextv.xyz/embed/${tmdbId}`,
    getTvUrl: ({ tmdbId, season, episode }) =>
      `https://framextv.xyz/embed/${tmdbId}/${season}/${episode}`,
  },
  {
    id: "mapple",
    name: "Mapple Player",
    displayName: "Server 9 • Mapple",
    badge: "HD • Autoplay",
    quality: "HD",
    speed: "Fast",
    description: "Instant autoplay server with automatic video resolution",
    getMovieUrl: ({ tmdbId, imdbId }) =>
      `https://mapple.fun/watch/movie/${imdbId || tmdbId}?autoPlay=true`,
    getTvUrl: ({ tmdbId, imdbId, season, episode }) =>
      `https://mapple.fun/watch/tv/${imdbId || tmdbId}-${season}-${episode}?autoPlay=true`,
  },
  {
    id: "vixsrc",
    name: "VixSrc",
    displayName: "Server 10 • VixSrc",
    badge: "1080p • UI Themes",
    quality: "1080p",
    speed: "Ultra",
    description: "Original fast purple player with episode selector controls",
    getMovieUrl: ({ tmdbId }) =>
      `https://vixsrc.to/movie/${tmdbId}?color=a855f7&autoPlay=true`,
    getTvUrl: ({ tmdbId, season, episode }) =>
      `https://vixsrc.to/tv/${tmdbId}/${season}/${episode}?color=a855f7&autoPlay=true&nextEpisode=true&episodeSelector=true`,
  },
]

export const DEFAULT_SERVER_ID = "autoembed"
const STORAGE_KEY = "preferred_streaming_server_id"

export function getStreamingServer(serverId?: string): StreamingServer {
  const found = STREAMING_SERVERS.find((s) => s.id === serverId)
  return found || STREAMING_SERVERS[0]
}

export function getStoredServerId(): string {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (stored && STREAMING_SERVERS.some((s) => s.id === stored)) {
        return stored
      }
    }
  } catch {
    // Ignore localStorage errors (e.g. incognito/sandboxed)
  }
  return DEFAULT_SERVER_ID
}

export function setStoredServerId(serverId: string): void {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEY, serverId)
    }
  } catch {
    // Ignore localStorage errors
  }
}

export function getMovieEmbedUrl(
  serverId: string,
  params: { tmdbId: number | string; imdbId?: string | null }
): string {
  const server = getStreamingServer(serverId)
  return server.getMovieUrl(params)
}

export function getTvEmbedUrl(
  serverId: string,
  params: {
    tmdbId: number | string
    imdbId?: string | null
    season: number
    episode: number
  }
): string {
  const server = getStreamingServer(serverId)
  return server.getTvUrl(params)
}
