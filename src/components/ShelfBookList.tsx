import BookInShelf from "./BookInShelf"
import type { Book } from "../types/book"

interface ShelfBookListProps {
  shelfBooks: Book[]
}

export default function ShelfBookList({ shelfBooks }: ShelfBookListProps) {
  return (
    <>
      <div className="shelf-book-list__grid ">
        {shelfBooks.map((shelfBook) => (
          <BookInShelf key={shelfBook.id} {...shelfBook} />
        ))}
      </div>
    </>
  )
}
