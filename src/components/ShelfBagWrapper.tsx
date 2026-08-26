import React from "react"
import Shelf from "./Shelf"
import Bag from "./Bag"
import type { Book } from "../types/book"

interface ShelfBagWrapperProps {
  bagBooks: Book[]
  shelfBooks: Book[]
  shelfHighLight: boolean
  inputRef: React.MutableRefObject<(HTMLInputElement | null)[]>
}

export default function ShelfBagWrapper({
  bagBooks,
  shelfBooks,
  shelfHighLight,
  inputRef,
}: ShelfBagWrapperProps) {
  return (
    <div className="shelf-bag-wrapper">
      <Bag bagBooks={bagBooks} />
      <Shelf
        shelfBooks={shelfBooks}
        shelfHighLight={shelfHighLight}
        inputRef={inputRef}
      />
    </div>
  )
}
