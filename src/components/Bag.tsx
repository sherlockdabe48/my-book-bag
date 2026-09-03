import { useState, useEffect } from "react"
import BagBookList from "./BagBookList"
import type { Book } from "../types/book"
import type { BAG_TIERS } from "../hooks/useBookBag"

interface BagProps {
  bagBooks: Book[]
  bagCapacity: number
  bagUpgradedAt: number | null
  bagTier: typeof BAG_TIERS[number]
  totalFinished: number
  readingStreak: number
  recentlyAddedBagBookId?: string | null
}

export default function Bag({ bagBooks, bagCapacity, bagUpgradedAt, recentlyAddedBagBookId }: BagProps) {
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [fadingOut, setFadingOut] = useState(false)

  useEffect(() => {
    if (!bagUpgradedAt) return
    setShowUpgrade(true)
    setFadingOut(false)
    // Start fade-out 1 s before removal
    const fadeTimer  = setTimeout(() => setFadingOut(true), 5000)
    const hideTimer  = setTimeout(() => setShowUpgrade(false), 6000)
    return () => { clearTimeout(fadeTimer); clearTimeout(hideTimer) }
  }, [bagUpgradedAt])

  function dismiss() {
    setFadingOut(true)
    setTimeout(() => setShowUpgrade(false), 400)
  }

  return (
    <div>
      <h2 className="topic">My Bag</h2>
      {showUpgrade && (
        <div
          className={`bag-upgrade-banner${fadingOut ? " bag-upgrade-banner--fade-out" : ""}`}
          onClick={dismiss}
          role="status"
          title="Click to dismiss"
        >
          🎉 Bag upgraded! You can now carry <strong>{bagCapacity} books</strong>. Keep reading!
        </div>
      )}
      <div className="bag-container">
        <BagBookList bagBooks={bagBooks} bagCapacity={bagCapacity} recentlyAddedBagBookId={recentlyAddedBagBookId} />
      </div>
    </div>
  )
}
