import { useEffect, useState } from "react"
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
  const [selectedBookId, setSelectedBookId] = useState<string | undefined>()
  const [shelfHighLight, setShelfHighLight] = useState(false)

  // ── Load from localStorage on mount ─────────────────────
  useEffect(() => {
    const covers    = loadCovers()
    const bagJson   = localStorage.getItem(BAG_BOOKS_KEY)
    const shelfJson = localStorage.getItem(SHELF_BOOKS_KEY)
    if (bagJson)   setBagBooks(attachCovers(JSON.parse(bagJson) as Book[], covers))
    if (shelfJson) setShelfBooks(attachCovers(JSON.parse(shelfJson) as Book[], covers))
  }, [])

  // ── Persist to localStorage on every change ─────────────
  useEffect(() => {
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
  function handleActiveShelfHighLight() {
    setShelfHighLight(true)
    setTimeout(() => setShelfHighLight(false), 1500)
  }

  function handleAddToBagFromShelf(id: string) {
    const book = shelfBooks.find((b) => b.id === id)
    if (!book) return
    setSelectedBookId(id)
    setBagBooks([...bagBooks, book])
    setShelfBooks(shelfBooks.filter((b) => b.id !== id))
  }

  function handleBookSelect(id: string) { setSelectedBookId(id) }

  function handleMoveToShelfFromSearch(id: string) {
    const book = searchBooks.find((b) => b.id === id)
    if (!book || shelfBooks.some((b) => b.id === id)) return
    setSelectedBookId(id)
    setShelfBooks([...shelfBooks, book])
  }

  function handleMoveToShelfFromBag(id: string) {
    const book = bagBooks.find((b) => b.id === id)
    if (!book) return
    setSelectedBookId(id)
    setShelfBooks([...shelfBooks, book])
    setBagBooks(bagBooks.filter((b) => b.id !== id))
  }

  function handleBagBookProgressChange(id: string, currentPage: number) {
    setBagBooks(bagBooks.map((b) => (b.id !== id ? b : { ...b, currentPage })))
  }

  function handleBookDeleteFromShelf(id: string) {
    if (selectedBookId === id) setSelectedBookId(undefined)
    setShelfBooks(shelfBooks.filter((b) => b.id !== id))
  }

  function handleBookChangeCover(id: string, imageURL: string) {
    setShelfBooks(shelfBooks.map((b) => (b.id !== id ? b : { ...b, imageURL })))
  }

  function handleBookChangePages(id: string, allPages: number) {
    setShelfBooks(shelfBooks.map((b) => (b.id !== id ? b : { ...b, allPages })))
  }

  function handleBookChangeTitle(id: string, title: string) {
    setShelfBooks(shelfBooks.map((b) => (b.id !== id ? b : { ...b, title })))
  }

  function handleBookChangeAuthor(id: string, author: string) {
    setShelfBooks(shelfBooks.map((b) => (b.id !== id ? b : { ...b, author })))
  }

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
  }
}
