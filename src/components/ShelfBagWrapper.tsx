import Shelf from "./Shelf"
import Bag from "./Bag"
import type { Book } from "../types/book"
import type { BAG_TIERS } from "../hooks/useBookBag"

interface ShelfBagWrapperProps {
  bagBooks: Book[]
  shelfBooks: Book[]
  shelfHighLight: boolean
  bagCapacity: number
  bagUpgraded: boolean
  bagTier: typeof BAG_TIERS[number]
  totalFinished: number
}

export default function ShelfBagWrapper({
  bagBooks,
  shelfBooks,
  shelfHighLight,
  bagCapacity,
  bagUpgraded,
  bagTier,
  totalFinished,
}: ShelfBagWrapperProps) {
  return (
    <div className="shelf-bag-wrapper">
      <Bag
        bagBooks={bagBooks}
        bagCapacity={bagCapacity}
        bagUpgraded={bagUpgraded}
        bagTier={bagTier}
        totalFinished={totalFinished}
      />
      <Shelf
        shelfBooks={shelfBooks}
        shelfHighLight={shelfHighLight}
      />
    </div>
  )
}
