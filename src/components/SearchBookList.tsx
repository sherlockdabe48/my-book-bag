import { useEffect, useState } from "react"
import SearchBook from "./SearchBook"
import type { SearchBook as SearchBookType } from "../hooks/useSearch"
import type { Book } from "../types/book"

interface SearchBookListProps {
  searchBooks: SearchBookType[]
  loading: boolean
  loadingMore: boolean
  hasMore: boolean
  shelfBooks: Book[]
  onLoadMore: () => void
}

export default function SearchBookList({
  searchBooks,
  loading,
  loadingMore,
  hasMore,
  shelfBooks,
  onLoadMore,
}: SearchBookListProps) {
  const [showBackToTop, setShowBackToTop] = useState(false)

  useEffect(() => {
    function onScroll() {
      setShowBackToTop(window.scrollY > 400)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  if (loading) return <div className="search-book-list__spinner" aria-label="Loading" />

  if (!loading && searchBooks.length === 0) {
    return <p className="search-book-list__empty">No results found. Try a different search.</p>
  }

  return (
    <>
      <div className="search-book-list__grid">
        {searchBooks.map((searchBook) => (
          <SearchBook key={searchBook.id} {...searchBook} shelfBooks={shelfBooks} />
        ))}
      </div>
      {hasMore && (
        <div className="search-book-list__load-more">
          <button
            className="btn btn--normal btn--see-more search-book-list__load-more-btn"
            onClick={onLoadMore}
            disabled={loadingMore}
          >
            {loadingMore ? "Loading..." : "Load more books"}
          </button>
        </div>
      )}
      {showBackToTop && (
        <button
          className="search-book-list__back-to-top"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
        >
          ↑ Top
        </button>
      )}
    </>
  )
}
