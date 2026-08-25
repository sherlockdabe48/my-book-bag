import { useContext } from "react"
import { bookBagContext } from "./App"
import type { Book } from "../types/book"

type BookInShelfProps = Pick<Book, "id" | "title" | "imageURL">

export default function BookInShelf({ id, title, imageURL }: BookInShelfProps) {
  const { handleAddToBagFromShelf, handleBookDeleteFromShelf } = useContext(bookBagContext)

  return (
    <div className="book-in-shelf__container">
      <div className="book-in-shelf__cover-wrapper">
        <img
          className="book-image-in-shelf"
          src={imageURL}
          alt={title}
        />
        <div className="book-in-shelf__overlay">
          <button
            className="book-in-shelf__overlay-btn book-in-shelf__overlay-btn--add"
            onClick={() => handleAddToBagFromShelf(id)}
            title="Add to Bag"
          >
            Add to Bag
          </button>
          <button
            className="book-in-shelf__overlay-btn book-in-shelf__overlay-btn--remove"
            onClick={() => handleBookDeleteFromShelf(id)}
            title="Remove"
          >
            Remove
          </button>
        </div>
      </div>
      <p className="book-in-shelf__title">{title}</p>
    </div>
  )
}
