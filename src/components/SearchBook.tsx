import { useContext } from "react"
import { searchBookContext } from "./App"
import type { Book } from "../types/book"

interface SearchBookProps extends Book {
  shelfBooks: Book[]
}

export default function SearchBook({
  id,
  title,
  author,
  description,
  allPages,
  imageURL,
  shelfBooks,
}: SearchBookProps) {
  const { handleMoveToShelfFromSearch } = useContext(searchBookContext)
  const isAlreadyAdded = shelfBooks.some((shelfBook) => shelfBook.id === id)

  return (
    <>
      <div className="search-book__container">
        <div>
          <img
            className="search-book__book-image"
            src={imageURL}
            alt="search book"
          />
        </div>
        <div className="search-book__book-detail-grid">
          <div>
            <label className="search-book__label">Title: </label>
            <span className="search-book__title">{title}</span>
            <br />
            <label className="search-book__label">By:</label>
            <span className="search-book__author">{author}</span>
          </div>
          {description && (
            <span className="search-book__desciption">{description}</span>
          )}
          <div>
            <label className="search-book__label">Pages: </label>
            <span className="search-book__pages">{allPages} pages</span>
          </div>
          <div className="search-book__btn-wrapper">
            {!isAlreadyAdded && (
              <button
                className="btn btn--primary btn--in-search-book mr-1"
                onClick={() => handleMoveToShelfFromSearch(id)}
              >
                Add to Shelf
              </button>
            )}
            {isAlreadyAdded && (
              <a href="#in-my-shelf">
                <button className="btn btn--normal btn--in-search-book">
                  See in Shelf
                </button>
              </a>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
