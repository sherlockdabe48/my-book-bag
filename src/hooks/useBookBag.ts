import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { Book } from "../types/book"
import { playShelfPlaceSound, playBagPlaceSound } from "../utils/sound"
import { Capacitor } from "@capacitor/core"
import { Filesystem, Directory } from "@capacitor/filesystem"
import { Share } from "@capacitor/share"

// ── Export / Import helpers ────────────────────────────────────────────────

export interface ExportPayload {
  version: 1
  exportedAt: string
  shelfBooks: Book[]
  bagBooks: Book[]
}

export function buildExportPayload(shelfBooks: Book[], bagBooks: Book[]): ExportPayload {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    shelfBooks,
    bagBooks,
  }
}

/** Download a JSON file to the user's device. */
export async function triggerJsonDownload(payload: ExportPayload) {
  const json     = JSON.stringify(payload, null, 2)
  const fileName = `my-book-bag-${new Date().toISOString().slice(0, 10)}.json`

  if (Capacitor.isNativePlatform()) {
    // On iOS: write to the Documents directory then open the share sheet
    await Filesystem.writeFile({
      path: fileName,
      data: json,
      directory: Directory.Documents,
      encoding: "utf8" as never,
    })
    const { uri } = await Filesystem.getUri({ path: fileName, directory: Directory.Documents })
    await Share.share({
      title: "MyBookBag export",
      url: uri,
      dialogTitle: "Save or share your book data",
    })
  } else {
    // On web: classic anchor-download
    const blob = new Blob([json], { type: "application/json" })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement("a")
    a.href     = url
    a.download = fileName
    a.click()
    URL.revokeObjectURL(url)
  }
}

/** Parse and basic-validate an imported JSON file. Returns null on failure. */
export function parseImportFile(raw: string): ExportPayload | null {
  try {
    const data = JSON.parse(raw) as ExportPayload
    if (data.version !== 1) return null
    if (!Array.isArray(data.shelfBooks) || !Array.isArray(data.bagBooks)) return null
    return data
  } catch {
    return null
  }
}

// ── Bag capacity tiers ─────────────────────────────────────────────────────
export const BAG_TIERS: { booksFinished: number; capacity: number; label: string }[] = [
  { booksFinished: 0,  capacity: 1,  label: "Starter Bag"  },
  { booksFinished: 1,  capacity: 2,  label: "Reader's Bag" },
  { booksFinished: 2,  capacity: 3,  label: "Bookworm Bag" },
  { booksFinished: 5,  capacity: 5,  label: "Scholar's Bag" },
  { booksFinished: 12, capacity: 7,  label: "Master's Bag"  },
]

export function getBagTier(totalFinished: number) {
  let tier = BAG_TIERS[0]
  for (const t of BAG_TIERS) {
    if (totalFinished >= t.booksFinished) tier = t
  }
  return tier
}

export function getNextTier(currentTierIndex: number) {
  return BAG_TIERS[currentTierIndex + 1] ?? null
}

// ── Shelf capacity tiers ───────────────────────────────────────────────────
export const SHELF_TIERS: {
  booksFinished: number
  booksWithNote: number
  capacity: number | null   // null = unlimited
  label: string
}[] = [
  { booksFinished: 0,  booksWithNote: 0,  capacity: 5,    label: "Small Shelf"    },
  { booksFinished: 3,  booksWithNote: 1,  capacity: 10,   label: "Reader's Shelf" },
  { booksFinished: 5,  booksWithNote: 3,  capacity: 20,   label: "Bookworm Shelf" },
  { booksFinished: 12, booksWithNote: 6,  capacity: 40,   label: "Scholar's Shelf" },
  { booksFinished: 25, booksWithNote: 12, capacity: null, label: "Master's Shelf"  },
]

export function getShelfTier(totalFinished: number, totalWithNote: number) {
  let tier = SHELF_TIERS[0]
  for (const t of SHELF_TIERS) {
    if (totalFinished >= t.booksFinished && totalWithNote >= t.booksWithNote) tier = t
  }
  return tier
}

export function getNextShelfTier(totalFinished: number, totalWithNote: number) {
  return SHELF_TIERS.find(
    (t) => totalFinished < t.booksFinished || totalWithNote < t.booksWithNote
  ) ?? null
}

