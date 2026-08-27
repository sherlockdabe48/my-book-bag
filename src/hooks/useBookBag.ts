import { useCallback, useEffect, useRef, useState } from "react"
import type { Book } from "../types/book"

const BAG_BOOKS_KEY   = "myBookBag.bagBooks"
const SHELF_BOOKS_KEY = "myBookBag.shelfBooks"
const COVERS_KEY      = "myBookBag.covers"

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
  const [shelfHighLight, setShelfHighLight] = useState(false)
  // Tracks whether the initial localStorage load has completed
  const loadedRef = useRef(false)

  // ── Load from localStorage on mount ─────────────────────
  useEffect(() => {
    const covers    = loadCovers()
    const bagJson   = localStorage.getItem(BAG_BOOKS_KEY)
    const shelfJson = localStorage.getItem(SHELF_BOOKS_KEY)
    if (bagJson)   setBagBooks(attachCovers(JSON.parse(bagJson) as Book[], covers))
    if (shelfJson) setShelfBooks(attachCovers(JSON.parse(shelfJson) as Book[], covers))
    loadedRef.current = true
  }, [])

  // ── Persist to localStorage on every change ─────────────
  // Skip the first render — state is still the empty initial value at that
  // point and would overwrite the data we just read from localStorage.
  useEffect(() => {
    if (!loadedRef.current) return

    // Save books without imageURL (covers saved separately)
    safeSet(BAG_BOOKS_KEY,   JSON.stringify(bagBooks.map(stripCover)))
    safeSet(SHELF_BOOKS_KEY, JSON.stringify(shelfBooks.map(stripCover)))

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

  const handleAddToBagFromShelf = useCallback((id: string) => {
    setShelfBooks((shelf) => {
      const book = shelf.find((b) => b.id === id)
      if (!book) return shelf
      setBagBooks((bag) => [...bag, book])
      return shelf.filter((b) => b.id !== id)
    })
  }, [])

  const handleBookSelect = useCallback((_id: string) => {
    // selection tracking removed — kept for API compatibility
  }, [])

  const handleMoveToShelfFromSearch = useCallback((id: string) => {
    const book = searchBooks.find((b) => b.id === id)
    if (!book) return
    setShelfBooks((shelf) => {
      if (shelf.some((b) => b.id === id)) return shelf
      return [...shelf, book]
    })
  }, [searchBooks])

  const handleMoveToShelfFromBag = useCallback((id: string, note?: string) => {
    setBagBooks((bag) => {
      const book = bag.find((b) => b.id === id)
      if (!book) return bag
      const isFinished = Number(book.currentPage) === Number(book.allPages)
      const isStarted  = Number(book.currentPage) > 1
      const updated: Book = {
        ...book,
        status: isFinished ? "finish" : isStarted ? "reading" : book.status,
        note: note ?? book.note,
      }
      setShelfBooks((shelf) => [...shelf, updated])
      return bag.filter((b) => b.id !== id)
    })
  }, [])

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

  const handleIncrementTimesRead = useCallback((id: string) => {
    setBagBooks((bag) => bag.map((b) => (b.id !== id ? b : { ...b, timesRead: (b.timesRead ?? 0) + 1 })))
  }, [])

  const handleAddManualBook = useCallback((book: Book) => {
    setShelfBooks((shelf) => {
      if (shelf.some((b) => b.id === book.id)) return shelf
      return [...shelf, book]
    })
  }, [])

  return {
    bagBooks,
    shelfBooks,
    shelfHighLight,
    handleActiveShelfHighLight,
    handleAddToBagFromShelf,
    handleBookSelect,
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
    handleIncrementTimesRead,
    handleLogReadingSession,
    handleAddManualBook,
  }
}
