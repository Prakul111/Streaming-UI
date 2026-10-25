/**
 * Evaluates streaming server URL templates with dynamic movie / TV show identifiers.
 *
 * Supported placeholders:
 * - `{tmdbId}`: The TMDB Movie / TV ID (e.g. 550)
 * - `{imdbId}`: The IMDb ID (e.g. tt0137523) or fallback to tmdbId
 * - `{season}`: Season number for TV shows (default: 1)
 * - `{episode}`: Episode number for TV shows (default: 1)
 */
export interface UrlTemplateParams {
  tmdbId: number | string
  imdbId?: string | null
  season?: number
  episode?: number
}

/**
 * Validates whether a URL pattern is syntactically sound and uses http or https.
 */
export function isValidUrlPattern(pattern: string): { valid: boolean; error?: string } {
  if (!pattern || typeof pattern !== 'string') {
    return { valid: false, error: 'URL pattern cannot be empty.' }
  }

  const trimmed = pattern.trim()

  if (!trimmed.startsWith('https://') && !trimmed.startsWith('http://')) {
    return { valid: false, error: 'URL must start with https:// or http://' }
  }

  // Prevent dangerous protocol injections
  if (/^(javascript|data|vbscript|file):/i.test(trimmed)) {
    return { valid: false, error: 'Insecure URL protocol is not permitted.' }
  }

  // Check that at least {tmdbId} or {imdbId} is included
  if (!trimmed.includes('{tmdbId}') && !trimmed.includes('{imdbId}')) {
    return {
      valid: false,
      error: 'Pattern must include either {tmdbId} or {imdbId} placeholder.',
    }
  }

  return { valid: true }
}

/**
 * Replaces placeholders in the template with runtime movie or TV parameters.
 */
export function evaluateServerUrl(template: string, params: UrlTemplateParams): string {
  if (!template) return ''

  const tmdbStr = String(params.tmdbId || '')
  const imdbStr = params.imdbId && params.imdbId.trim().length > 0 ? params.imdbId.trim() : tmdbStr
  const seasonStr = String(params.season ?? 1)
  const episodeStr = String(params.episode ?? 1)

  return template
    .replace(/\{tmdbId\}/gi, tmdbStr)
    .replace(/\{imdbId\}/gi, imdbStr)
    .replace(/\{season\}/gi, seasonStr)
    .replace(/\{episode\}/gi, episodeStr)
    .trim()
}

/**
 * Standard test fixtures for validating embed URL templates in sandbox.
 */
export const EMBED_TEST_FIXTURES = {
  movie: {
    title: 'Fight Club (1999)',
    tmdbId: 550,
    imdbId: 'tt0137523',
    year: '1999',
  },
  tv: {
    title: 'Breaking Bad (S1 E1)',
    tmdbId: 1396,
    imdbId: 'tt0903747',
    season: 1,
    episode: 1,
  },
} as const
