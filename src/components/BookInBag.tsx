import React, { useContext, useEffect, useRef, useState } from "react"
import { bookBagContext } from "./App"
import type { Book } from "../types/book"

type BookInBagProps = Pick<Book, "id" | "title" | "author" | "currentPage" | "allPages" | "imageURL" | "note" | "recommendedBy" | "lastReadAt"> & { isActive: boolean }

function formatLastRead(dateStr: string): string {
  if (!dateStr) return ""
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const date = new Date(dateStr + "T00:00:00")
  const diffDays = Math.round((today.getTime() - date.getTime()) / 86400000)
  if (diffDays === 0) return "Last read today"
  if (diffDays === 1) return "Last read yesterday"
  if (diffDays < 7) return `Last read ${diffDays} days ago`
  return `Last read ${date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`
}

export default function BookInBag({ id, title, author, currentPage, allPages, imageURL, note: initialNote, recommendedBy, lastReadAt, isActive }: BookInBagProps) {
  const { handleMoveToShelfFromBag, handleBagBookProgressChange, handleLogReadingSession } = useContext(bookBagContext)
  const [progress, setProgress] = useState(currentPage)
  const [isEditing, setIsEditing] = useState(false)
  const [draftProgress, setDraftProgress] = useState(currentPage)
  const [confirmReadAgain, setConfirmReadAgain] = useState(false)
  const [note, setNote] = useState(initialNote)

  // Keep local progress in sync when the parent updates currentPage
  // (e.g. after rehydrating from localStorage)
  useEffect(() => {
    setProgress(currentPage)
    setDraftProgress(currentPage)
  }, [currentPage])

  // Keep local note in sync when the parent updates it
  // (e.g. after editing on the shelf and moving back to the bag)
  useEffect(() => {
    setNote(initialNote)
  }, [initialNote])
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
      setConfirmReadAgain(true)
      return
    }
    setProgress(Number(allPages))
    handleBagBookProgressChange(id, Number(allPages))
  }

  function confirmReset() {
    setProgress(1)
    handleBagBookProgressChange(id, 1)
    setConfirmReadAgain(false)
  }

  return (
    <div className="book-in-bag__container">
      <div className="book-in-bag__cover-wrapper">
        <img className="book-image-in-bag" src={imageURL} alt={title} loading="lazy" />
        <div className={`book-in-bag__bookmark ${isActive ? "book-in-bag__bookmark--active" : ""}`} aria-label={isActive ? "Currently reading" : "In your bag"}>
          <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 3a2 2 0 0 0-2 2v16l7-3 7 3V5a2 2 0 0 0-2-2H5z"/>
          </svg>
        </div>
      </div>
      <div className="book-in-bag__detail-grid">
        <div>
          <label>Title: </label>
          <span className="book-in-bag__title">{title}</span>
          <br />
          <label>By: </label>
          <span>{author}</span>
          {recommendedBy && (
            <>
              <br />
              <label>Recommended by: </label>
              <span>{recommendedBy}</span>
            </>
          )}
        </div>
        <br />
        {isFinished && (
          <p className="book-in-bag__finished-banner">🎉 You finished this book!</p>
        )}
        {isFinished && (
          <div className="book-in-bag__note-wrapper">
            <label className="book-in-bag__note-label" htmlFor={`note-${id}`}>
              Your thoughts
            </label>
            <textarea
              id={`note-${id}`}
              className="book-in-bag__note-textarea"
              placeholder="What did you think about this book?"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
            />
          </div>
        )}
        <label>Page:</label>
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
          <button
            className="book-in-bag__read-today-btn"
            onClick={() => handleLogReadingSession(id)}
            title="Mark that you read today"
          >
            📖 I read today
          </button>
        </div>
        {lastReadAt && (
          <span className="book-in-bag__last-read">{formatLastRead(lastReadAt)}</span>
        )}
        <div
          className="book-in-bag__progress-bar-wrapper"
          role="progressbar"
          aria-valuenow={Number(progress)}
          aria-valuemin={0}
          aria-valuemax={Number(allPages)}
          aria-label={`Page ${progress} of ${allPages}`}
        >
          <div
            className="book-in-bag__progress-bar"
            style={{ width: `${Math.min(100, (Number(progress) / Number(allPages)) * 100)}%` }}
          />
        </div>
        {confirmReadAgain ? (
          <div className="book-in-bag__confirm-reset">
            <span className="book-in-bag__confirm-reset-text">Reset progress to page 1?</span>
            <div className="book-in-bag__action-row">
              <button className="btn btn--danger btn--in-bag" onClick={confirmReset}>Yes, reset</button>
              <button className="btn btn--normal btn--in-bag" onClick={() => setConfirmReadAgain(false)}>Cancel</button>
            </div>
          </div>
        ) : (
          <div className="book-in-bag__action-row">
            <button
              className={`btn btn--in-bag ${isFinished ? "btn--add" : "btn--primary"}`}
              onClick={handleFinishBook}
            >
              {isFinished ? "Read Again" : "Finish"}
            </button>
            <button
              className="btn btn--normal btn--in-bag"
              onClick={() => handleMoveToShelfFromBag(id, note)}
            >
              Back to Shelf
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
