import { useCallback, useState } from "react"

export interface FeatureFlags {
  sortBooks: boolean
  filterBooks: boolean
  addOwnBook: boolean
  bookTags: boolean
  readingProgressBars: boolean
  iReadToday: boolean
  sounds: boolean
  bookMeta: boolean
}

const STORAGE_KEY = "myBookBag.featureFlags"

const DEFAULTS: FeatureFlags = {
  sortBooks: true,
  filterBooks: true,
  addOwnBook: true,
  bookTags: true,
  readingProgressBars: true,
  iReadToday: true,
  sounds: true,
  bookMeta: false,
}

function loadFlags(): FeatureFlags {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULTS }
    const parsed = JSON.parse(raw) as Partial<FeatureFlags>
    // Merge with defaults so new flags get their default value on first load
    return { ...DEFAULTS, ...parsed }
  } catch {
    return { ...DEFAULTS }
  }
}

function saveFlags(flags: FeatureFlags): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(flags))
  } catch {
    // storage not available — graceful no-op
  }
}

export default function useFeatureFlags() {
  const [flags, setFlags] = useState<FeatureFlags>(loadFlags)

  const toggleFlag = useCallback((key: keyof FeatureFlags) => {
    setFlags((prev) => {
      const next = { ...prev, [key]: !prev[key] }
      saveFlags(next)
      return next
    })
  }, [])

  return { flags, toggleFlag }
}
