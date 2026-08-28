import React, { useMemo, useState } from "react"
import type { Book } from "../types/book"
import { BrowserRouter as Router } from "react-router-dom"
import Header from "./Header"
import SearchPage from "./SearchPage"
import ShelfBagWrapper from "./ShelfBagWrapper"
import WelcomeMessage from "./WelcomeMessage"
import "../css/App.css"
import useSearch from "../hooks/useSearch"
import useBookBag from "../hooks/useBookBag"
export interface SearchBookContextValue {
  handleGetSearchInputValue: (value: string) => void
  handleClearSearchInputValue: () => void
  handleMoveToShelfFromSearch: (id: string) => void
  handleOpenSearch: () => void
}

export interface BookBagContextValue {
  bagCapacity: number
  bagCount: number
  handleAddToBagFromShelf: (id: string) => void
  handleBookDeleteFromShelf: (id: string) => void
  handleMoveToShelfFromBag: (id: string, note?: string) => void
  handleBagBookProgressChange: (id: string, currentPage: number) => void
  handleBookChangeCover: (id: string, imageURL: string) => void
  handleBookChangePages: (id: string, allPages: number) => void
  handleBookChangeTitle: (id: string, title: string) => void
  handleBookChangeAuthor: (id: string, author: string) => void
  handleBookChangeNote: (id: string, note: string) => void
  handleBookChangeRecommendedBy: (id: string, recommendedBy: string) => void
  handleIncrementTimesRead: (id: string) => void
  handleLogReadingSession: (id: string) => void
  handleAddManualBook: (book: Book) => void
  handleExportData: () => void
  handleImportData: (raw: string) => boolean
}

export interface ToggleClassContextValue {
  handleActiveShelfHighLight: () => void
}

export const bookBagContext = React.createContext<BookBagContextValue>({} as BookBagContextValue)
export const toggleClassContext = React.createContext<ToggleClassContextValue>({} as ToggleClassContextValue)
export const searchBookContext = React.createContext<SearchBookContextValue>({} as SearchBookContextValue)
function App() {
  const [modalOpen, setModalOpen] = useState(false)

  const {
    searchInputValue,
    searchBooks,
    hasMore,
    loading,
    loadingMore,
    searchError,
    searchErrorType,
    handleGetSearchInputValue,
    handleClearSearchInputValue,
    loadMore,
  } = useSearch()

  const {
    bagBooks,
    shelfBooks,
    shelfHighLight,
    bagCapacity,
    bagUpgraded,
    bagTier,
    totalFinished,
    handleActiveShelfHighLight,
    handleAddToBagFromShelf,
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
    handleIncrementTimesRead,
    handleLogReadingSession,
    handleAddManualBook,
    handleExportData,
    handleImportData,
  } = useBookBag(searchBooks)

  const haveSomeBook = bagBooks.length > 0 || shelfBooks.length > 0

  function handleOpenSearch() {
    setModalOpen(true)
  }

  const originalClear = handleClearSearchInputValue
  function handleCloseModal() {
    originalClear()
    setModalOpen(false)
  }

  const searchBookContextValue = useMemo<SearchBookContextValue>(() => ({
    handleGetSearchInputValue,
    handleClearSearchInputValue: handleCloseModal,
    handleMoveToShelfFromSearch,
    handleOpenSearch,
  }), [handleGetSearchInputValue, handleCloseModal, handleMoveToShelfFromSearch, handleOpenSearch])

  const bookBagContextValue = useMemo<BookBagContextValue>(() => ({
    bagCapacity,
    bagCount: bagBooks.length,
    handleAddToBagFromShelf,
    handleBookDeleteFromShelf,
    handleMoveToShelfFromBag,
    handleBagBookProgressChange,
    handleBookChangeCover,
    handleBookChangePages,
    handleBookChangeTitle,
    handleBookChangeAuthor,
    handleBookChangeNote,
    handleBookChangeRecommendedBy,
    handleIncrementTimesRead,
    handleLogReadingSession,
    handleAddManualBook,
    handleExportData,
    handleImportData,
  }), [
    bagCapacity,
    bagBooks.length,
    handleAddToBagFromShelf,
    handleBookDeleteFromShelf,
    handleMoveToShelfFromBag,
    handleBagBookProgressChange,
    handleBookChangeCover,
    handleBookChangePages,
    handleBookChangeTitle,
    handleBookChangeAuthor,
    handleBookChangeNote,
    handleBookChangeRecommendedBy,
    handleIncrementTimesRead,
    handleLogReadingSession,
    handleAddManualBook,
    handleExportData,
    handleImportData,
  ])

  const toggleClassContextValue = useMemo<ToggleClassContextValue>(() => ({
    handleActiveShelfHighLight,
  }), [handleActiveShelfHighLight])

  return (
    <Router>
      <bookBagContext.Provider value={bookBagContextValue}>
        <toggleClassContext.Provider value={toggleClassContextValue}>
          <searchBookContext.Provider value={searchBookContextValue}>
            <Header onOpenSearch={handleOpenSearch} />
            {modalOpen && (
              <SearchPage
                loading={loading}
                loadingMore={loadingMore}
                hasMore={hasMore}
                searchBooks={searchBooks}
                searchInputValue={searchInputValue}
                shelfBooks={shelfBooks}
                searchError={searchError}
                searchErrorType={searchErrorType}
                onLoadMore={loadMore}
              />
            )}
            {!haveSomeBook && <WelcomeMessage />}
            {haveSomeBook && (
              <ShelfBagWrapper
                bagBooks={bagBooks}
                shelfBooks={shelfBooks}
                shelfHighLight={shelfHighLight}
                bagCapacity={bagCapacity}
                bagUpgraded={bagUpgraded}
                bagTier={bagTier}
                totalFinished={totalFinished}
              />
            )}
          </searchBookContext.Provider>
        </toggleClassContext.Provider>
      </bookBagContext.Provider>
      <footer className="app-footer">
        v2.0 · 2026 · crafted with <a href="https://www.ibm.com/" target="_blank" rel="noreferrer">IBM Bob</a> &amp; Adélier&nbsp;Classics
      </footer>
    </Router>
  )
}

export default App
