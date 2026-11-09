import { useState, useEffect, useCallback } from "react"
import {
  type WatchHistoryItem,
  getWatchHistory,
  saveWatchHistoryItem,
  removeWatchHistoryItem,
  clearWatchHistory,
  WATCH_HISTORY_UPDATED_EVENT,
} from "@/lib/watch-history"

export function useWatchHistory() {
  const [history, setHistory] = useState<WatchHistoryItem[]>(() => getWatchHistory())

  useEffect(() => {
    const handleCustomUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<WatchHistoryItem[]>
      if (customEvent.detail) {
        setHistory(customEvent.detail)
      } else {
        setHistory(getWatchHistory())
      }
    }

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "streaming_ui_watch_history") {
        setHistory(getWatchHistory())
      }
    }

    window.addEventListener(WATCH_HISTORY_UPDATED_EVENT, handleCustomUpdate)
    window.addEventListener("storage", handleStorageChange)

    return () => {
      window.removeEventListener(WATCH_HISTORY_UPDATED_EVENT, handleCustomUpdate)
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [])

  const add = useCallback(
    (
      item: Omit<WatchHistoryItem, "id" | "lastWatchedAt"> & {
        id?: string
        lastWatchedAt?: number
      }
    ) => {
      return saveWatchHistoryItem(item)
    },
    []
  )

  const remove = useCallback((id: string) => {
    removeWatchHistoryItem(id)
  }, [])

  const clear = useCallback(() => {
    clearWatchHistory()
  }, [])

  return {
    history,
    add,
    remove,
    clear,
    hasHistory: history.length > 0,
  }
}
