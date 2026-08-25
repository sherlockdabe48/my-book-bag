import React, { useRef } from "react"
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
  handleNextPageInSearchBook: () => void
  handlePrevPageInSearchBook: () => void
  handleMoveToShelfFromSearch: (id: string) => void
}

export interface BookBagContextValue {
  handleAddToBagFromShelf: (id: string) => void
  handleBookSelect: (id: string) => void
  handleBookDeleteFromShelf: (id: string) => void
  handleMoveToShelfFromBag: (id: string) => void
  handleBagBookProgressChange: (id: string, currentPage: number) => void
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
    startIndex,
    searchBooks,
    totalSearchItems,
    loading,
    searchError,
    handleGetSearchInputValue,
    handleClearSearchInputValue,
    handleNextPageInSearchBook,
    handlePrevPageInSearchBook,
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
  } = useBookBag(searchBooks)

  const haveSomeBook = bagBooks.length > 0 || shelfBooks.length > 0

  const searchBookContextValue: SearchBookContextValue = {
    handleGetSearchInputValue,
    handleClearSearchInputValue,
    handleNextPageInSearchBook,
    handlePrevPageInSearchBook,
    handleMoveToShelfFromSearch,
  }

  const bookBagContextValue: BookBagContextValue = {
    handleAddToBagFromShelf,
    handleBookSelect,
    handleBookDeleteFromShelf,
    handleMoveToShelfFromBag,
    handleBagBookProgressChange,
  }

  const toggleClassContextValue: ToggleClassContextValue = {
    handleActiveShelfHighLight,
  }

  return (
    <Router>
      <searchBookContext.Provider value={searchBookContextValue}>
        <Header inputRef={inputRef} />
        <MobileSearchBox inputRef={inputRef} />
        {searchInputValue && (
          <SearchPage
            loading={loading}
            searchBooks={searchBooks}
            searchInputValue={searchInputValue}
            startIndex={startIndex}
            totalSearchItems={totalSearchItems}
            shelfBooks={shelfBooks}
            searchError={searchError}
          />
        )}
      </searchBookContext.Provider>
      {!haveSomeBook && <WelcomeMessage />}
      <bookBagContext.Provider value={bookBagContextValue}>
        <toggleClassContext.Provider value={toggleClassContextValue}>
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
        v2.0 redesign · 2026 · crafted with <a href="https://www.ibm.com/" target="_blank" rel="noreferrer">IBM Bob</a> &amp; Adélier Classics
      </footer>
    </Router>
  )
}

export default App
