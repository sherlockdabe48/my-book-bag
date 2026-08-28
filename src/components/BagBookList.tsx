import { useContext, useEffect, useRef } from "react"
import BookInBag from "./BookInBag"
import { toggleClassContext } from "./App"
import type { Book } from "../types/book"
import { getNextTier } from "../hooks/useBookBag"

interface BagBookListProps {
  bagBooks: Book[]
  bagCapacity: number
  totalFinished: number
  recentlyAddedBagBookId?: string | null
}

export default function BagBookList({ bagBooks, bagCapacity, totalFinished, recentlyAddedBagBookId }: BagBookListProps) {
  const { handleActiveShelfHighLight, handleOpenShelf } = useContext(toggleClassContext)
  const nextTier = getNextTier(totalFinished)
  const isFull = bagBooks.length >= bagCapacity

  // Smooth-scroll to the top of the bag list when the first book changes
  // (i.e. a book has been floated to the top after progress/read-today)
  const firstBookIdRef = useRef<string | undefined>(undefined)
  const listRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const newFirstId = bagBooks[0]?.id
    if (firstBookIdRef.current !== undefined && firstBookIdRef.current !== newFirstId) {
      listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    }
    firstBookIdRef.current = newFirstId
  }, [bagBooks[0]?.id])

  function goToShelf() {
    handleOpenShelf?.()
    handleActiveShelfHighLight()
    document.getElementById("in-my-shelf")?.scrollIntoView({ behavior: "smooth" })
  }

  if (bagBooks.length === 0) {
    return (
      <div className="bag-book-list">
        <div className="bag-book-list__empty">
          <svg className="bag-book-list__empty-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            {/* tote bag body */}
            <path d="M4 8h16l-1.5 11a2 2 0 0 1-2 1.5H7.5a2 2 0 0 1-2-1.5L4 8z"/>
            {/* left handle */}
            <path d="M9 8c0-3 1-5 3-5"/>
            {/* right handle */}
            <path d="M15 8c0-3-1-5-3-5"/>
          </svg>
          <p className="bag-book-list__empty-heading">Your bag is empty</p>
          <p className="bag-book-list__empty-sub">Pick a book from your shelf and start reading.</p>
          <button className="btn btn--primary btn--see-more" onClick={goToShelf}>
            Pick from shelf
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bag-book-list" ref={listRef}>
      {bagBooks.map((bagBook, index) => (
        <BookInBag
          key={bagBook.id}
          {...bagBook}
          isActive={index === 0}
          isLanding={bagBook.id === recentlyAddedBagBookId}
        />
      ))}
      <div className="btn--container">
        {isFull ? (
          <div className="bag-full-notice">
            <p className="bag-full-notice__title">🎒 Your bag is full ({bagCapacity}/{bagCapacity})</p>
            <p className="bag-full-notice__sub">
              {nextTier
                ? <>Finish <strong>{nextTier.booksFinished - totalFinished}</strong> more book{nextTier.booksFinished - totalFinished !== 1 ? "s" : ""} to unlock a <strong>{nextTier.label}</strong> ({nextTier.capacity} slots).</>
                : <>You've reached the maximum bag size. You're a Scholar! 🏆</>
              }
            </p>
          </div>
        ) : (
          <button
            className="btn btn--add btn--see-more"
            onClick={goToShelf}
          >
            Pick from shelf
          </button>
        )}
      </div>
    </div>
  )
}
