import React from "react"
import ShelfBookList from "./ShelfBookList"
import type { Book } from "../types/book"

interface ShelfProps {
  shelfBooks: Book[]
  shelfHighLight: boolean
  inputRef: React.MutableRefObject<(HTMLInputElement | null)[]>
}

export default function Shelf({ shelfBooks, shelfHighLight, inputRef }: ShelfProps) {
  function focus() {
    inputRef.current[0]?.focus()
    inputRef.current[1]?.focus()
  }

  return (
    <div>
      <h2 className="topic" id="in-my-shelf">
        In my Shelf
      </h2>
      <div className={shelfHighLight ? "shelf-container__highlight" : ""}>
        <div className="shelf-container">
          <ShelfBookList shelfBooks={shelfBooks} />
          <div className="btn--container mt-2">
            <button className="btn btn--optional btn--see-more" onClick={focus}>
              Search Book
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
