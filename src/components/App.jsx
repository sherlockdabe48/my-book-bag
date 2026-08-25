import React, { useRef } from "react"
import { BrowserRouter as Router } from "react-router-dom"
import Header from "./Header.jsx"
import SearchPage from "./SearchPage.jsx"
import ShelfBagWrapper from "./ShelfBagWrapper.jsx"
import WelcomeMessage from "./WelcomeMessage.jsx"
import "../css/App.css"
import MobileSearchBox from "./MobileSearchBox.jsx"
import useSearch from "../hooks/useSearch.js"
import useBookBag from "../hooks/useBookBag.js"

export const bookBagContext = React.createContext()
export const toggleClassContext = React.createContext()
export const searchBookContext = React.createContext()

function App() {
  const inputRef = useRef([])

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

  const searchBookContextValue = {
    handleGetSearchInputValue,
    handleClearSearchInputValue,
    handleNextPageInSearchBook,
    handlePrevPageInSearchBook,
    handleMoveToShelfFromSearch,
  }

  const bookBagContextValue = {
    handleAddToBagFromShelf,
    handleBookSelect,
    handleBookDeleteFromShelf,
    handleMoveToShelfFromBag,
    handleBagBookProgressChange,
  }

  const toggleClassContextValue = {
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
    </Router>
  )
}

export default App
