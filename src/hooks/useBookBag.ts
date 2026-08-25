import { useEffect, useState, useCallback } from "react"
import type { Book } from "../types/book"

const BAG_BOOKS_LOCAL_STORAGE_KEY  = "myBookBag.bagBooks"
const SHELF_BOOKS_LOCAL_STORAGE_KEY = "myBookBag.shelfBooks"

// Google Books mylibrary shelf IDs
// 2 = "To Read"  (we use as "Shelf")
// 3 = "Reading"  (we use as "Bag")
const SHELF_ID = 2
const BAG_ID   = 3

const IS_DEV = import.meta.env.DEV
const MYLIBRARY_URI = IS_DEV
  ? "https://www.googleapis.com/books/v1/mylibrary/bookshelves"
  : "/.netlify/functions/mylibrary"

// ── helpers ───────────────────────────────────────────────
async function mylibraryFetch(
  path: string,
  method: "GET" | "POST" | "DELETE",
  accessToken: string
): Promise<Response> {
  const url = IS_DEV
    ? `https://www.googleapis.com/books/v1/mylibrary/${path}`
    : `/.netlify/functions/mylibrary?path=${encodeURIComponent(path)}`

  return fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  })
}

async function fetchGoogleShelf(shelfId: number, accessToken: string): Promise<Book[]> {
  const res = await mylibraryFetch(
    `bookshelves/${shelfId}/volumes?maxResults=40`,
    "GET",
    accessToken
  )
  if (!res.ok) return []
  const data = await res.json() as { items?: Array<{
    id: string
    volumeInfo: {
      title: string
      authors?: string[]
      pageCount?: number
      imageLinks?: { thumbnail?: string }
      description?: string
    }
    userInfo?: { readingPosition?: { gbImagePosition?: string } }
  }> }

  return (data.items ?? []).map((v) => ({
    id: v.id,
    title: v.volumeInfo.title,
    author: v.volumeInfo.authors?.join(", ") ?? "N/A",
    allPages: v.volumeInfo.pageCount ?? "N/A",
    currentPage: Number(v.userInfo?.readingPosition?.gbImagePosition ?? 1) || 1,
    imageURL: (v.volumeInfo.imageLinks?.thumbnail ?? "").replace("http://", "https://")
      || "../images/mybookbag-image-cover-sample-01.jpg",
    description: v.volumeInfo.description ?? false,
    status: shelfId === BAG_ID ? "reading" as const : "onRead" as const,
  }))
}

async function addToGoogleShelf(shelfId: number, volumeId: string, accessToken: string) {
  await mylibraryFetch(
    `bookshelves/${shelfId}/addVolume?volumeId=${volumeId}`,
    "POST",
    accessToken
  )
}

async function removeFromGoogleShelf(shelfId: number, volumeId: string, accessToken: string) {
  await mylibraryFetch(
    `bookshelves/${shelfId}/removeVolume?volumeId=${volumeId}`,
    "POST",
    accessToken
  )
}

// ── hook ──────────────────────────────────────────────────
export default function useBookBag(searchBooks: Book[], accessToken?: string) {
  const [bagBooks, setBagBooks]     = useState<Book[]>([])
  const [shelfBooks, setShelfBooks] = useState<Book[]>([])
  const [selectedBookId, setSelectedBookId] = useState<string | undefined>()
  const [shelfHighLight, setShelfHighLight] = useState(false)

  // ── Load books ─────────────────────────────────────────
  useEffect(() => {
    if (accessToken) {
      // Authenticated: load from Google Books
      Promise.all([
        fetchGoogleShelf(SHELF_ID, accessToken),
        fetchGoogleShelf(BAG_ID,   accessToken),
      ]).then(([shelf, bag]) => {
        setShelfBooks(shelf)
        setBagBooks(bag)
      }).catch(console.error)
    } else {
      // Unauthenticated: load from localStorage
      const bagJson   = localStorage.getItem(BAG_BOOKS_LOCAL_STORAGE_KEY)
      const shelfJson = localStorage.getItem(SHELF_BOOKS_LOCAL_STORAGE_KEY)
      if (bagJson)   setBagBooks(JSON.parse(bagJson) as Book[])
      if (shelfJson) setShelfBooks(JSON.parse(shelfJson) as Book[])
    }
  }, [accessToken])

  // ── Persist to localStorage when unauthenticated ───────
  useEffect(() => {
    if (!accessToken) {
      localStorage.setItem(BAG_BOOKS_LOCAL_STORAGE_KEY,   JSON.stringify(bagBooks))
      localStorage.setItem(SHELF_BOOKS_LOCAL_STORAGE_KEY, JSON.stringify(shelfBooks))
    }
  }, [bagBooks, shelfBooks, accessToken])

  // ── Actions ────────────────────────────────────────────
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
    if (accessToken) {
      removeFromGoogleShelf(SHELF_ID, id, accessToken).catch(console.error)
      addToGoogleShelf(BAG_ID, id, accessToken).catch(console.error)
    }
  }

  function handleBookSelect(id: string) { setSelectedBookId(id) }

  function handleMoveToShelfFromSearch(id: string) {
    const book = searchBooks.find((b) => b.id === id)
    if (!book || shelfBooks.some((b) => b.id === id)) return
    setSelectedBookId(id)
    setShelfBooks([...shelfBooks, book])
    if (accessToken) {
      addToGoogleShelf(SHELF_ID, id, accessToken).catch(console.error)
    }
  }

  function handleMoveToShelfFromBag(id: string) {
    const book = bagBooks.find((b) => b.id === id)
    if (!book) return
    setSelectedBookId(id)
    setShelfBooks([...shelfBooks, book])
    setBagBooks(bagBooks.filter((b) => b.id !== id))
    if (accessToken) {
      removeFromGoogleShelf(BAG_ID,   id, accessToken).catch(console.error)
      addToGoogleShelf(SHELF_ID, id, accessToken).catch(console.error)
    }
  }

  function handleBagBookProgressChange(id: string, currentPage: number) {
    setBagBooks(bagBooks.map((b) => (b.id !== id ? b : { ...b, currentPage })))
    // Note: Google Books readingPosition API requires a separate endpoint;
    // we update it optimistically in local state only for now.
  }

  function handleBookDeleteFromShelf(id: string) {
    if (selectedBookId === id) setSelectedBookId(undefined)
    setShelfBooks(shelfBooks.filter((b) => b.id !== id))
    if (accessToken) {
      removeFromGoogleShelf(SHELF_ID, id, accessToken).catch(console.error)
    }
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
  }
}
