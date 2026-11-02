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
    id: "vidlink",
    name: "VidLink",
    displayName: "Server 1 • VidLink",
    badge: "4K / 1080p • Ultra",
    quality: "4K",
    speed: "Ultra",
    description: "Modern high-speed streaming engine with adaptive bitrate, multi-subtitles, and clean player",
    getMovieUrl: ({ tmdbId }) =>
      `https://vidlink.pro/movie/${tmdbId}`,
    getTvUrl: ({ tmdbId, season, episode }) =>
      `https://vidlink.pro/tv/${tmdbId}/${season}/${episode}`,
  },
  {
    id: "cinesrc",
    name: "CineSRC",
    displayName: "Server 2 • CineSRC",
    badge: "1080p • Fast",
    quality: "1080p",
    speed: "Ultra",
    description: "Ultra-reliable high-speed stream with multiple backup CDNs and zero buffering",
    getMovieUrl: ({ tmdbId }) =>
      `https://cinesrc.st/embed/movie/${tmdbId}`,
    getTvUrl: ({ tmdbId, season, episode }) =>
      `https://cinesrc.st/embed/tv/${tmdbId}?s=${season}&e=${episode}`,
  },
  {
    id: "vidsrc-pm",
    name: "VidSrc PM",
    displayName: "Server 3 • VidSrc PM",
    badge: "1080p • Multi-Sub",
    quality: "1080p",
    speed: "Ultra",
    description: "High-uptime modern VidSrc mirror with multi-language subtitle tracks",
    getMovieUrl: ({ tmdbId, imdbId }) =>
      `https://vidsrc.pm/embed/movie/${imdbId || tmdbId}`,
    getTvUrl: ({ tmdbId, imdbId, season, episode }) =>
      `https://vidsrc.pm/embed/tv/${imdbId || tmdbId}/${season}/${episode}`,
  },
  {
    id: "vixsrc",
    name: "VixSrc (VidSrc)",
    displayName: "Server 4 • VixSrc",
    badge: "1080p • Fast",
    quality: "1080p",
    speed: "Ultra",
    description: "Fast mirror with full episode selector and bypass for Cloudflare service blocks",
    getMovieUrl: ({ tmdbId, imdbId }) =>
      `https://vidsrc.pm/embed/movie/${imdbId || tmdbId}`,
    getTvUrl: ({ tmdbId, imdbId, season, episode }) =>
      `https://vidsrc.pm/embed/tv/${imdbId || tmdbId}/${season}/${episode}`,
  },
  {
    id: "autoembed",
    name: "AutoEmbed v2",
    displayName: "Server 5 • AutoEmbed v2",
    badge: "4K • 30+ Servers",
    quality: "4K",
    speed: "Ultra",
    description: "Official AutoEmbed v2 multi-source theater with 30+ internal servers (Max, Vidpro, 4K, Netflix, Vidcore) & audio selection",
    getMovieUrl: () =>
      `https://watch-v2.autoembed.app/watch/movie`,
    getTvUrl: ({ season, episode }) =>
      `https://watch-v2.autoembed.app/watch/tv?season=${season}&episode=${episode}`,
  },
  {
    id: "videasy",
    name: "Videasy",
    displayName: "Server 6 • Videasy",
    badge: "1080p • Direct",
    quality: "1080p",
    speed: "Ultra",
    description: "Direct fast-loading stream player with clean controls and crisp 1080p video",
    getMovieUrl: ({ tmdbId }) =>
      `https://player.videasy.net/movie/${tmdbId}`,
    getTvUrl: ({ tmdbId, season, episode }) =>
      `https://player.videasy.net/tv/${tmdbId}/${season}/${episode}`,
  },
  {
    id: "2embed",
    name: "2embed",
    displayName: "Server 7 • 2embed",
    badge: "1080p • Global",
    quality: "1080p",
    speed: "Stable",
    description: "Worldwide streaming mirror with comprehensive subtitles",
    getMovieUrl: ({ tmdbId, imdbId }) =>
      `https://www.2embed.cc/embed/${imdbId || tmdbId}`,
    getTvUrl: ({ tmdbId, imdbId, season, episode }) =>
      `https://www.2embed.cc/embedtv/${imdbId || tmdbId}&s=${season}&e=${episode}`,
  },
  {
    id: "smashystream",
    name: "SmashyStream",
    displayName: "Server 8 • SmashyStream",
    badge: "1080p • Multi-Source",
    quality: "1080p",
    speed: "Fast",
    description: "Multi-source streaming API with wide movie and TV coverage",
    getMovieUrl: ({ tmdbId }) =>
      `https://embed.smashystream.com/playere.php?tmdb=${tmdbId}`,
    getTvUrl: ({ tmdbId, season, episode }) =>
      `https://embed.smashystream.com/playere.php?tmdb=${tmdbId}&season=${season}&episode=${episode}`,
  },
  {
    id: "nxsha",
    name: "Nxsha Embed",
    displayName: "Server 9 • Nxsha",
    badge: "1080p • Embed",
    quality: "1080p",
    speed: "Fast",
    description: "Feature-rich embed player for movies, TV, and anime",
    getMovieUrl: ({ tmdbId }) =>
      `https://web.nxsha.app/embed/movie/${tmdbId}`,
    getTvUrl: ({ tmdbId, season, episode }) =>
      `https://web.nxsha.app/embed/tv/${tmdbId}/${season}/${episode}`,
  },
  {
    id: "atlantic",
    name: "Atlantic",
    displayName: "Server 10 • Atlantic",
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
    id: "fmov",
    name: "Fmov",
    displayName: "Server 11 • Fmov",
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
    id: "vidcore",
    name: "VidCore",
    displayName: "Server 12 • VidCore",
    badge: "1080p • Core",
    quality: "1080p",
    speed: "Fast",
    description: "Core streaming engine with stable video delivery",
    getMovieUrl: ({ tmdbId }) =>
      `https://vidcore.net/embed/movie/${tmdbId}`,
    getTvUrl: ({ tmdbId, season, episode }) =>
      `https://vidcore.net/embed/tv/${tmdbId}/${season}/${episode}`,
  },
  {
    id: "vidcore-org",
    name: "VidCore.org",
    displayName: "Server 13 • VidCore.org",
    badge: "1080p • Backup",
    quality: "1080p",
    speed: "Stable",
    description: "Alternative VidCore mirror for redundant streaming access",
    getMovieUrl: ({ tmdbId }) =>
      `https://www.vidcore.org/embed/movie/${tmdbId}`,
    getTvUrl: ({ tmdbId, season, episode }) =>
      `https://www.vidcore.org/embed/tv/${tmdbId}/${season}/${episode}`,
  },
  {
    id: "vidflix",
    name: "VidFlix",
    displayName: "Server 14 • VidFlix",
    badge: "1080p • Flix",
    quality: "1080p",
    speed: "Fast",
    description: "Netflix-style player interface with smooth playback",
    getMovieUrl: ({ tmdbId }) =>
      `https://vidflix.club/embed/movie/${tmdbId}`,
    getTvUrl: ({ tmdbId, season, episode }) =>
      `https://vidflix.club/embed/tv/${tmdbId}/${season}/${episode}`,
  },
  {
    id: "vidrock",
    name: "vidrock",
    displayName: "Server 15 • vidrock",
    badge: "1080p • Solid",
    quality: "1080p",
    speed: "Fast",
    description: "Rock-solid streaming with high reliability and low latency",
    getMovieUrl: ({ tmdbId }) =>
      `https://vidrock.net/embed/movie/${tmdbId}`,
    getTvUrl: ({ tmdbId, season, episode }) =>
      `https://vidrock.net/embed/tv/${tmdbId}/${season}/${episode}`,
  },
  {
    id: "vidy",
    name: "Vidy",
    displayName: "Server 16 • Vidy",
    badge: "4K • Embed",
    quality: "4K",
    speed: "Ultra",
    description: "4K embed player with postMessage events and responsive UI",
    getMovieUrl: ({ tmdbId }) =>
      `https://vidy.st/movie/${tmdbId}?autoplay=true`,
    getTvUrl: ({ tmdbId, season, episode }) =>
      `https://vidy.st/tv/${tmdbId}/${season}/${episode}?nextEpisode=true&episodeSelector=true`,
  },
  {
    id: "vidsrcme",
    name: "VidSrc.me",
    displayName: "Server 17 • VidSrc.me",
    badge: "1080p • Mirror",
    quality: "1080p",
    speed: "Fast",
    description: "Direct VidSrc official mirror with global CDN presence",
    getMovieUrl: ({ tmdbId, imdbId }) =>
      `https://vidsrc.me/embed/movie/${imdbId || tmdbId}`,
    getTvUrl: ({ tmdbId, imdbId, season, episode }) =>
      `https://vidsrc.me/embed/tv/${imdbId || tmdbId}/${season}/${episode}`,
  },
  {
    id: "framextv",
    name: "frameXTV",
    displayName: "Server 18 • frameXTV",
    badge: "1080p • Clean",
    quality: "1080p",
    speed: "Stable",
    description: "Modern clean player interface with fast media delivery",
    getMovieUrl: ({ tmdbId }) =>
      `https://framextv.xyz/embed/${tmdbId}`,
    getTvUrl: ({ tmdbId, season, episode }) =>
      `https://framextv.xyz/embed/${tmdbId}/${season}/${episode}`,
  },
  {
    id: "spenembed",
    name: "SpenEmbed",
    displayName: "Server 19 • SpenEmbed",
    badge: "HD • Compact",
    quality: "HD",
    speed: "Stable",
    description: "Compact embed player from Spencer Devs with clean UI",
    getMovieUrl: ({ tmdbId }) =>
      `https://spencerdevs.xyz/embed/movie/${tmdbId}`,
    getTvUrl: ({ tmdbId, season, episode }) =>
      `https://spencerdevs.xyz/embed/tv/${tmdbId}/${season}/${episode}`,
  },
  {
    id: "vidapi-ru",
    name: "VidAPI.ru",
    displayName: "Server 20 • VidAPI.ru",
    badge: "1080p • RU Mirror",
    quality: "1080p",
    speed: "Stable",
    description: "Multi-regional mirror with wide movie and TV coverage",
    getMovieUrl: ({ tmdbId }) =>
      `https://vidapi.ru/embed/movie/${tmdbId}`,
    getTvUrl: ({ tmdbId, season, episode }) =>
      `https://vidapi.ru/embed/tv/${tmdbId}/${season}/${episode}`,
  },
  {
    id: "vidapi-xyz",
    name: "VidAPI",
    displayName: "Server 21 • VidAPI",
    badge: "1080p • Global",
    quality: "1080p",
    speed: "Fast",
    description: "Global video API with extensive streaming library",
    getMovieUrl: ({ tmdbId }) =>
      `https://vidapi.xyz/embed/movie/${tmdbId}`,
    getTvUrl: ({ tmdbId, season, episode }) =>
      `https://vidapi.xyz/embed/tv/${tmdbId}/${season}/${episode}`,
  },
  {
    id: "vidup",
    name: "VidUP",
    displayName: "Server 22 • VidUP",
    badge: "1080p • Upload",
    quality: "1080p",
    speed: "Fast",
    description: "Fresh upload-based streaming with latest content available",
    getMovieUrl: ({ tmdbId }) =>
      `https://vidup.to/embed/movie/${tmdbId}`,
    getTvUrl: ({ tmdbId, season, episode }) =>
      `https://vidup.to/embed/tv/${tmdbId}/${season}/${episode}`,
  },
  {
    id: "cinemaos",
    name: "Cinemaos",
    displayName: "Server 23 • Cinemaos",
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
    id: "nontongo",
    name: "NontonGo",
    displayName: "Server 24 • NontonGo",
    badge: "1080p • Multi-ID",
    quality: "1080p",
    speed: "Stable",
    description: "Aggregated streaming links via IMDB, TMDB, and anime IDs",
    getMovieUrl: ({ tmdbId }) =>
      `https://nontongo.win/embed/movie/${tmdbId}`,
    getTvUrl: ({ tmdbId, season, episode }) =>
      `https://nontongo.win/embed/tv/${tmdbId}/${season}/${episode}`,
  },
]

export const DEFAULT_SERVER_ID = "vidlink"
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
