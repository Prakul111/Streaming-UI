export interface WatchHistoryItem {
  id: string // e.g. "movie_550" or "tv_1399"
  tmdbId: number
  mediaType: "movie" | "tv"
  title: string
  posterPath: string | null
  backdropPath: string | null
  overview?: string
  voteAverage?: number
  releaseDate?: string
  // TV show specific
  season?: number
  episode?: number
  episodeTitle?: string
  totalEpisodes?: number
  // Playback Context
  lastWatchedAt: number // Date.now() timestamp
  serverId?: string // ID of streaming server used
}

const STORAGE_KEY = "streaming_ui_watch_history"
const MAX_HISTORY_ITEMS = 60
export const WATCH_HISTORY_UPDATED_EVENT = "streaming_ui_watch_history_updated"

/**
 * Retrieves the current watch history from localStorage.
 */
export function getWatchHistory(): WatchHistoryItem[] {
  if (typeof window === "undefined" || !window.localStorage) {
    return []
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
  } catch (error) {
    console.warn("Failed to read watch history from localStorage:", error)
    return []
  }
}

/**
 * Saves or updates a watch history entry.
 * TV shows update the existing series entry with latest season/episode.
 */
export function saveWatchHistoryItem(
  item: Omit<WatchHistoryItem, "id" | "lastWatchedAt"> & {
    id?: string
    lastWatchedAt?: number
  }
): WatchHistoryItem {
  const current = getWatchHistory()
  const compositeId = item.id || `${item.mediaType}_${item.tmdbId}`
  const now = item.lastWatchedAt || Date.now()

  const completeItem: WatchHistoryItem = {
    ...item,
    id: compositeId,
    lastWatchedAt: now,
  }

  // Filter out any existing item with the same composite ID
  const filtered = current.filter((existing) => existing.id !== compositeId)

  // Place the latest watched item at the front
  const updated = [completeItem, ...filtered].slice(0, MAX_HISTORY_ITEMS)

  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      window.dispatchEvent(new CustomEvent(WATCH_HISTORY_UPDATED_EVENT, { detail: updated }))
    }
  } catch (error) {
    console.warn("Failed to write watch history to localStorage:", error)
  }

  return completeItem
}

/**
 * Removes an item from watch history by composite ID.
 */
export function removeWatchHistoryItem(id: string): void {
  const current = getWatchHistory()
  const updated = current.filter((item) => item.id !== id)

  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      window.dispatchEvent(new CustomEvent(WATCH_HISTORY_UPDATED_EVENT, { detail: updated }))
    }
  } catch (error) {
    console.warn("Failed to remove item from watch history:", error)
  }
}

/**
 * Clears the entire watch history.
 */
export function clearWatchHistory(): void {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.removeItem(STORAGE_KEY)
      window.dispatchEvent(new CustomEvent(WATCH_HISTORY_UPDATED_EVENT, { detail: [] }))
    }
  } catch (error) {
    console.warn("Failed to clear watch history:", error)
  }
}

/**
 * Finds a specific watch history record if available.
 */
export function getWatchHistoryItem(
  mediaType: "movie" | "tv",
  tmdbId: number
): WatchHistoryItem | undefined {
  const compositeId = `${mediaType}_${tmdbId}`
  const history = getWatchHistory()
  return history.find((item) => item.id === compositeId)
}
