import React from "react"
import BookInShelf from "./BookInShelf"

export default function ShelfBookList({ shelfBooks }) {
  return (
      <>
    <div className='shelf-book-list__grid '>
      {shelfBooks.map((shelfBook) => {
        return <BookInShelf key={shelfBook.id} {...shelfBook} />
      })}
    </div>
    
    </>
  )
}
