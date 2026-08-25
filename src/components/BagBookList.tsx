import { useContext } from "react"
import BookInBag from "./BookInBag"
import { toggleClassContext } from "./App"
import type { Book } from "../types/book"

interface BagBookListProps {
  bagBooks: Book[]
}

export default function BagBookList({ bagBooks }: BagBookListProps) {
  const { handleActiveShelfHighLight } = useContext(toggleClassContext)

  return (
    <div className="bag-book-list">
      {bagBooks.map((bagBook) => (
        <BookInBag key={bagBook.id} {...bagBook} />
      ))}
      <div className="btn--container">
        <a href="#in-my-shelf">
          <button
            className="btn btn--add btn--see-more"
            onClick={handleActiveShelfHighLight}
          >
            Add Book &#43;
          </button>
        </a>
      </div>
    </div>
  )
}