const BAG_BOOKS_KEY   = "myBookBag.bagBooks"
const SHELF_BOOKS_KEY = "myBookBag.shelfBooks"
const COVERS_KEY      = "myBookBag.covers"
const BAG_TIER_INDEX_KEY = "myBookBag.bagTierIndex"

// ── Reading streak ─────────────────────────────────────────────────────────

/**
 * Returns the current reading streak in days.
 * A streak counts consecutive calendar days (ending today or yesterday) on
 * which at least one book was read (i.e. has that date as its `lastReadAt`).
 */
export function computeStreak(books: Book[]): number {
  const dates = new Set(
    books
      .map((b) => b.lastReadAt)
      .filter((d) => !!d),
  )
  if (dates.size === 0) return 0

  const today     = new Date()
  const todayStr  = today.toISOString().slice(0, 10)
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const yestStr = yesterday.toISOString().slice(0, 10)

  // Streak is only alive if there's a read today or yesterday
  if (!dates.has(todayStr) && !dates.has(yestStr)) return 0

  let streak  = 0
  const cursor = new Date(dates.has(todayStr) ? today : yesterday)
  while (true) {
    const key = cursor.toISOString().slice(0, 10)
    if (!dates.has(key)) break
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

// ── localStorage helpers ───────────────────────────────────────────────────

/** Persist a value; silently drops the write on QuotaExceededError. */
function safeSet(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
  } catch {
    // Storage full — nothing we can do without losing data
  }
}

/** Load covers map from localStorage. */
function loadCovers(): Record<string, string> {
  try {
    const raw = localStorage.getItem(COVERS_KEY)
    return raw ? (JSON.parse(raw) as Record<string, string>) : {}
  } catch {
    return {}
  }
}

/**
 * Save covers map. If it exceeds quota, drop data-URL entries (uploaded
 * images) one by one until it fits, then fall back to dropping all covers.
 */
function saveCovers(covers: Record<string, string>) {
  const copy = { ...covers }
  // First pass: try as-is
  try {
    localStorage.setItem(COVERS_KEY, JSON.stringify(copy))
    return
  } catch { /* fall through */ }

  // Second pass: drop data-URL covers (base64 blobs) largest-first
  const dataEntries = Object.entries(copy)
    .filter(([, v]) => v.startsWith("data:"))
    .sort(([, a], [, b]) => b.length - a.length)

  for (const [id] of dataEntries) {
    delete copy[id]
    try {
      localStorage.setItem(COVERS_KEY, JSON.stringify(copy))
      return
    } catch { /* keep trimming */ }
  }

  // Last resort: clear covers entirely
  try { localStorage.removeItem(COVERS_KEY) } catch { /* ignore */ }
}

/** Strip imageURL from a book before persisting (stored separately). */
function stripCover(book: Book): Omit<Book, "imageURL"> & { imageURL: "" } {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { imageURL: _, ...rest } = book
  return { ...rest, imageURL: "" }
}

/** Reattach covers to a list of books using the covers map. */
function attachCovers(books: Book[], covers: Record<string, string>): Book[] {
  return books.map((b) => ({ ...b, imageURL: covers[b.id] ?? b.imageURL }))
}

// ── Hook ───────────────────────────────────────────────────────────────────

export default function useBookBag(searchBooks: Book[]) {
  const [bagBooks, setBagBooks]     = useState<Book[]>([])
  const [shelfBooks, setShelfBooks] = useState<Book[]>([])
  // Mirror of shelfBooks kept in a ref so callbacks can always read the
  // latest value without stale closure issues.
  const shelfBooksRef = useRef<Book[]>([])
  const [recentlyAddedBagBookId, setRecentlyAddedBagBookId] = useState<string | null>(null)
  const [recentlyAddedShelfBookId, setRecentlyAddedShelfBookId] = useState<string | null>(null)
  const [shelfHighLight, setShelfHighLight] = useState(false)
  // Tracks whether the initial localStorage load has completed
  const loadedRef = useRef(false)
  // Tracks the last known bag capacity so we can detect upgrades; stored in a
  // ref to avoid scheduling an extra render when we update it.
  const prevCapacityRef = useRef<number | null>(null)

  // Explicit user-unlocked bag tier index (defaults to 0: Starter Bag)
  const [bagTierIndex, setBagTierIndex] = useState<number>(0)

  // ── Derived capacity inputs ──────────────────────────
  const totalFinished = useMemo(() => {
    const all = [...bagBooks, ...shelfBooks]
    return all.reduce((sum, b) => sum + (b.timesRead ?? 0), 0)
  }, [bagBooks, shelfBooks])

  const totalWithNote = useMemo(() => {
    const all = [...bagBooks, ...shelfBooks]
    return all.filter((b) => b.note && b.note.trim().length > 0).length
  }, [bagBooks, shelfBooks])

  const readingStreak = useMemo(() => {
    return computeStreak([...bagBooks, ...shelfBooks])
  }, [bagBooks, shelfBooks])

  // ── Bag tier ─────────────────────────────────────────
  const bagTier     = BAG_TIERS[bagTierIndex] ?? BAG_TIERS[0]
  const bagCapacity = bagTier.capacity

  // Detect capacity upgrade (after initial load).
  // Compare synchronously against the ref so the flag is true on the exact
  // render where the capacity first increases, then update the ref.
  const bagUpgraded =
    loadedRef.current &&
    prevCapacityRef.current !== null &&
    bagCapacity > prevCapacityRef.current
  useEffect(() => {
    if (!loadedRef.current) return
    prevCapacityRef.current = bagCapacity
  }, [bagCapacity])

  // ── Shelf tier ────────────────────────────────────────
  const shelfTier     = useMemo(() => getShelfTier(totalFinished, totalWithNote), [totalFinished, totalWithNote])
  const shelfCapacity = shelfTier.capacity   // null = unlimited

  // ── Load from localStorage on mount ─────────────────────
  useEffect(() => {
    const covers    = loadCovers()
    const bagJson   = localStorage.getItem(BAG_BOOKS_KEY)
    const shelfJson = localStorage.getItem(SHELF_BOOKS_KEY)
    const tierJson  = localStorage.getItem(BAG_TIER_INDEX_KEY)
    const loadedBag   = bagJson   ? attachCovers(JSON.parse(bagJson)   as Book[], covers) : []
    const loadedShelf = shelfJson ? attachCovers(JSON.parse(shelfJson) as Book[], covers) : []
    if (bagJson)   setBagBooks(loadedBag)
    if (shelfJson) setShelfBooks(loadedShelf)

    let initialTierIndex = 0
    if (tierJson !== null) {
      const parsed = parseInt(tierJson, 10)
      if (!isNaN(parsed) && parsed >= 0 && parsed < BAG_TIERS.length) {
        initialTierIndex = parsed
      }
    }
    setBagTierIndex(initialTierIndex)
    prevCapacityRef.current = (BAG_TIERS[initialTierIndex] ?? BAG_TIERS[0]).capacity

    loadedRef.current = true
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Keep the ref in sync so callbacks can read latest shelf state
  useEffect(() => { shelfBooksRef.current = shelfBooks }, [shelfBooks])

  // ── Persist to localStorage on every change ─────────────
  // Skip the first render — state is still the empty initial value at that
  // point and would overwrite the data we just read from localStorage.
  useEffect(() => {
    if (!loadedRef.current) return

    // Save books without imageURL (covers saved separately)
    safeSet(BAG_BOOKS_KEY,        JSON.stringify(bagBooks.map(stripCover)))
    safeSet(SHELF_BOOKS_KEY,      JSON.stringify(shelfBooks.map(stripCover)))
    safeSet(BAG_TIER_INDEX_KEY,   String(bagTierIndex))

    // Build and save the unified covers map
    const covers: Record<string, string> = {}
    for (const b of [...bagBooks, ...shelfBooks]) {
      if (b.imageURL) covers[b.id] = b.imageURL
    }
    saveCovers(covers)
  }, [bagBooks, shelfBooks])

  // ── Actions ─────────────────────────────────────────────
  const handleActiveShelfHighLight = useCallback(() => {
    setShelfHighLight(true)
    setTimeout(() => setShelfHighLight(false), 1500)
  }, [])

  const triggerBagBookLanding = useCallback((id: string) => {
    setRecentlyAddedBagBookId(id)
    playBagPlaceSound()
    setTimeout(() => {
      setRecentlyAddedBagBookId((curr) => (curr === id ? null : curr))
    }, 1200)
  }, [])

  const handleAddToBagFromShelf = useCallback((id: string) => {
    const book = shelfBooksRef.current.find((b) => b.id === id)
    if (!book) return
    setBagBooks((bag) => {
      if (bag.length >= bagCapacity) return bag   // strict block — bag full
      setShelfBooks((shelf) => shelf.filter((b) => b.id !== id))
      triggerBagBookLanding(id)
      return [...bag, book]
    })
  }, [bagCapacity, triggerBagBookLanding])

  const triggerShelfBookLanding = useCallback((id: string) => {
    setRecentlyAddedShelfBookId(id)
    playShelfPlaceSound()
    setTimeout(() => {
      setRecentlyAddedShelfBookId((curr) => (curr === id ? null : curr))
    }, 1200)
  }, [])

  const handleMoveToShelfFromSearch = useCallback((id: string) => {
    const book = searchBooks.find((b) => b.id === id)
    if (!book) return
    setShelfBooks((shelf) => {
      if (shelf.some((b) => b.id === id)) return shelf
      if (shelfCapacity !== null && shelf.length >= shelfCapacity) return shelf  // shelf full
      triggerShelfBookLanding(id)
      return [...shelf, book]
    })
  }, [searchBooks, shelfCapacity, triggerShelfBookLanding])

  const handleMoveToShelfFromBag = useCallback((id: string, note?: string) => {
    setBagBooks((bag) => {
      const book = bag.find((b) => b.id === id)
      if (!book) return bag
      // Check shelf capacity before moving
      if (shelfCapacity !== null && shelfBooks.length >= shelfCapacity) return bag
      const isFinished = Number(book.currentPage) === Number(book.allPages)
      const isStarted  = Number(book.currentPage) > 1
      const updated: Book = {
        ...book,
        status: isFinished ? "finish" : isStarted ? "reading" : book.status,
        note: note ?? book.note,
      }
      triggerShelfBookLanding(id)
      setShelfBooks((shelf) => [...shelf, updated])
      return bag.filter((b) => b.id !== id)
    })
  }, [shelfCapacity, shelfBooks.length, triggerShelfBookLanding])

  const handleBagBookProgressChange = useCallback((id: string, currentPage: number) => {
    const today = new Date().toISOString().slice(0, 10)
    setBagBooks((bag) => {
      const updated = bag.map((b) => (b.id !== id ? b : { ...b, currentPage, lastReadAt: today }))
      // Float the just-read book to the top
      const idx = updated.findIndex((b) => b.id === id)
      if (idx > 0) {
        const [book] = updated.splice(idx, 1)
        updated.unshift(book)
      }
      return updated
    })
  }, [])

  const handleLogReadingSession = useCallback((id: string) => {
    const today = new Date().toISOString().slice(0, 10)
    setBagBooks((bag) => {
      const updated = bag.map((b) => (b.id !== id ? b : { ...b, lastReadAt: today }))
      const idx = updated.findIndex((b) => b.id === id)
      if (idx > 0) {
        const [book] = updated.splice(idx, 1)
        updated.unshift(book)
      }
      return updated
    })
  }, [])

  const handleBookDeleteFromShelf = useCallback((id: string) => {
    setShelfBooks((shelf) => shelf.filter((b) => b.id !== id))
  }, [])

  const handleBookChangeCover = useCallback((id: string, imageURL: string) => {
    setShelfBooks((shelf) => shelf.map((b) => (b.id !== id ? b : { ...b, imageURL })))
    setBagBooks((bag) => bag.map((b) => (b.id !== id ? b : { ...b, imageURL })))
  }, [])

  const handleBookChangePages = useCallback((id: string, allPages: number) => {
    setShelfBooks((shelf) => shelf.map((b) => (b.id !== id ? b : { ...b, allPages })))
    setBagBooks((bag) => bag.map((b) => (b.id !== id ? b : { ...b, allPages })))
  }, [])

  // Sets pages and moves to bag atomically — used when the user enters a page
  // count as part of the "Add to Bag" flow, so the updated value is never stale.
  const handleAddToBagWithPages = useCallback((id: string, allPages: number) => {
    let book: Book | undefined
    setShelfBooks((shelf) => {
      book = shelf.find((b) => b.id === id)
      return shelf.filter((b) => b.id !== id)
    })
    setBagBooks((bag) => {
      if (!book || bag.length >= bagCapacity) return bag
      triggerBagBookLanding(id)
      return [...bag, { ...book, allPages }]
    })
  }, [bagCapacity, triggerBagBookLanding])

  const handleBookChangeTitle = useCallback((id: string, title: string) => {
    setShelfBooks((shelf) => shelf.map((b) => (b.id !== id ? b : { ...b, title })))
    setBagBooks((bag) => bag.map((b) => (b.id !== id ? b : { ...b, title })))
  }, [])

  const handleBookChangeAuthor = useCallback((id: string, author: string) => {
    setShelfBooks((shelf) => shelf.map((b) => (b.id !== id ? b : { ...b, author })))
    setBagBooks((bag) => bag.map((b) => (b.id !== id ? b : { ...b, author })))
  }, [])

  const handleBookChangeNote = useCallback((id: string, note: string) => {
    setShelfBooks((shelf) => shelf.map((b) => (b.id !== id ? b : { ...b, note })))
    setBagBooks((bag) => bag.map((b) => (b.id !== id ? b : { ...b, note })))
  }, [])

  const handleBookChangeRecommendedBy = useCallback((id: string, recommendedBy: string) => {
    setShelfBooks((shelf) => shelf.map((b) => (b.id !== id ? b : { ...b, recommendedBy })))
    setBagBooks((bag) => bag.map((b) => (b.id !== id ? b : { ...b, recommendedBy })))
  }, [])

  const handleBookChangeTags = useCallback((id: string, tags: string[]) => {
    setShelfBooks((shelf) => shelf.map((b) => (b.id !== id ? b : { ...b, tags })))
    setBagBooks((bag) => bag.map((b) => (b.id !== id ? b : { ...b, tags })))
  }, [])

  const handleIncrementTimesRead = useCallback((id: string) => {
    setBagBooks((bag) => bag.map((b) => (b.id !== id ? b : { ...b, timesRead: (b.timesRead ?? 0) + 1 })))
  }, [])

  const handleAddManualBook = useCallback((book: Book) => {
    setShelfBooks((shelf) => {
      if (shelf.some((b) => b.id === book.id)) return shelf
      if (shelfCapacity !== null && shelf.length >= shelfCapacity) return shelf  // shelf full
      triggerShelfBookLanding(book.id)
      return [...shelf, book]
    })
  }, [shelfCapacity, triggerShelfBookLanding])

  const handleAddBookToShelf = useCallback((book: Book) => {
    setShelfBooks((shelf) => {
      if (shelf.some((b) => b.id === book.id)) return shelf
      if (shelfCapacity !== null && shelf.length >= shelfCapacity) return shelf
      triggerShelfBookLanding(book.id)
      return [...shelf, book]
    })
  }, [shelfCapacity, triggerShelfBookLanding])

  // ── Export / Import ──────────────────────────────────────────────────────

  const handleExportData = useCallback(() => {
    void triggerJsonDownload(buildExportPayload(shelfBooks, bagBooks))
  }, [shelfBooks, bagBooks])

  const handleUpgradeBag = useCallback(() => {
    setBagTierIndex((prev) => {
      const nextIndex = prev + 1
      if (nextIndex < BAG_TIERS.length) {
        const next = BAG_TIERS[nextIndex]
        if (totalFinished >= next.booksFinished) {
          return nextIndex
        }
      }
      return prev
    })
  }, [totalFinished])

  const handleImportData = useCallback((raw: string): boolean => {
    const payload = parseImportFile(raw)
    if (!payload) return false
    setShelfBooks(payload.shelfBooks)
    setBagBooks(payload.bagBooks)
    return true
  }, [])

  return {
    bagBooks,
    shelfBooks,
    recentlyAddedBagBookId,
    recentlyAddedShelfBookId,
    shelfHighLight,
    bagCapacity,
    bagUpgraded,
    bagTier,
    shelfCapacity,
    shelfTier,
    totalFinished,
    totalWithNote,
    readingStreak,
    handleActiveShelfHighLight,
    handleAddToBagFromShelf,
    handleAddToBagWithPages,
    handleAddBookToShelf,
    handleMoveToShelfFromSearch,
    handleMoveToShelfFromBag,
    handleBagBookProgressChange,
    handleBookDeleteFromShelf,
    handleBookChangeCover,
    handleBookChangePages,
    handleBookChangeTitle,
    handleBookChangeAuthor,
    handleBookChangeNote,
    handleBookChangeRecommendedBy,
    handleBookChangeTags,
    handleIncrementTimesRead,
    handleLogReadingSession,
    handleAddManualBook,
    handleExportData,
    handleImportData,
    handleUpgradeBag,
  }
}
