import { useContext } from "react"
import SearchBookList from "./SearchBookList"
import { searchBookContext } from "./App"
import type { SearchBook } from "../hooks/useSearch"
import type { Book } from "../types/book"

interface SearchPageProps {
  searchInputValue: string
  searchBooks: SearchBook[]
  loading: boolean
  loadingMore: boolean
  hasMore: boolean
  shelfBooks: Book[]
  searchError: string | null
  onLoadMore: () => void
}

export default function SearchPage({
  searchInputValue,
  searchBooks,
  loading,
  loadingMore,
  hasMore,
  shelfBooks,
  searchError,
  onLoadMore,
}: SearchPageProps) {
  const { handleClearSearchInputValue } = useContext(searchBookContext)

  return (
    <div>
      <div className="search-page__header">
        <h2 className="search-page__header-title">looking for: {searchInputValue}</h2>
        <button
          className="search-page__close-btn"
          onClick={handleClearSearchInputValue}
          aria-label="Close search"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
          Close
        </button>
      </div>

      <div className="search-page__container">
        {searchError ? (
          <p className="search-page__error">{searchError}</p>
        ) : (
          <SearchBookList
            loading={loading}
            loadingMore={loadingMore}
            hasMore={hasMore}
            searchBooks={searchBooks}
            shelfBooks={shelfBooks}
            onLoadMore={onLoadMore}
          />
        )}
      </div>
    </div>
  )
}
