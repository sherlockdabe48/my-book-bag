import { useEffect, useState } from "react"
import SearchBook from "./SearchBook"
import AddManualBookForm from "./AddManualBookForm"
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
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    function onScroll() {
      setShowBackToTop(window.scrollY > 400)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  if (loading) return <div className="search-book-list__spinner" aria-label="Loading" />

  if (!loading && searchBooks.length === 0) {
    return (
      <>
        <p className="search-book-list__empty">No results found. Try a different search.</p>
        <div className="btn--container mt-2" style={{ textAlign: "center" }}>
          <button className="btn btn--optional btn--see-more" onClick={() => setShowAddForm(true)}>
            Add your own book{" "}
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "middle", marginLeft: "4px" }}>
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>
        {showAddForm && <AddManualBookForm onClose={() => setShowAddForm(false)} />}
      </>
    )
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
