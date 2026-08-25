import { useContext } from "react"
import SearchBook from "./SearchBook"
import { searchBookContext } from "./App"
import type { Book } from "../types/book"

interface SearchBookListProps {
  searchBooks: Book[]
  loading: boolean
  startIndex: number
  totalSearchItems: number
  shelfBooks: Book[]
}

export default function SearchBookList({
  searchBooks,
  loading,
  startIndex,
  totalSearchItems,
  shelfBooks,
}: SearchBookListProps) {
  const { handleNextPageInSearchBook, handlePrevPageInSearchBook } = useContext(searchBookContext)

  if (loading) return <h2 className="text-center">"Loading..."</h2>

  return (
    <>
      <div className="search-book-list__grid">
        {searchBooks.map((searchBook) => (
          <SearchBook key={searchBook.id} {...searchBook} shelfBooks={shelfBooks} />
        ))}
      </div>
      <div className="btn--container">
        {startIndex !== 0 && (
          <button
            className="btn btn--normal btn--see-more search-book-list__pagination-button"
            onClick={handlePrevPageInSearchBook}
          >
            &lt; Prev Page
          </button>
        )}
        {totalSearchItems > 20 && (
          <button
            className="btn btn--normal btn--see-more search-book-list__pagination-button"
            onClick={handleNextPageInSearchBook}
          >
            Next Page &gt;
          </button>
        )}
      </div>
    </>
  )
}
