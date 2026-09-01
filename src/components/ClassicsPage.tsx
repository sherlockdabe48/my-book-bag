import { type MouseEvent, useEffect, useMemo, useRef, useState } from "react"
import ClassicsBookList from "./ClassicsBookList"
import type { ClassicsBook } from "../hooks/useSearchClassics"
import type { Book } from "../types/book"

interface ClassicsPageProps {
  classics: ClassicsBook[]
  loading: boolean
  loadingMore: boolean
  hasMore: boolean
  error: string | null
  shelfBooks: Book[]
  onLoadMore: () => void
  onClose: () => void
}

export default function ClassicsPage({
  classics,
  loading,
  loadingMore,
  hasMore,
  error,
  shelfBooks,
  onLoadMore,
  onClose,
}: ClassicsPageProps) {
  const bodyRef    = useRef<HTMLDivElement>(null)
  const filterRef  = useRef<HTMLInputElement>(null)
  const [filterQuery, setFilterQuery] = useState("")
  type SortKey = "default" | "year-asc" | "year-desc"
  const [sort, setSort] = useState<SortKey>("default")

  const filteredClassics = useMemo(() => {
    const q = filterQuery.trim().toLowerCase()
    let result = q
      ? classics.filter(
          (b) =>
            b.title.toLowerCase().includes(q) ||
            b.author.toLowerCase().includes(q),
        )
      : [...classics]

    if (sort === "year-asc") {
      result.sort((a, b) =>
        (a.firstPublishYear || Infinity) - (b.firstPublishYear || Infinity),
      )
    } else if (sort === "year-desc") {
      result.sort((a, b) =>
        (b.firstPublishYear || -Infinity) - (a.firstPublishYear || -Infinity),
      )
    }

    return result
  }, [classics, filterQuery, sort])

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [onClose])

  function handleBackdropClick(e: MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div
      className="search-modal__backdrop"
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
      aria-label="Browse Classics"
    >
      <div className="search-modal__panel">

        {/* Header */}
        <div className="search-modal__header">
          <h2 className="search-modal__title">
            <svg className="classics-modal__title-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            Browse Classics
          </h2>
          <button
            className="search-modal__close-btn"
            onClick={onClose}
            aria-label="Close"
            type="button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Filter + sort bar */}
        {!loading && !error && classics.length > 0 && (
          <div className="search-modal__search-bar classics-modal__filter-bar">
            <div className="search-modal__input-wrap">
              <svg className="search-modal__input-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                ref={filterRef}
                className="search-modal__input"
                type="text"
                placeholder="Filter by title or author…"
                value={filterQuery}
                onChange={(e) => { setFilterQuery(e.target.value); bodyRef.current?.scrollTo({ top: 0 }) }}
                aria-label="Filter classics"
              />
            </div>
            <select
              className="classics-modal__sort-select"
              value={sort}
              onChange={(e) => { setSort(e.target.value as SortKey); bodyRef.current?.scrollTo({ top: 0 }) }}
              aria-label="Sort classics"
            >
              <option value="default">Default</option>
              <option value="year-asc">Year: oldest first</option>
              <option value="year-desc">Year: newest first</option>
            </select>
          </div>
        )}

        {/* Meta bar */}
        {!loading && !error && classics.length > 0 && (
          <div className="search-modal__meta">
            <span className="search-modal__query">Classics · Open Library</span>
            <span className="search-modal__count">
              {filterQuery.trim()
                ? `${filteredClassics.length} of ${classics.length}`
                : `${classics.length} loaded`}
            </span>
          </div>
        )}

        {/* Body */}
        <div className="search-modal__body" ref={bodyRef}>
          {error ? (
            <p className="search-page__error">{error}</p>
          ) : (
            <ClassicsBookList
              classics={filteredClassics}
              loading={loading}
              loadingMore={loadingMore}
              hasMore={hasMore}
              shelfBooks={shelfBooks}
              onLoadMore={onLoadMore}
              onClose={onClose}
              scrollContainerRef={bodyRef}
            />
          )}
        </div>

      </div>
    </div>
  )
}
