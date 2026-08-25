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
    <>
      <div>
        <h2 className="topic">{searchInputValue} </h2>
        <span className="sub-topic">Search Result: {totalSearchItems} items</span>

        <div className="search-page__container">
          <div className="search-page__close-btn-container ">
            <button
              className="btn btn--close-page"
              onClick={handleClearSearchInputValue}
            >
              &times;
            </button>
          </div>
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

          {totalSearchItems > 20 && (
            <div className="search-page__close-btn-container ">
              <button
                className="btn btn--close-page"
                onClick={handleClearSearchInputValue}
              >
                &times;
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
