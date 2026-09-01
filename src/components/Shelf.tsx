import { useContext, useMemo, useState } from "react"
import ShelfBookList from "./ShelfBookList"
import AddManualBookForm from "./AddManualBookForm"
import type { Book } from "../types/book"
import { searchBookContext } from "./App"
import type { SHELF_TIERS } from "../hooks/useBookBag"
import { getNextShelfTier } from "../hooks/useBookBag"

interface ShelfProps {
  shelfBooks: Book[]
  shelfHighLight: boolean
  recentlyAddedShelfBookId?: string | null
  tierIndex: number
  tierBookworm: number
  tierScholar: number
  tierMaster: number
  shelfCapacity: number | null
  shelfTier: typeof SHELF_TIERS[number]
  totalFinished: number
  totalWithNote: number
}

type SortKey = "added" | "title" | "author" | "status"
type FilterStatus = "all" | "onRead" | "reading" | "finish"

const STATUS_LABEL: Record<FilterStatus, string> = {
  all: "All",
  onRead: "Unread",
  reading: "Reading",
  finish: "Finished",
}

const STATUS_ORDER: Record<Book["status"], number> = { reading: 0, onRead: 1, finish: 2 }

export default function Shelf({ shelfBooks, shelfHighLight, recentlyAddedShelfBookId, tierIndex, tierBookworm, tierScholar, tierMaster, shelfCapacity, shelfTier, totalFinished, totalWithNote }: ShelfProps) {
  const { handleOpenSearch } = useContext(searchBookContext)
  const [showAddForm, setShowAddForm] = useState(false)
  const [sort, setSort] = useState<SortKey>("added")
  const [filter, setFilter] = useState<FilterStatus>("all")
  const [activeTag, setActiveTag] = useState<string | null>(null)

  const allTags = useMemo(() => {
    const seen = new Set<string>()
    for (const b of shelfBooks) for (const t of (b.tags ?? [])) seen.add(t)
    return [...seen].sort()
  }, [shelfBooks])

  const filteredSorted = useMemo(() => {
    let books = filter === "all" ? shelfBooks : shelfBooks.filter((b) => b.status === filter)
    if (activeTag !== null) books = books.filter((b) => (b.tags ?? []).includes(activeTag))
    books = [...books]
    if (sort === "title")  books.sort((a, b) => a.title.localeCompare(b.title))
    if (sort === "author") books.sort((a, b) => a.author.localeCompare(b.author))
    if (sort === "status") books.sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status])
    // "added" keeps insertion order (no sort)
    return books
  }, [shelfBooks, sort, filter, activeTag])

  return (
    <div>
      <h2 className="topic" id="in-my-shelf">
        My Shelf
      </h2>
      <div className={shelfHighLight ? "shelf-container__highlight" : ""}>
        <div className="shelf-container">
          {shelfBooks.length > 0 && (tierIndex >= tierBookworm || tierIndex >= tierScholar) && (
            <div className="shelf-controls">
              {/* Filter chips — Bookworm Bag+ */}
              {tierIndex >= tierBookworm && (
                <div className="shelf-controls__group">
                  {(["all", "onRead", "reading", "finish"] as FilterStatus[]).map((f) => (
                    <button
                      key={f}
                      className={`shelf-controls__chip ${filter === f ? "shelf-controls__chip--active" : ""}`}
                      onClick={() => setFilter(f)}
                    >
                      {STATUS_LABEL[f]}
                      {f !== "all" && (
                        <span className="shelf-controls__chip-count">
                          {shelfBooks.filter((b) => b.status === f).length}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
              {/* Tag filter chips — shown when any book has tags */}
              {allTags.length > 0 && (
                <div className="shelf-controls__group shelf-controls__group--tags">
                  <button
                    className={`shelf-controls__chip shelf-controls__chip--tag ${activeTag === null ? "shelf-controls__chip--active" : ""}`}
                    onClick={() => setActiveTag(null)}
                  >
                    All tags
                  </button>
                  {allTags.map((tag) => (
                    <button
                      key={tag}
                      className={`shelf-controls__chip shelf-controls__chip--tag ${activeTag === tag ? "shelf-controls__chip--active" : ""}`}
                      onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                    >
                      {tag}
                      <span className="shelf-controls__chip-count">
                        {shelfBooks.filter((b) => (b.tags ?? []).includes(tag)).length}
                      </span>
                    </button>
                  ))}
                </div>
              )}
              {/* Sort select — Scholar's Bag+ */}
              {tierIndex >= tierScholar && (
                <div className="shelf-controls__sort">
                  <label className="shelf-controls__sort-label" htmlFor="shelf-sort">Sort</label>
                  <select
                    id="shelf-sort"
                    className="shelf-controls__sort-select"
                    value={sort}
                    onChange={(e) => setSort(e.target.value as SortKey)}
                  >
                    <option value="added">Date added</option>
                    <option value="title">Title A–Z</option>
                    <option value="author">Author A–Z</option>
                    <option value="status">Status</option>
                  </select>
                </div>
              )}
            </div>
          )}

          {filteredSorted.length === 0 && shelfBooks.length === 0 ? (
            <div className="shelf-empty">
              <svg className="shelf-empty__icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
              <p className="shelf-empty__heading">Your shelf is empty</p>
              <p className="shelf-empty__sub">Search for a book and add it here.</p>
            </div>
          ) : filteredSorted.length === 0 ? (
            <p className="shelf-controls__no-results">No books match this filter.</p>
          ) : (
            <ShelfBookList shelfBooks={filteredSorted} recentlyAddedShelfBookId={recentlyAddedShelfBookId} />
          )}

          <div className="shelf-slot-line">
            <span className={`shelf-slot-text${shelfCapacity !== null && shelfBooks.length >= shelfCapacity ? " shelf-slot-text--full" : ""}`}>
              {shelfBooks.length}{shelfCapacity !== null ? ` / ${shelfCapacity}` : ""} books · {shelfTier.label}
            </span>
            {(() => {
              const next = getNextShelfTier(totalFinished, totalWithNote)
              if (!next) return null
              const needFinished = next.booksFinished - totalFinished
              const needNotes    = next.booksWithNote - totalWithNote
              const parts: string[] = []
              if (needFinished > 0) parts.push(`finish ${needFinished} more book${needFinished !== 1 ? "s" : ""}`)
              if (needNotes    > 0) parts.push(`add ${needNotes} more note${needNotes !== 1 ? "s" : ""}`)
              return (
                <span className="shelf-slot-text">
                  · {parts.join(" and ")} to unlock {next.label}
                </span>
              )
            })()}
          </div>

          <div className="btn--container mt-2">
            <button className="btn btn--optional btn--see-more" onClick={handleOpenSearch}>
              Find a book{" "}
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "middle", marginLeft: "4px" }}>
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
            {tierIndex >= tierBookworm && (
              <button className="btn btn--optional btn--see-more" onClick={() => setShowAddForm(true)}>
                Add your own book{" "}
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "middle", marginLeft: "4px" }}>
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
      {showAddForm && <AddManualBookForm onClose={() => setShowAddForm(false)} />}
    </div>
  )
}
