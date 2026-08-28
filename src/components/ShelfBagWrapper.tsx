import type React from "react"
import Shelf from "./Shelf"
import Bag from "./Bag"
import type { Book } from "../types/book"
import type { BAG_TIERS } from "../hooks/useBookBag"
import { Capacitor } from "@capacitor/core"

interface ShelfBagWrapperProps {
  bagBooks: Book[]
  shelfBooks: Book[]
  shelfHighLight: boolean
  bagCapacity: number
  bagUpgraded: boolean
  bagTier: typeof BAG_TIERS[number]
  totalFinished: number
  shelfCollapsed: boolean
  setShelfCollapsed: React.Dispatch<React.SetStateAction<boolean>>
  recentlyAddedShelfBookId?: string | null
  recentlyAddedBagBookId?: string | null
}

export default function ShelfBagWrapper({
  bagBooks,
  shelfBooks,
  shelfHighLight,
  bagCapacity,
  bagUpgraded,
  bagTier,
  totalFinished,
  shelfCollapsed,
  setShelfCollapsed,
  recentlyAddedShelfBookId,
  recentlyAddedBagBookId,
}: ShelfBagWrapperProps) {

  const isIOS = Capacitor.getPlatform() === "ios"

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
        {!shelfCollapsed && (
          <Shelf
            shelfBooks={shelfBooks}
            shelfHighLight={shelfHighLight}
            recentlyAddedShelfBookId={recentlyAddedShelfBookId}
          />
        )}
      </div>
    </div>
  )
}
