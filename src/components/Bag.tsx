import { useState, useEffect, useCallback, useRef } from "react"
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
}

export default function Bag({ bagBooks, bagCapacity, bagUpgraded, bagTier, totalFinished }: BagProps) {
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [tooltipOpen, setTooltipOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const isFull = bagBooks.length >= bagCapacity
  const nextTier = getNextTier(totalFinished)

  useEffect(() => {
    if (!bagUpgraded) return
    setShowUpgrade(true)
    const t = setTimeout(() => setShowUpgrade(false), 6000)
    return () => clearTimeout(t)
  }, [bagUpgraded])

  const closeTooltip = useCallback(() => setTooltipOpen(false), [])
  useEffect(() => {
    if (!tooltipOpen) return
    function handleOutside(e: MouseEvent | TouchEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) closeTooltip()
    }
    document.addEventListener("mousedown", handleOutside)
    document.addEventListener("touchstart", handleOutside)
    return () => {
      document.removeEventListener("mousedown", handleOutside)
      document.removeEventListener("touchstart", handleOutside)
    }
  }, [tooltipOpen, closeTooltip])

  return (
    <div>
      <h2 className="topic">My Bag</h2>
      {showUpgrade && (
        <div className="bag-upgrade-banner">
          🎉 Bag upgraded! You can now carry <strong>{bagCapacity} books</strong>. Keep reading!
        </div>
      )}
      <div className="bag-container">
        <BagBookList bagBooks={bagBooks} bagCapacity={bagCapacity} totalFinished={totalFinished} />
        {/* ── Slot footer line at the bottom ── */}
        <div className="bag-slot-line" ref={wrapRef}>
          <span className={`bag-slot-text${isFull ? " bag-slot-text--full" : ""}`}>
            {bagBooks.length} / {bagCapacity} slots · {bagTier.label}
          </span>
          {nextTier && (
            <button
              className="bag-slot-link"
              onClick={(e) => { e.stopPropagation(); setTooltipOpen((v) => !v) }}
              onMouseEnter={() => setTooltipOpen(true)}
              onMouseLeave={() => setTooltipOpen(false)}
            >
              How to unlock more ↗
            </button>
          )}
          {tooltipOpen && nextTier && (
            <div className="bag-tooltip bag-tooltip--above" role="tooltip">
              <p className="bag-tooltip__row">
                <span className="bag-tooltip__label">Current tier</span>
                <span className="bag-tooltip__value">{bagTier.label}</span>
              </p>
              <p className="bag-tooltip__row">
                <span className="bag-tooltip__label">Next tier</span>
                <span className="bag-tooltip__value">{nextTier.label} ({nextTier.capacity} slots)</span>
              </p>
              <p className="bag-tooltip__next">
                Finish <strong>{nextTier.booksFinished - totalFinished}</strong> more book{nextTier.booksFinished - totalFinished !== 1 ? "s" : ""} to unlock it.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
