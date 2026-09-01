import { useContext } from "react"
import { bookBagContext, toggleClassContext } from "./App"
import type { ClassicsBook as ClassicsBookType } from "../hooks/useSearchClassics"
import type { Book } from "../types/book"

interface ClassicsBookProps extends ClassicsBookType {
  shelfBooks: Book[]
  onClose: () => void
}

export default function ClassicsBook({
  id,
  title,
  author,
  publisher,
  allPages,
  currentPage,
  imageURL,
  description,
  isbn,
  status,
  note,
  recommendedBy,
  lastReadAt,
  timesRead,
  firstPublishYear,
  shelfBooks,
  onClose,
}: ClassicsBookProps) {
  const { handleAddBookToShelf, shelfFull } = useContext(bookBagContext)
  const { handleActiveShelfHighLight, handleOpenShelf } = useContext(toggleClassContext)

  const isAlreadyAdded = shelfBooks.some((b) => b.id === id)

  const book: Book = {
    id, title, author, publisher, allPages, currentPage,
    imageURL, description, isbn, status, note,
    recommendedBy, lastReadAt, timesRead,
  }

  return (
    <div className={`search-book__container${isAlreadyAdded ? " search-book__container--added" : ""}`}>
      <img className="search-book__book-image" src={imageURL} alt={title} />
      <div className="search-book__details">
        <div className="search-book__meta">
          <h3 className="search-book__title">{title}</h3>
          <p className="search-book__author">{author}</p>
          {isbn && <p className="search-book__isbn">ISBN {isbn}</p>}
        </div>
        <div className="search-book__footer">
          <span className="search-book__pages">
            {firstPublishYear ? `First published ${firstPublishYear}` : "Classic"}
          </span>
          {!isAlreadyAdded ? (
            <button
              className="btn btn--primary search-book__btn"
              onClick={() => handleAddBookToShelf(book)}
              disabled={shelfFull}
              title={shelfFull ? "Your shelf is full — finish more books and add notes to unlock space" : undefined}
            >
              {shelfFull ? "Shelf full" : "+ Add to Shelf"}
            </button>
          ) : (
            <button
              className="btn btn--normal search-book__btn"
              onClick={() => {
                handleOpenShelf?.()
                handleActiveShelfHighLight?.()
                onClose()
                document.getElementById("in-my-shelf")?.scrollIntoView({ behavior: "smooth" })
              }}
            >
              ✓ In Shelf
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
