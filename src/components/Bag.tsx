import { useState, useEffect } from "react"
import BagBookList from "./BagBookList"
import type { Book } from "../types/book"
import type { BAG_TIERS } from "../hooks/useBookBag"

interface BagProps {
  bagBooks: Book[]
  bagCapacity: number
  bagUpgraded: boolean
  bagTier: typeof BAG_TIERS[number]
  totalFinished: number
  readingStreak: number
  recentlyAddedBagBookId?: string | null
}

export default function Bag({ bagBooks, bagCapacity, bagUpgraded, recentlyAddedBagBookId }: BagProps) {
  const [showUpgrade, setShowUpgrade] = useState(false)

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
      </div>
    </div>
  )
}
