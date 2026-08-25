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
          <span className="book-in-bag__title">{title}</span>
          <br />
          <label>By: </label>
          <span>{author}</span>
        </div>
        <br />
        <label>Progress:</label>
        <div>
          <span className="book-in-bag__progress-text">
            {progress}/{allPages} Pages
          </span>
          <button
            className="book-in-bag__edit-icon-btn"
            onClick={() => setIsEditing((prev) => !prev)}
            title={isEditing ? "Close" : "Edit progress"}
            aria-label={isEditing ? "Close edit" : "Edit progress"}
          >
            {isEditing ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            )}
          </button>
        </div>
        <div className="book-in-bag__progress-bar-wrapper">
          <div
            className="book-in-bag__progress-bar"
            style={{ width: `${Math.min(100, (Number(progress) / Number(allPages)) * 100)}%` }}
          />
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
        <div className="book-in-bag__action-row">
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
    </div>
  )
}
