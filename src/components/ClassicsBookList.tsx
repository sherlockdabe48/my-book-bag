import { useEffect, useState } from "react"
import type { RefObject } from "react"
import ClassicsBook from "./ClassicsBook"
import type { ClassicsBook as ClassicsBookType } from "../hooks/useSearchClassics"
import type { Book } from "../types/book"

interface ClassicsBookListProps {
  classics: ClassicsBookType[]
  loading: boolean
  loadingMore: boolean
  hasMore: boolean
  shelfBooks: Book[]
  onLoadMore: () => void
  onClose: () => void
  scrollContainerRef?: RefObject<HTMLDivElement | null>
}

export default function ClassicsBookList({
  classics,
  loading,
  loadingMore,
  hasMore,
  shelfBooks,
  onLoadMore,
  onClose,
  scrollContainerRef,
}: ClassicsBookListProps) {
  const [showBackToTop, setShowBackToTop] = useState(false)

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

  if (!loading && classics.length === 0) {
    return <p className="search-book-list__empty">No classics found. Please try again later.</p>
  }

  return (
    <>
      <div className="search-book-list__grid">
        {classics.map((book) => (
          <ClassicsBook key={book.id} {...book} shelfBooks={shelfBooks} onClose={onClose} />
        ))}
      </div>
      {hasMore && (
        <div className="search-book-list__load-more">
          <button
            className="search-book-list__load-more-btn"
            onClick={onLoadMore}
            disabled={loadingMore}
            aria-label="Load more classics"
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
