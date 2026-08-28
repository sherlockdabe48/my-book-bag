import BookInShelf from "./BookInShelf"
import type { Book } from "../types/book"

interface ShelfBookListProps {
  shelfBooks: Book[]
  recentlyAddedShelfBookId?: string | null
}

export default function ShelfBookList({ shelfBooks, recentlyAddedShelfBookId }: ShelfBookListProps) {
  return (
    <>
      <div className="shelf-book-list__grid">
        {shelfBooks.map((shelfBook) => (
          <BookInShelf
            key={shelfBook.id}
            {...shelfBook}
            isLanding={shelfBook.id === recentlyAddedShelfBookId}
          />
        ))}
      </div>
    </>
  )
}
