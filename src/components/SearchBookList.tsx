import { useEffect, useState } from "react"
import type { RefObject } from "react"
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
  scrollContainerRef?: RefObject<HTMLDivElement | null>
}

export default function SearchBookList({
  searchBooks,
  loading,
  loadingMore,
  hasMore,
  shelfBooks,
  onLoadMore,
  scrollContainerRef,
}: SearchBookListProps) {
  const [showBackToTop, setShowBackToTop] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    const el = scrollContainerRef?.current
    const target = el ?? window
    function onScroll() {
      const scrolled = el ? el.scrollTop : window.scrollY
      setShowBackToTop(scrolled > 300)
    }
    target.addEventListener("scroll", onScroll, { passive: true })
    return () => target.removeEventListener("scroll", onScroll)
  }, [scrollContainerRef])

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
            className="search-book-list__load-more-btn"
            onClick={onLoadMore}
            disabled={loadingMore}
            aria-label="Load more books"
          >
            {loadingMore ? (
              <span className="search-book-list__load-more-spinner" />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="12" y1="5" x2="12" y2="19" />
                <polyline points="19 12 12 19 5 12" />
              </svg>
            )}
          </button>
        </div>
      )}
      {showBackToTop && (
        <button
          className="search-book-list__back-to-top"
          onClick={() => {
            const el = scrollContainerRef?.current
            if (el) el.scrollTo({ top: 0, behavior: "smooth" })
            else window.scrollTo({ top: 0, behavior: "smooth" })
          }}
          aria-label="Back to top"
        >
          ↑ Top
        </button>
      )}
    </>
  )
}
