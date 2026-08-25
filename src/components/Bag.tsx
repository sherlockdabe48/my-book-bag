import BagBookList from "./BagBookList"
import type { Book } from "../types/book"

interface BagProps {
  bagBooks: Book[]
}

export default function Bag({ bagBooks }: BagProps) {
  return (
    <div>
      <h2 className="topic">In my Bag</h2>
      <div className="bag-container">
        <BagBookList bagBooks={bagBooks} />
      </div>
    </div>
  )
}
