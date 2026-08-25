import { useEffect, useState } from "react"
import type { Book } from "../types/book"

const BAG_BOOKS_LOCAL_STORAGE_KEY = "myBookBag.bagBooks"
const SHELF_BOOKS_LOCAL_STORAGE_KEY = "myBookBag.shelfBooks"

export default function useBookBag(searchBooks: Book[]) {
  const [bagBooks, setBagBooks] = useState<Book[]>([])
  const [shelfBooks, setShelfBooks] = useState<Book[]>([])
  const [selectedBookId, setSelectedBookId] = useState<string | undefined>()
  const [shelfHighLight, setShelfHighLight] = useState(false)

  // load from localStorage on mount
  useEffect(() => {
    const bagBookJson = localStorage.getItem(BAG_BOOKS_LOCAL_STORAGE_KEY)
    if (bagBookJson != null) setBagBooks(JSON.parse(bagBookJson) as Book[])
    const shelfBookJson = localStorage.getItem(SHELF_BOOKS_LOCAL_STORAGE_KEY)
    if (shelfBookJson != null) setShelfBooks(JSON.parse(shelfBookJson) as Book[])
  }, [])

  // persist to localStorage on change
  useEffect(() => {
    localStorage.setItem(BAG_BOOKS_LOCAL_STORAGE_KEY, JSON.stringify(bagBooks))
    localStorage.setItem(SHELF_BOOKS_LOCAL_STORAGE_KEY, JSON.stringify(shelfBooks))
  }, [bagBooks, shelfBooks])

  function handleActiveShelfHighLight() {
    setShelfHighLight(true)
    setTimeout(() => setShelfHighLight(false), 1500)
  }

  function handleAddToBagFromShelf(id: string) {
    const book = shelfBooks.find((b) => b.id === id)
    if (!book) return
    setSelectedBookId(book.id)
    setBagBooks([...bagBooks, book])
    setShelfBooks(shelfBooks.filter((b) => b.id !== id))
  }

  function handleBookSelect(id: string) {
    setSelectedBookId(id)
  }

  function handleMoveToShelfFromSearch(id: string) {
    const book = searchBooks.find((b) => b.id === id)
    if (!book || shelfBooks.some((b) => b.id === id)) return
    setSelectedBookId(book.id)
    setShelfBooks([...shelfBooks, book])
  }

  function handleMoveToShelfFromBag(id: string) {
    const book = bagBooks.find((b) => b.id === id)
    if (!book) return
    setSelectedBookId(book.id)
    setShelfBooks([...shelfBooks, book])
    setBagBooks(bagBooks.filter((b) => b.id !== id))
  }

  function handleBagBookProgressChange(id: string, currentPage: number) {
    setBagBooks(
      bagBooks.map((b) => (b.id !== id ? b : { ...b, currentPage }))
    )
  }

  function handleBookDeleteFromShelf(id: string) {
    if (selectedBookId != null && selectedBookId === id) {
      setSelectedBookId(undefined)
    }
    setShelfBooks(shelfBooks.filter((b) => b.id !== id))
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
