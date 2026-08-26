import React, { useState } from "react"
import ShelfBookList from "./ShelfBookList"
import AddManualBookForm from "./AddManualBookForm"
import type { Book } from "../types/book"

interface ShelfProps {
  shelfBooks: Book[]
  shelfHighLight: boolean
  inputRef: React.MutableRefObject<(HTMLInputElement | null)[]>
}

export default function Shelf({ shelfBooks, shelfHighLight, inputRef }: ShelfProps) {
  const [showAddForm, setShowAddForm] = useState(false)

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
          {shelfBooks.length === 0 ? (
            <div className="shelf-empty">
              <svg className="shelf-empty__icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
              <p className="shelf-empty__heading">Your shelf is empty</p>
              <p className="shelf-empty__sub">Search for a book and add it here.</p>
            </div>
          ) : (
            <ShelfBookList shelfBooks={shelfBooks} />
          )}
          <div className="btn--container mt-2">
            <button className="btn btn--optional btn--see-more" onClick={focus}>
              Find a book{" "}
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "middle", marginLeft: "4px" }}>
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
            <button className="btn btn--optional btn--see-more" onClick={() => setShowAddForm(true)}>
              Add your own book{" "}
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "middle", marginLeft: "4px" }}>
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      {showAddForm && <AddManualBookForm onClose={() => setShowAddForm(false)} />}
    </div>
  )
}
