import type React from "react"
import Shelf from "./Shelf"
import Bag from "./Bag"
import type { Book } from "../types/book"
import { BAG_TIERS, SHELF_TIERS } from "../hooks/useBookBag"
import { Capacitor } from "@capacitor/core"

interface ShelfBagWrapperProps {
  bagBooks: Book[]
  shelfBooks: Book[]
  shelfHighLight: boolean
  bagCapacity: number
  bagUpgraded: boolean
  bagTier: typeof BAG_TIERS[number]
  shelfCapacity: number | null
  shelfTier: typeof SHELF_TIERS[number]
  totalFinished: number
  totalWithNote: number
  shelfCollapsed: boolean
  setShelfCollapsed: React.Dispatch<React.SetStateAction<boolean>>
  recentlyAddedShelfBookId?: string | null
  recentlyAddedBagBookId?: string | null
}

// Tier indices — must match the order in BAG_TIERS
const TIER_READER   = BAG_TIERS.findIndex((t) => t.label === "Reader's Bag")
const TIER_BOOKWORM = BAG_TIERS.findIndex((t) => t.label === "Bookworm Bag")
const TIER_SCHOLAR  = BAG_TIERS.findIndex((t) => t.label === "Scholar's Bag")
const TIER_MASTER   = BAG_TIERS.findIndex((t) => t.label === "Master's Bag")

export default function ShelfBagWrapper({
  bagBooks,
  shelfBooks,
  shelfHighLight,
  bagCapacity,
  bagUpgraded,
  bagTier,
  shelfCapacity,
  shelfTier,
  totalFinished,
  totalWithNote,
  shelfCollapsed,
  setShelfCollapsed,
  recentlyAddedShelfBookId,
  recentlyAddedBagBookId,
}: ShelfBagWrapperProps) {

  const isIOS = Capacitor.getPlatform() === "ios"
  const tierIndex = BAG_TIERS.indexOf(bagTier)

  const canToggleShelf = tierIndex >= TIER_READER

  return (
    <div className={`shelf-bag-wrapper${shelfCollapsed ? " shelf-bag-wrapper--shelf-hidden" : ""}${isIOS ? " shelf-bag-wrapper--ios" : ""}`}>
      <Bag
        bagBooks={bagBooks}
        bagCapacity={bagCapacity}
        bagUpgraded={bagUpgraded}
        bagTier={bagTier}
        totalFinished={totalFinished}
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
            tierMaster={TIER_MASTER}
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
