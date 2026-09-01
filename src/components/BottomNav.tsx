import { useEffect, useRef, useState } from "react"
import "../css/bottom-nav.css"

type Tab = "bag" | "shelf"

interface BottomNavProps {
  activeTab: Tab
  bagCount: number
  onTabChange: (tab: Tab) => void
}

export default function BottomNav({ activeTab, bagCount, onTabChange }: BottomNavProps) {
  const prevCountRef = useRef(bagCount)
  const [bump, setBump] = useState(false)

  useEffect(() => {
    if (bagCount > prevCountRef.current) {
      setBump(true)
      const t = setTimeout(() => setBump(false), 400)
      prevCountRef.current = bagCount
      return () => clearTimeout(t)
    }
    prevCountRef.current = bagCount
  }, [bagCount])

  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      <button
        className={`bottom-nav__tab${activeTab === "bag" ? " bottom-nav__tab--active" : ""}`}
        onClick={() => onTabChange("bag")}
        aria-current={activeTab === "bag" ? "page" : undefined}
        type="button"
      >
        <span className="bottom-nav__icon-wrap">
          <BagIcon />
          {bagCount > 0 && (
            <span className={`bottom-nav__badge${bump ? " bottom-nav__badge--bump" : ""}`} aria-label={`${bagCount} books in bag`}>
              {bagCount}
            </span>
          )}
        </span>
        <span className="bottom-nav__label">My Bag</span>
      </button>

      <button
        className={`bottom-nav__tab${activeTab === "shelf" ? " bottom-nav__tab--active" : ""}`}
        onClick={() => onTabChange("shelf")}
        aria-current={activeTab === "shelf" ? "page" : undefined}
        type="button"
      >
        <span className="bottom-nav__icon-wrap">
          <ShelfIcon />
        </span>
        <span className="bottom-nav__label">My Shelf</span>
      </button>
    </nav>
  )
}

function BagIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 8h16l-1.5 11a2 2 0 0 1-2 1.5H7.5a2 2 0 0 1-2-1.5L4 8z"/>
      <path d="M9 8c0-3 1-5 3-5"/>
      <path d="M15 8c0-3-1-5-3-5"/>
    </svg>
  )
}

function ShelfIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  )
}
