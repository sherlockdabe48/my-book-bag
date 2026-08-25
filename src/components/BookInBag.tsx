import React, { useContext, useState } from "react"
import { bookBagContext } from "./App"
import type { Book } from "../types/book"

type BookInBagProps = Pick<Book, "id" | "title" | "author" | "currentPage" | "allPages" | "imageURL">

export default function BookInBag({ id, title, author, currentPage, allPages, imageURL }: BookInBagProps) {
  const { handleMoveToShelfFromBag, handleBagBookProgressChange } = useContext(bookBagContext)
  const [progress, setProgress] = useState(currentPage)
  const [isEditing, setIsEditing] = useState(false)
  const isFinished = Number(currentPage) === Number(allPages)

  function handleChangeProgress(e: React.ChangeEvent<HTMLInputElement>) {
    const max = parseInt(e.target.max)
    let nextProgress = parseInt(e.target.value)

    if (Number.isNaN(nextProgress) || nextProgress < 0) {
      nextProgress = 0
    }
    if (nextProgress > max) {
      nextProgress = max
    }

    setProgress(nextProgress)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    handleBagBookProgressChange(id, progress)
    setIsEditing(false)
  }

  function handleFinishBook() {
    if (isFinished) {
      setProgress(1)
      handleBagBookProgressChange(id, 1)
      return
    }
    setProgress(Number(allPages))
    handleBagBookProgressChange(id, Number(allPages))
    alert("Congratulations! You just finished a book")
  }

  return (
    <div className="book-in-bag__container">
      <img className="book-image-in-bag" src={imageURL} alt="book in bag" />
      <div className="book-in-bag__detail-grid">
        <div>
          <label>Title: </label>
          <span>{title}</span>
          <br />
          <label>By: </label>
          <span>{author}</span>
        </div>
        <br />
        <label>Progress:</label>
        <div>
          <span>
            {progress}/{allPages} Pages
          </span>
          <button
            className="btn btn--normal btn--small book-in-bag__edit-progress-button"
            onClick={() => setIsEditing((prev) => !prev)}
          >
            EDIT
          </button>
        </div>
        <div className={isEditing ? "" : "hide"}>
          <div className="book-in-bag__edit-progress-section">
            <form onSubmit={handleSubmit}>
              <input
                type="number"
                value={progress}
                max={Number(allPages)}
                className="book-in-bag__edit-progress-input"
                onChange={handleChangeProgress}
              />
              <button
                className="btn btn--small btn--add book-in-bag__save-progress-button"
                type="submit"
              >
                SAVE
              </button>
            </form>
          </div>
        </div>
        <button
          className={`btn btn--in-bag ${isFinished ? "btn--add" : "btn--primary"}`}
          onClick={handleFinishBook}
        >
          {isFinished ? "Read Again" : "Finish"}
        </button>
        <button
          className="btn btn--danger btn--in-bag"
          onClick={() => handleMoveToShelfFromBag(id)}
        >
          Remove
        </button>
      </div>
    </div>
  )
}
