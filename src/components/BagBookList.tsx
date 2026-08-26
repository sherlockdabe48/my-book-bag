import { useContext } from "react"
import BookInBag from "./BookInBag"
import { toggleClassContext } from "./App"
import type { Book } from "../types/book"

interface BagBookListProps {
  bagBooks: Book[]
}

export default function BagBookList({ bagBooks }: BagBookListProps) {
  const { handleActiveShelfHighLight } = useContext(toggleClassContext)

  function goToShelf() {
    handleActiveShelfHighLight()
    document.getElementById("in-my-shelf")?.scrollIntoView({ behavior: "smooth" })
  }

  if (bagBooks.length === 0) {
    return (
      <div className="bag-book-list">
        <div className="bag-book-list__empty">
          <svg className="bag-book-list__empty-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            {/* tote bag body */}
            <path d="M4 8h16l-1.5 11a2 2 0 0 1-2 1.5H7.5a2 2 0 0 1-2-1.5L4 8z"/>
            {/* left handle */}
            <path d="M9 8c0-3 1-5 3-5"/>
            {/* right handle */}
            <path d="M15 8c0-3-1-5-3-5"/>
          </svg>
          <p className="bag-book-list__empty-heading">Your bag is empty</p>
          <p className="bag-book-list__empty-sub">Pick a book from your shelf and start reading.</p>
          <button className="btn btn--primary btn--see-more" onClick={goToShelf}>
            Pick from shelf
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bag-book-list">
      {bagBooks.map((bagBook, index) => (
        <BookInBag key={bagBook.id} {...bagBook} isActive={index === 0} />
      ))}
      <div className="btn--container">
        <button
          className="btn btn--add btn--see-more"
          onClick={goToShelf}
        >
          Pick from shelf
        </button>
      </div>
    </div>
  )
}
