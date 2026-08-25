import React, { useContext, useRef, useState } from "react"
import { bookBagContext } from "./App"
import type { Book } from "../types/book"

type BookInBagProps = Pick<Book, "id" | "title" | "author" | "currentPage" | "allPages" | "imageURL">

export default function BookInBag({ id, title, author, currentPage, allPages, imageURL }: BookInBagProps) {
  const { handleMoveToShelfFromBag, handleBagBookProgressChange } = useContext(bookBagContext)
  const [progress, setProgress] = useState(currentPage)
  const [isEditing, setIsEditing] = useState(false)
  const [draftProgress, setDraftProgress] = useState(currentPage)
  const inputRef = useRef<HTMLInputElement>(null)
  const isFinished = Number(progress) === Number(allPages)

  function startEditing() {
    setDraftProgress(progress)
    setIsEditing(true)
    setTimeout(() => inputRef.current?.select(), 0)
  }

  function commitEdit() {
    const max = Number(allPages)
    let next = Number(draftProgress)
    if (Number.isNaN(next) || next < 0) next = 0
    if (next > max) next = max
    setProgress(next)
    handleBagBookProgressChange(id, next)
    setIsEditing(false)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") { e.preventDefault(); commitEdit() }
    if (e.key === "Escape") { setIsEditing(false); setDraftProgress(progress) }
  }

  function handleDraftChange(e: React.ChangeEvent<HTMLInputElement>) {
    setDraftProgress(Number(e.target.value))
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
        <div className="book-in-bag__progress-row">
          {isEditing ? (
            <input
              ref={inputRef}
              type="number"
              value={draftProgress}
              min={0}
              max={Number(allPages)}
              className="book-in-bag__inline-input"
              onChange={handleDraftChange}
              onBlur={commitEdit}
              onKeyDown={handleKeyDown}
              aria-label="Current page"
            />
          ) : (
            <button
              className="book-in-bag__progress-btn"
              onClick={startEditing}
              title="Click to edit page"
            >
              {progress}
            </button>
          )}
          <span className="book-in-bag__progress-text">/ {allPages} Pages</span>
        </div>
        <div className="book-in-bag__progress-bar-wrapper">
          <div
            className="book-in-bag__progress-bar"
            style={{ width: `${Math.min(100, (Number(progress) / Number(allPages)) * 100)}%` }}
          />
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
