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
  // ── Existing Servers ──────────────────────────────────────────────────
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

  // ── New Servers ────────────────────────────────────────────────────────
  {
    id: "nxsha",
    name: "Nxsha Embed",
    displayName: "Server 11 • Nxsha",
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
    id: "nontongo",
    name: "NontonGo",
    displayName: "Server 12 • NontonGo",
    badge: "1080p • Multi-ID",
    quality: "1080p",
    speed: "Stable",
    description: "Aggregated streaming links via IMDB, TMDB, and anime IDs",
    getMovieUrl: ({ tmdbId }) =>
      `https://nontongo.win/embed/movie/${tmdbId}`,
    getTvUrl: ({ tmdbId, season, episode }) =>
      `https://nontongo.win/embed/tv/${tmdbId}/${season}/${episode}`,
  },
  {
    id: "peachify",
    name: "Peachify",
    displayName: "Server 13 • Peachify",
    badge: "1080p • Clean",
    quality: "1080p",
    speed: "Fast",
    description: "Clean streaming player with minimal interface distractions",
    getMovieUrl: ({ tmdbId }) =>
      `https://peachify.top/embed/movie/${tmdbId}`,
    getTvUrl: ({ tmdbId, season, episode }) =>
      `https://peachify.top/embed/tv/${tmdbId}/${season}/${episode}`,
  },
  {
    id: "primesrc",
    name: "PrimeSRC",
    displayName: "Server 14 • PrimeSRC",
    badge: "1080p • Reliable",
    quality: "1080p",
    speed: "Fast",
    description: "Primary source embed with reliable streaming infrastructure",
    getMovieUrl: ({ tmdbId }) =>
      `https://primesrc.me/embed/movie/${tmdbId}`,
    getTvUrl: ({ tmdbId, season, episode }) =>
      `https://primesrc.me/embed/tv/${tmdbId}/${season}/${episode}`,
  },
  {
    id: "smashystream",
    name: "SmashyStream",
    displayName: "Server 15 • SmashyStream",
    badge: "1080p • API",
    quality: "1080p",
    speed: "Fast",
    description: "Multi-source streaming API with wide content coverage",
    getMovieUrl: ({ tmdbId }) =>
      `https://api.smashystream.top/embed/movie/${tmdbId}`,
    getTvUrl: ({ tmdbId, season, episode }) =>
      `https://api.smashystream.top/embed/tv/${tmdbId}/${season}/${episode}`,
  },
  {
    id: "spenembed",
    name: "SpenEmbed",
    displayName: "Server 16 • SpenEmbed",
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
    id: "superembed",
    name: "SuperEmbed",
    displayName: "Server 17 • SuperEmbed",
    badge: "1080p • Multi-Server",
    quality: "1080p",
    speed: "Stable",
    description: "Multi-server auto-embed with IMDB/TMDB support and 10+ sources",
    getMovieUrl: ({ tmdbId }) =>
      `https://www.superembed.stream/e?video_id=${tmdbId}&tmdb=1`,
    getTvUrl: ({ tmdbId, season, episode }) =>
      `https://www.superembed.stream/e?video_id=${tmdbId}&tmdb=1&s=${season}&e=${episode}`,
  },
  {
    id: "streamvault",
    name: "StreamVault",
    displayName: "Server 18 • StreamVault",
    badge: "1080p • Vault",
    quality: "1080p",
    speed: "Fast",
    description: "Vaulted streaming source with high uptime and fast loading",
    getMovieUrl: ({ tmdbId }) =>
      `https://streamvaultsrc.click/embed/movie/${tmdbId}`,
    getTvUrl: ({ tmdbId, season, episode }) =>
      `https://streamvaultsrc.click/embed/tv/${tmdbId}/${season}/${episode}`,
  },
  {
    id: "stellar",
    name: "Stellar",
    displayName: "Server 19 • Stellar",
    badge: "4K • Ad-Free",
    quality: "4K",
    speed: "Ultra",
    description: "Ad-free 4K player with autoplay, poster art, and event API",
    getMovieUrl: ({ tmdbId }) =>
      `https://stellar.rip/en/watch/embed/movie/${tmdbId}?autoPlay=true`,
    getTvUrl: ({ tmdbId, season, episode }) =>
      `https://stellar.rip/en/watch/embed/tv/${tmdbId}-${season}-${episode}?autoPlay=true&nextButton=true`,
  },
  {
    id: "tryembed",
    name: "TryEmbed",
    displayName: "Server 20 • TryEmbed",
    badge: "HD • Simple",
    quality: "HD",
    speed: "Stable",
    description: "Simple and straightforward embed player for quick streaming",
    getMovieUrl: ({ tmdbId }) =>
      `https://tryembed.us.cc/embed/movie/${tmdbId}`,
    getTvUrl: ({ tmdbId, season, episode }) =>
      `https://tryembed.us.cc/embed/tv/${tmdbId}/${season}/${episode}`,
  },
  {
    id: "velarium",
    name: "Velarium",
    displayName: "Server 21 • Velarium",
    badge: "1080p • Modern",
    quality: "1080p",
    speed: "Fast",
    description: "Modern streaming player with sleek design and fast CDN",
    getMovieUrl: ({ tmdbId }) =>
      `https://velarium.cc/embed/movie/${tmdbId}`,
    getTvUrl: ({ tmdbId, season, episode }) =>
      `https://velarium.cc/embed/tv/${tmdbId}/${season}/${episode}`,
  },
  {
    id: "vidapi-ru",
    name: "VidAPI.ru",
    displayName: "Server 22 • VidAPI.ru",
    badge: "1080p • RU Mirror",
    quality: "1080p",
    speed: "Stable",
    description: "Russian-hosted mirror with wide movie and TV coverage",
    getMovieUrl: ({ tmdbId }) =>
      `https://vidapi.ru/embed/movie/${tmdbId}`,
    getTvUrl: ({ tmdbId, season, episode }) =>
      `https://vidapi.ru/embed/tv/${tmdbId}/${season}/${episode}`,
  },
  {
    id: "vidapi-xyz",
    name: "VidAPI",
    displayName: "Server 23 • VidAPI",
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
    id: "viduki",
    name: "Viduki",
    displayName: "Server 24 • Viduki",
    badge: "4K • AI Upscaled",
    quality: "4K",
    speed: "Fast",
    description: "AI-upscaled 4K streaming with enhanced visual quality",
    getMovieUrl: ({ tmdbId }) =>
      `https://www.viduki.net/embed/movie/${tmdbId}`,
    getTvUrl: ({ tmdbId, season, episode }) =>
      `https://www.viduki.net/embed/tv/${tmdbId}/${season}/${episode}`,
  },
  {
    id: "vidcore",
    name: "VidCore",
    displayName: "Server 25 • VidCore",
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
    displayName: "Server 26 • VidCore.org",
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
    id: "vidcorn",
    name: "Vidcorn",
    displayName: "Server 27 • Vidcorn",
    badge: "HD • Lightweight",
    quality: "HD",
    speed: "Fast",
    description: "Lightweight embed player with fast content delivery",
    getMovieUrl: ({ tmdbId }) =>
      `https://vidcorn.cfd/embed/movie/${tmdbId}`,
    getTvUrl: ({ tmdbId, season, episode }) =>
      `https://vidcorn.cfd/embed/tv/${tmdbId}/${season}/${episode}`,
  },
  {
    id: "vidfast",
    name: "VidFast",
    displayName: "Server 28 • VidFast",
    badge: "1080p • Multi-Mirror",
    quality: "1080p",
    speed: "Ultra",
    description: "Ultra-fast streaming with 7 mirror domains for max uptime",
    getMovieUrl: ({ tmdbId }) =>
      `https://vidfast.pro/embed/movie/${tmdbId}`,
    getTvUrl: ({ tmdbId, season, episode }) =>
      `https://vidfast.pro/embed/tv/${tmdbId}/${season}/${episode}`,
  },
  {
    id: "vidflix",
    name: "VidFlix",
    displayName: "Server 29 • VidFlix",
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
    id: "vidlink",
    name: "VidLink",
    displayName: "Server 30 • VidLink",
    badge: "1080p • Customizable",
    quality: "1080p",
    speed: "Ultra",
    description: "Biggest streaming API with customizable player and JW Player support",
    getMovieUrl: ({ tmdbId }) =>
      `https://vidlink.pro/movie/${tmdbId}`,
    getTvUrl: ({ tmdbId, season, episode }) =>
      `https://vidlink.pro/tv/${tmdbId}/${season}/${episode}`,
  },
  {
    id: "vidlove",
    name: "Vidlove",
    displayName: "Server 31 • Vidlove",
    badge: "HD • Smooth",
    quality: "HD",
    speed: "Fast",
    description: "Smooth streaming experience with clean embedded player",
    getMovieUrl: ({ tmdbId }) =>
      `https://vidlove.cc/embed/movie/${tmdbId}`,
    getTvUrl: ({ tmdbId, season, episode }) =>
      `https://vidlove.cc/embed/tv/${tmdbId}/${season}/${episode}`,
  },
  {
    id: "vidhawk",
    name: "VidHawk",
    displayName: "Server 32 • VidHawk",
    badge: "HD • Hawk",
    quality: "HD",
    speed: "Fast",
    description: "Hawk-eye streaming player with rapid content loading",
    getMovieUrl: ({ tmdbId }) =>
      `https://vidhawk.buzz/embed/movie/${tmdbId}`,
    getTvUrl: ({ tmdbId, season, episode }) =>
      `https://vidhawk.buzz/embed/tv/${tmdbId}/${season}/${episode}`,
  },
  {
    id: "vidnest",
    name: "VidNest",
    displayName: "Server 33 • VidNest",
    badge: "1080p • Nest",
    quality: "1080p",
    speed: "Stable",
    description: "Nested multi-source player with fallback stream support",
    getMovieUrl: ({ tmdbId }) =>
      `https://vidnest.fun/embed/movie/${tmdbId}`,
    getTvUrl: ({ tmdbId, season, episode }) =>
      `https://vidnest.fun/embed/tv/${tmdbId}/${season}/${episode}`,
  },
  {
    id: "vidrock",
    name: "vidrock",
    displayName: "Server 34 • vidrock",
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
    id: "vidrift",
    name: "VidRift",
    displayName: "Server 35 • VidRift",
    badge: "1080p • Rift",
    quality: "1080p",
    speed: "Fast",
    description: "Fast rift-edge streaming with adaptive bitrate control",
    getMovieUrl: ({ tmdbId }) =>
      `https://vidrift.net/embed/movie/${tmdbId}`,
    getTvUrl: ({ tmdbId, season, episode }) =>
      `https://vidrift.net/embed/tv/${tmdbId}/${season}/${episode}`,
  },
  {
    id: "vidsrcme",
    name: "VidSrc.me",
    displayName: "Server 36 • VidSrc.me",
    badge: "1080p • Multi-Domain",
    quality: "1080p",
    speed: "Ultra",
    description: "Multi-domain streaming with 8 mirror URLs for max availability",
    getMovieUrl: ({ tmdbId, imdbId }) =>
      `https://vidsrcme.ru/embed/movie/${imdbId || tmdbId}`,
    getTvUrl: ({ tmdbId, imdbId, season, episode }) =>
      `https://vidsrcme.ru/embed/tv/${imdbId || tmdbId}/${season}/${episode}`,
  },
  {
    id: "vidsrcto",
    name: "VidSrc.to",
    displayName: "Server 37 • VidSrc.to",
    badge: "1080p • Next-Gen",
    quality: "1080p",
    speed: "Ultra",
    description: "Next-gen video streaming API with IMDB/TMDB support and custom subs",
    getMovieUrl: ({ tmdbId, imdbId }) =>
      `https://vidsrc.to/embed/movie/${imdbId || tmdbId}`,
    getTvUrl: ({ tmdbId, imdbId, season, episode }) =>
      `https://vidsrc.to/embed/tv/${imdbId || tmdbId}/${season}/${episode}`,
  },
  {
    id: "vidup",
    name: "VidUP",
    displayName: "Server 38 • VidUP",
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
    id: "vidstuck",
    name: "VidStuck",
    displayName: "Server 39 • VidStuck",
    badge: "HD • Sticky",
    quality: "HD",
    speed: "Stable",
    description: "Persistent streaming player that keeps your session alive",
    getMovieUrl: ({ tmdbId }) =>
      `https://vidstuck.xyz/embed/movie/${tmdbId}`,
    getTvUrl: ({ tmdbId, season, episode }) =>
      `https://vidstuck.xyz/embed/tv/${tmdbId}/${season}/${episode}`,
  },
  {
    id: "vidy",
    name: "Vidy",
    displayName: "Server 40 • Vidy",
    badge: "4K • Embed",
    quality: "4K",
    speed: "Ultra",
    description: "4K embed player with postMessage events, color themes, and autoplay",
    getMovieUrl: ({ tmdbId }) =>
      `https://vidy.st/movie/${tmdbId}?autoplay=true`,
    getTvUrl: ({ tmdbId, season, episode }) =>
      `https://vidy.st/tv/${tmdbId}/${season}/${episode}?nextEpisode=true&episodeSelector=true`,
  },
  {
    id: "vidzee",
    name: "Vidzee",
    displayName: "Server 41 • Vidzee",
    badge: "HD • Quick",
    quality: "HD",
    speed: "Fast",
    description: "Quick-loading streaming embed with minimal setup required",
    getMovieUrl: ({ tmdbId }) =>
      `https://vidzee.wtf/embed/movie/${tmdbId}`,
    getTvUrl: ({ tmdbId, season, episode }) =>
      `https://vidzee.wtf/embed/tv/${tmdbId}/${season}/${episode}`,
  },
  {
    id: "vidzen",
    name: "Vidzen",
    displayName: "Server 42 • Vidzen",
    badge: "1080p • Zen",
    quality: "1080p",
    speed: "Stable",
    description: "Zen-mode player with distraction-free video streaming",
    getMovieUrl: ({ tmdbId }) =>
      `https://vidzen.fun/embed/movie/${tmdbId}`,
    getTvUrl: ({ tmdbId, season, episode }) =>
      `https://vidzen.fun/embed/tv/${tmdbId}/${season}/${episode}`,
  },
  {
    id: "zoryva",
    name: "ZoryvaX",
    displayName: "Server 43 • ZoryvaX",
    badge: "1080p • API",
    quality: "1080p",
    speed: "Fast",
    description: "ZoryvaX embed API for movies, TV shows, and anime content",
    getMovieUrl: ({ tmdbId }) =>
      `https://zoryva.me/embed/movie/${tmdbId}`,
    getTvUrl: ({ tmdbId, season, episode }) =>
      `https://zoryva.me/embed/tv/${tmdbId}/${season}/${episode}`,
  },
  {
    id: "zxcstream",
    name: "ZXCSTREAM",
    displayName: "Server 44 • ZXCSTREAM",
    badge: "HD • Stream",
    quality: "HD",
    speed: "Stable",
    description: "Straightforward streaming service for movies and TV shows",
    getMovieUrl: ({ tmdbId }) =>
      `https://www.zxcstream.xyz/embed/movie/${tmdbId}`,
    getTvUrl: ({ tmdbId, season, episode }) =>
      `https://www.zxcstream.xyz/embed/tv/${tmdbId}/${season}/${episode}`,
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
