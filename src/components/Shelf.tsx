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
              Search Book{" "}
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "middle", marginLeft: "4px" }}>
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
