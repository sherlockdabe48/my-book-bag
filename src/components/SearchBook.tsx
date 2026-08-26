import { useContext } from "react"
import { searchBookContext } from "./App"
import type { SearchBook } from "../hooks/useSearch"
import type { Book } from "../types/book"

interface SearchBookProps extends SearchBook {
  shelfBooks: Book[]
}

export default function SearchBook({
  id,
  title,
  subtitle,
  author,
  description,
  allPages,
  imageURL,
  isbn,
  shelfBooks,
}: SearchBookProps) {
  const { handleMoveToShelfFromSearch } = useContext(searchBookContext)
  const isAlreadyAdded = shelfBooks.some((shelfBook) => shelfBook.id === id)

  return (
    <div className={`search-book__container${isAlreadyAdded ? " search-book__container--added" : ""}`}>
      <img
        className="search-book__book-image"
        src={imageURL}
        alt={title}
      />
      <div className="search-book__details">
        <div className="search-book__meta">
          <h3 className="search-book__title">
            {title}
            {subtitle && <span className="search-book__subtitle">: {subtitle}</span>}
          </h3>
          <p className="search-book__author">{author}</p>
          {isbn && <p className="search-book__isbn">ISBN {isbn}</p>}
          {description && (
            <p className="search-book__description">{description}</p>
          )}
        </div>
        <div className="search-book__footer">
          <span className="search-book__pages">
            {allPages === "N/A" ? "Pages unknown" : `${allPages} pages`}
          </span>
          {!isAlreadyAdded ? (
            <button
              className="btn btn--primary search-book__btn"
              onClick={() => handleMoveToShelfFromSearch(id)}
            >
              + Add to Shelf
            </button>
          ) : (
            <button
              className="btn btn--normal search-book__btn"
              onClick={() => document.getElementById("in-my-shelf")?.scrollIntoView({ behavior: "smooth" })}
            >
              ✓ In Shelf
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
