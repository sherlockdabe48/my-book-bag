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
import useAuth from "../hooks/useAuth"
import type { AuthContextValue } from "../types/auth"

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
export const authContext = React.createContext<AuthContextValue>({} as AuthContextValue)

function App() {
  const inputRef = useRef<(HTMLInputElement | null)[]>([])

  const auth = useAuth()

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
  } = useBookBag(searchBooks, auth.user?.accessToken)

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
      <authContext.Provider value={auth}>
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
      </authContext.Provider>
    </Router>
  )
}

export default App
