import { useState, useEffect } from "react"
import type React from "react"
import Shelf from "./Shelf"
import Bag from "./Bag"
import BottomNav from "./BottomNav"
import type { Book } from "../types/book"
import { BAG_TIERS, SHELF_TIERS } from "../hooks/useBookBag"
import { Capacitor } from "@capacitor/core"

interface ShelfBagWrapperProps {
  bagBooks: Book[]
  shelfBooks: Book[]
  shelfHighLight: boolean
  bagCapacity: number
  bagUpgradedAt: number | null
  bagTier: typeof BAG_TIERS[number]
  shelfCapacity: number | null
  shelfTier: typeof SHELF_TIERS[number]
  totalFinished: number
  totalWithNote: number
  readingStreak: number
  shelfCollapsed: boolean
  setShelfCollapsed: React.Dispatch<React.SetStateAction<boolean>>
  recentlyAddedShelfBookId?: string | null
  recentlyAddedBagBookId?: string | null
}

// Tier indices — must match the order in BAG_TIERS
const TIER_READER   = BAG_TIERS.findIndex((t) => t.label === "Reader's Bag")
const TIER_BOOKWORM = BAG_TIERS.findIndex((t) => t.label === "Bookworm Bag")
const TIER_SCHOLAR  = BAG_TIERS.findIndex((t) => t.label === "Scholar's Bag")

const TAB_KEY = "myBookBag.activeTab"
type Tab = "bag" | "shelf"

function loadTab(): Tab {
  try {
    const v = localStorage.getItem(TAB_KEY)
    return v === "shelf" ? "shelf" : "bag"
  } catch {
    return "bag"
  }
}

// Detect mobile via CSS media query — matches the 900px breakpoint in CSS
function useIsMobile() {
  const [mobile, setMobile] = useState(() => window.matchMedia("(max-width: 900px)").matches)
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 900px)")
    const handler = (e: MediaQueryListEvent) => setMobile(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])
  return mobile
}

export default function ShelfBagWrapper({
  bagBooks,
  shelfBooks,
  shelfHighLight,
  bagCapacity,
  bagUpgradedAt,
  bagTier,
  shelfCapacity,
  shelfTier,
  totalFinished,
  totalWithNote,
  readingStreak,
  shelfCollapsed,
  setShelfCollapsed,
  recentlyAddedShelfBookId,
  recentlyAddedBagBookId,
}: ShelfBagWrapperProps) {

  const isIOS = Capacitor.getPlatform() === "ios"
  const tierIndex = BAG_TIERS.indexOf(bagTier)
  const canToggleShelf = tierIndex >= TIER_READER
  const isMobile = useIsMobile()

  const [activeTab, setActiveTab] = useState<Tab>(loadTab)

  function handleTabChange(tab: Tab) {
    setActiveTab(tab)
    try { localStorage.setItem(TAB_KEY, tab) } catch { /* ignore */ }
    if (tab === "shelf") setShelfCollapsed(false)
  }

  // If shelfHighLight fires (e.g. from "Pick from shelf"), switch to shelf tab
  // on mobile and scroll the window back to the top
  useEffect(() => {
    if (isMobile && shelfHighLight) {
      setActiveTab("shelf")
      // Let the panel become visible first, then scroll to top
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: "smooth" })
      })
    }
  }, [shelfHighLight, isMobile])

  // When a book is added to the bag on mobile, switch to the bag tab so the
  // carousel is visible before BagBookList tries to scroll to the new slide
  useEffect(() => {
    if (isMobile && recentlyAddedBagBookId) {
      setActiveTab("bag")
      try { localStorage.setItem(TAB_KEY, "bag") } catch { /* ignore */ }
    }
  }, [recentlyAddedBagBookId, isMobile])

  if (isMobile) {
    return (
      <div className={`shelf-bag-wrapper shelf-bag-wrapper--tabs${isIOS ? " shelf-bag-wrapper--ios" : ""}`}>
        {/* Both panels stay mounted to preserve scroll position */}
        <div className={`sbw-tab-panel${activeTab === "bag" ? " sbw-tab-panel--active" : ""}`}>
          <Bag
            bagBooks={bagBooks}
            bagCapacity={bagCapacity}
            bagUpgradedAt={bagUpgradedAt}
            bagTier={bagTier}
            totalFinished={totalFinished}
            readingStreak={readingStreak}
            recentlyAddedBagBookId={recentlyAddedBagBookId}
          />
        </div>
        <div className={`sbw-tab-panel${activeTab === "shelf" ? " sbw-tab-panel--active" : ""}`}>
          <Shelf
            shelfBooks={shelfBooks}
            shelfHighLight={shelfHighLight}
            recentlyAddedShelfBookId={recentlyAddedShelfBookId}
            tierIndex={tierIndex}
            tierBookworm={TIER_BOOKWORM}
            tierScholar={TIER_SCHOLAR}
            shelfCapacity={shelfCapacity}
            shelfTier={shelfTier}
            totalFinished={totalFinished}
            totalWithNote={totalWithNote}
          />
        </div>
        <BottomNav
          activeTab={activeTab}
          bagCount={bagBooks.length}
          onTabChange={handleTabChange}
        />
      </div>
    )
  }

  // ── Desktop layout (unchanged) ─────────────────────────────────────────────
  return (
    <div className={`shelf-bag-wrapper${shelfCollapsed ? " shelf-bag-wrapper--shelf-hidden" : ""}${isIOS ? " shelf-bag-wrapper--ios" : ""}`}>
      <Bag
        bagBooks={bagBooks}
        bagCapacity={bagCapacity}
        bagUpgradedAt={bagUpgradedAt}
        bagTier={bagTier}
        totalFinished={totalFinished}
        readingStreak={readingStreak}
        recentlyAddedBagBookId={recentlyAddedBagBookId}
      />
      <div className={`shelf-panel${shelfCollapsed ? " shelf-panel--collapsed" : ""}`}>
        {canToggleShelf && (
          <button
            className="shelf-toggle-btn"
            onClick={() => setShelfCollapsed((v) => !v)}
            aria-label={shelfCollapsed ? "Show Shelf" : "Hide Shelf"}
            title={shelfCollapsed ? "Show Shelf" : "Hide Shelf"}
          >
            {shelfCollapsed ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                Show Shelf
              </>
            ) : (
              <>
                Hide Shelf
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </>
            )}
          </button>
        )}
        {!shelfCollapsed && (
          <Shelf
            shelfBooks={shelfBooks}
            shelfHighLight={shelfHighLight}
            recentlyAddedShelfBookId={recentlyAddedShelfBookId}
            tierIndex={tierIndex}
            tierBookworm={TIER_BOOKWORM}
            tierScholar={TIER_SCHOLAR}
            shelfCapacity={shelfCapacity}
            shelfTier={shelfTier}
            totalFinished={totalFinished}
            totalWithNote={totalWithNote}
          />
        )}
      </div>
    </div>
  )
}
