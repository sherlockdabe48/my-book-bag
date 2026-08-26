import React, { useMemo, useRef } from "react"
import type { Book } from "../types/book"
import { BrowserRouter as Router } from "react-router-dom"
import Header from "./Header"
import SearchPage from "./SearchPage"
import ShelfBagWrapper from "./ShelfBagWrapper"
import WelcomeMessage from "./WelcomeMessage"
import "../css/App.css"
import MobileSearchBox from "./MobileSearchBox"
import useSearch from "../hooks/useSearch"
import useBookBag from "../hooks/useBookBag"
export interface SearchBookContextValue {
  handleGetSearchInputValue: (value: string) => void
  handleClearSearchInputValue: () => void
  handleMoveToShelfFromSearch: (id: string) => void
}

export interface BookBagContextValue {
  handleAddToBagFromShelf: (id: string) => void
  handleBookSelect: (id: string) => void
  handleBookDeleteFromShelf: (id: string) => void
  handleMoveToShelfFromBag: (id: string, note?: string) => void
  handleBagBookProgressChange: (id: string, currentPage: number) => void
  handleBookChangeCover: (id: string, imageURL: string) => void
  handleBookChangePages: (id: string, allPages: number) => void
  handleBookChangeTitle: (id: string, title: string) => void
  handleBookChangeAuthor: (id: string, author: string) => void
  handleBookChangeNote: (id: string, note: string) => void
  handleBookChangeRecommendedBy: (id: string, recommendedBy: string) => void
  handleLogReadingSession: (id: string) => void
  handleAddManualBook: (book: Book) => void
}

export interface ToggleClassContextValue {
  handleActiveShelfHighLight: () => void
}

export const bookBagContext = React.createContext<BookBagContextValue>({} as BookBagContextValue)
export const toggleClassContext = React.createContext<ToggleClassContextValue>({} as ToggleClassContextValue)
export const searchBookContext = React.createContext<SearchBookContextValue>({} as SearchBookContextValue)
function App() {
  const inputRef = useRef<(HTMLInputElement | null)[]>([])

  const {
    searchInputValue,
    searchBooks,
    hasMore,
    loading,
    loadingMore,
    searchError,
    handleGetSearchInputValue,
    handleClearSearchInputValue,
    loadMore,
  } = useSearch()

  const {
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
    handleBookChangeCover,
    handleBookChangePages,
    handleBookChangeTitle,
    handleBookChangeAuthor,
    handleBookChangeNote,
    handleBookChangeRecommendedBy,
    handleLogReadingSession,
    handleAddManualBook,
  } = useBookBag(searchBooks)

  const haveSomeBook = bagBooks.length > 0 || shelfBooks.length > 0

  const searchBookContextValue = useMemo<SearchBookContextValue>(() => ({
    handleGetSearchInputValue,
    handleClearSearchInputValue,
    handleMoveToShelfFromSearch,
  }), [handleGetSearchInputValue, handleClearSearchInputValue, handleMoveToShelfFromSearch])

  const bookBagContextValue = useMemo<BookBagContextValue>(() => ({
    handleAddToBagFromShelf,
    handleBookSelect,
    handleBookDeleteFromShelf,
    handleMoveToShelfFromBag,
    handleBagBookProgressChange,
    handleBookChangeCover,
    handleBookChangePages,
    handleBookChangeTitle,
    handleBookChangeAuthor,
    handleBookChangeNote,
    handleBookChangeRecommendedBy,
    handleLogReadingSession,
    handleAddManualBook,
  }), [
    handleAddToBagFromShelf,
    handleBookSelect,
    handleBookDeleteFromShelf,
    handleMoveToShelfFromBag,
    handleBagBookProgressChange,
    handleBookChangeCover,
    handleBookChangePages,
    handleBookChangeTitle,
    handleBookChangeAuthor,
    handleBookChangeNote,
    handleBookChangeRecommendedBy,
    handleLogReadingSession,
    handleAddManualBook,
  ])

  const toggleClassContextValue = useMemo<ToggleClassContextValue>(() => ({
    handleActiveShelfHighLight,
  }), [handleActiveShelfHighLight])

  return (
    <Router>
      <bookBagContext.Provider value={bookBagContextValue}>
        <toggleClassContext.Provider value={toggleClassContextValue}>
          <searchBookContext.Provider value={searchBookContextValue}>
            <Header inputRef={inputRef} />
            <MobileSearchBox inputRef={inputRef} />
            {searchInputValue && (
              <SearchPage
                loading={loading}
                loadingMore={loadingMore}
                hasMore={hasMore}
                searchBooks={searchBooks}
                searchInputValue={searchInputValue}
                shelfBooks={shelfBooks}
                searchError={searchError}
                onLoadMore={loadMore}
              />
            )}
          </searchBookContext.Provider>
          {!haveSomeBook && <WelcomeMessage />}
          {haveSomeBook && (
            <ShelfBagWrapper
              bagBooks={bagBooks}
              shelfBooks={shelfBooks}
              shelfHighLight={shelfHighLight}
              inputRef={inputRef}
            />
          )}
        </toggleClassContext.Provider>
      </bookBagContext.Provider>
      <footer className="app-footer">
        v2.0 · 2026 · crafted with <a href="https://www.ibm.com/" target="_blank" rel="noreferrer">IBM Bob</a> &amp; Adélier&nbsp;Classics
      </footer>
    </Router>
  )
}

export default App
