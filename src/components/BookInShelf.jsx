import React, { useContext } from "react"
import { bookBagContext } from "./App"

export default function BookInShelf({ id, title, imageURL }) {
  const { handleAddToBagFromShelf, handleBookDeleteFromShelf } = useContext(
    bookBagContext
  )
  return (
    <div className="book-in-shelf__container">
      <div className="book-in-shelf__buttons-container">
        <img
          className="book-image-in-shelf"
          src={`${imageURL}`}
          alt="book in shelf"
        />
        <div className="btn--hide">
          <button
            className="btn btn--add btn--circle book-in-shelf__add-button"
            onClick={() => handleAddToBagFromShelf(id)}
          >
            +
          </button>
          <button
            className=" btn btn--small btn--danger btn--circle book-in-shelf__delete-btn"
            onClick={() => handleBookDeleteFromShelf(id)}
          >
            &times;
          </button>
        </div>
      </div>

      <p className="book-in-shelf__title">{title}</p>
    </div>
  )
}
