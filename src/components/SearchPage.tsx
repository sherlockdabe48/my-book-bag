import { useContext } from "react"
import SearchBookList from "./SearchBookList"
import { searchBookContext } from "./App"
import type { Book } from "../types/book"

interface SearchPageProps {
  searchInputValue: string
  searchBooks: Book[]
  loading: boolean
  startIndex: number
  totalSearchItems: number
  shelfBooks: Book[]
  searchError: string | null
}

export default function SearchPage({
  searchInputValue,
  searchBooks,
  loading,
  startIndex,
  totalSearchItems,
  shelfBooks,
  searchError,
}: SearchPageProps) {
  const { handleClearSearchInputValue } = useContext(searchBookContext)

  return (
    <div>
      <div className="search-page__header">
        <div className="search-page__header-meta">
          <h2 className="search-page__header-title">{searchInputValue}</h2>
          {totalSearchItems > 0 && (
            <span className="search-page__header-count">{totalSearchItems} results</span>
          )}
        </div>
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
            searchBooks={searchBooks}
            startIndex={startIndex}
            totalSearchItems={totalSearchItems}
            shelfBooks={shelfBooks}
          />
        )}
      </div>
    </div>
  )
}
