import React, { useContext, useEffect, useRef, useState } from "react"
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
  searchErrorType: "warning" | "error"
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
  searchErrorType,
  onLoadMore,
}: SearchPageProps) {
  const { handleGetSearchInputValue, handleClearSearchInputValue } = useContext(searchBookContext)
  const [inputValue, setInputValue] = useState(searchInputValue)
  const inputRef = useRef<HTMLInputElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)

  // Focus the input when the modal opens
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 50)
  }, [])

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") handleClearSearchInputValue()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [handleClearSearchInputValue])

  // Sync controlled input if parent clears search externally
  useEffect(() => {
    setInputValue(searchInputValue)
  }, [searchInputValue])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (inputValue.trim()) handleGetSearchInputValue(inputValue.trim())
  }

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) handleClearSearchInputValue()
  }

  const hasResults = !loading && !searchError && searchBooks.length > 0

  return (
    <div className="search-modal__backdrop" onClick={handleBackdropClick} aria-modal="true" role="dialog" aria-label="Find a Book">
      <div className="search-modal__panel">

        {/* Modal header */}
        <div className="search-modal__header">
          <h2 className="search-modal__title">Find a Book</h2>
          <button
            className="search-modal__close-btn"
            onClick={handleClearSearchInputValue}
            aria-label="Close"
            type="button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Search input */}
        <div className="search-modal__search-bar">
          <form onSubmit={handleSubmit} className="search-modal__form">
            <div className="search-modal__input-wrap">
              <svg className="search-modal__input-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                ref={inputRef}
                className="search-modal__input"
                type="text"
                placeholder="Search by title or author…"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onFocus={(e) => e.target.select()}
              />
            </div>
            <button type="submit" className="btn btn--primary search-modal__submit-btn">Search</button>
          </form>
        </div>

        {/* Results meta */}
        {searchInputValue && !loading && !searchError && (
          <div className="search-modal__meta">
            <span className="search-modal__query">Results for "{searchInputValue}"</span>
            <span className="search-modal__count">{searchBooks.length} result{searchBooks.length !== 1 ? "s" : ""}</span>
          </div>
        )}

        {/* Results body */}
        <div className="search-modal__body" ref={bodyRef}>
          {searchInputValue ? (
            searchError ? (
              <p className={searchErrorType === "warning" ? "search-modal__warning" : "search-page__error"}>{searchError}</p>
            ) : (
              <SearchBookList
                loading={loading}
                loadingMore={loadingMore}
                hasMore={hasMore}
                searchBooks={searchBooks}
                shelfBooks={shelfBooks}
                onLoadMore={onLoadMore}
                scrollContainerRef={bodyRef}
              />
            )
          ) : (
            <div className="search-modal__welcome">
              <svg className="search-modal__welcome-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
              <p className="search-modal__welcome-heading">Discover your next read</p>
              <p className="search-modal__welcome-sub">Search by title or author to find your next favourite book.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
