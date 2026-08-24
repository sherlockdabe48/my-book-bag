import React, { useContext } from "react"
import BookInBag from "./BookInBag"
import { toggleClassContext } from "./App"

export default function BagBookList({ bagBooks }) {
  const { handleActiveShelfHighLight } = useContext(toggleClassContext)
  return (
    <>
      {bagBooks.map((bagBook) => {
        return (
          <BookInBag key={bagBook.id} {...bagBook} />
        )
      })}

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
    </>
  )
}
