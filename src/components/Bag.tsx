import { useState, useEffect } from "react"
import BagBookList from "./BagBookList"
import type { Book } from "../types/book"
import type { BAG_TIERS } from "../hooks/useBookBag"
import { getNextTier } from "../hooks/useBookBag"

interface BagProps {
  bagBooks: Book[]
  bagCapacity: number
  bagUpgraded: boolean
  bagTier: typeof BAG_TIERS[number]
  totalFinished: number
  readingStreak: number
  recentlyAddedBagBookId?: string | null
}

export default function Bag({ bagBooks, bagCapacity, bagUpgraded, bagTier, totalFinished, readingStreak, recentlyAddedBagBookId }: BagProps) {
  const [showUpgrade, setShowUpgrade] = useState(false)
  const isFull = bagBooks.length >= bagCapacity
  const nextTier = getNextTier(totalFinished)

  useEffect(() => {
    if (!bagUpgraded) return
    setShowUpgrade(true)
    const t = setTimeout(() => setShowUpgrade(false), 6000)
    return () => clearTimeout(t)
  }, [bagUpgraded])

  return (
    <div>
      <h2 className="topic">My Bag</h2>
      {showUpgrade && (
        <div className="bag-upgrade-banner">
          🎉 Bag upgraded! You can now carry <strong>{bagCapacity} books</strong>. Keep reading!
        </div>
      )}
      <div className="bag-container">
        <BagBookList bagBooks={bagBooks} bagCapacity={bagCapacity} recentlyAddedBagBookId={recentlyAddedBagBookId} />
        <div className="bag-slot-line">
          <span className={`bag-slot-text${isFull ? " bag-slot-text--full" : ""}`}>
            {bagBooks.length} / {bagCapacity} slots · {bagTier.label}
          </span>
          {nextTier && (
            <span className="bag-slot-text">
              · Finish {nextTier.booksFinished - totalFinished} more book{nextTier.booksFinished - totalFinished !== 1 ? "s" : ""} to unlock {nextTier.label}
            </span>
          )}
          {readingStreak > 0 && (
            <span className="bag-slot-text bag-streak">
              · {readingStreak} day streak
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
