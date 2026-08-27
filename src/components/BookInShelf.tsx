import { useContext, useRef, useState, useEffect, useCallback } from "react"
import { bookBagContext } from "./App"
import type { Book } from "../types/book"

type BookInShelfProps = Pick<Book, "id" | "title" | "author" | "imageURL" | "allPages" | "currentPage" | "status" | "note" | "recommendedBy" | "lastReadAt">

export default function BookInShelf({ id, title, author, imageURL, allPages, currentPage, status, note: initialNote, recommendedBy, lastReadAt }: BookInShelfProps) {
  const {
    bagCapacity,
    bagCount,
    handleAddToBagFromShelf,
    handleBookDeleteFromShelf,
    handleBookChangeCover,
    handleBookChangePages,
    handleBookChangeTitle,
    handleBookChangeAuthor,
    handleBookChangeNote,
    handleBookChangeRecommendedBy,
  } = useContext(bookBagContext)
  const bagFull = bagCount >= bagCapacity

  type EditMode = "menu" | "editBook" | "cover" | "pages" | "title" | "author" | "note" | "recommendedBy" | "confirmRemove" | "confirmCover"
  const [editMode, setEditMode]   = useState<EditMode | null>(null)
  const [skipRemoveConfirm, setSkipRemoveConfirm] = useState(false)
  const [dontShowAgain, setDontShowAgain] = useState(false)
  const [touched, setTouched] = useState(false)

  // Load "don't show again" preference from localStorage on mount
  useEffect(() => {
    setSkipRemoveConfirm(localStorage.getItem("myBookBag.skipRemoveConfirm") === "true")
  }, [])
  const [urlInput, setUrlInput]           = useState("")
  const [pagesInput, setPagesInput]       = useState("")
  const [titleInput, setTitleInput]       = useState("")
  const [authorInput, setAuthorInput]     = useState("")
  const [noteInput, setNoteInput]         = useState("")
  const [recommendedByInput, setRecommendedByInput] = useState("")
  const fileInputRef                      = useRef<HTMLInputElement>(null)
  const containerRef                      = useRef<HTMLDivElement>(null)

  const closeAll = useCallback(() => {
    setEditMode(null)
    setTouched(false)
    setUrlInput("")
    setPagesInput("")
    setTitleInput("")
    setAuthorInput("")
    setNoteInput("")
    setRecommendedByInput("")
  }, [])

  // Close edit menu / hide dots when clicking or tapping outside this book card
  useEffect(() => {
    if (editMode === null && !touched) return
    function handleOutside(e: MouseEvent | TouchEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        closeAll()
      }
    }
    document.addEventListener("mousedown", handleOutside)
    document.addEventListener("touchstart", handleOutside)
    return () => {
      document.removeEventListener("mousedown", handleOutside)
      document.removeEventListener("touchstart", handleOutside)
    }
  }, [editMode, touched, closeAll])

  function handleUrlSubmit() {
    const trimmed = urlInput.trim()
    if (!trimmed) return
    handleBookChangeCover(id, trimmed)
    closeAll()
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const result = ev.target?.result
      if (typeof result === "string") {
        handleBookChangeCover(id, result)
        closeAll()
      }
    }
    reader.readAsDataURL(file)
  }

  function handlePagesSubmit() {
    const n = parseInt(pagesInput, 10)
    if (!Number.isFinite(n) || n < 1) return
    handleBookChangePages(id, n)
    closeAll()
  }

  function handleTitleSubmit() {
    const trimmed = titleInput.trim()
    if (!trimmed) return
    handleBookChangeTitle(id, trimmed)
    closeAll()
  }

  function handleAuthorSubmit() {
    const trimmed = authorInput.trim()
    if (!trimmed) return
    handleBookChangeAuthor(id, trimmed)
    closeAll()
  }

  function handleNoteSubmit() {
    handleBookChangeNote(id, noteInput)
    closeAll()
  }

  function handleRecommendedBySubmit() {
    handleBookChangeRecommendedBy(id, recommendedByInput)
    closeAll()
  }

  return (
    <div className="book-in-shelf__container" ref={containerRef}>
      <div
        className={`book-in-shelf__cover-wrapper${touched ? " book-in-shelf__cover-wrapper--touched" : ""}`}
        onTouchStart={() => setTouched(true)}
      >
        <img className="book-image-in-shelf" src={imageURL} alt={title} loading="lazy" />

        {/* ── Status badges — always visible ─────────────── */}
        {status === "finish" && (
          <span className="book-in-shelf__read-badge" aria-label="Already read">✓ Read</span>
        )}
        {status === "reading" && (
          <span className="book-in-shelf__reading-badge" aria-label="In progress">Reading</span>
        )}

        {/* ── ⋯ menu button — visible on hover / tap ──────── */}
        {editMode === null && (
          <button
            className="book-in-shelf__dots-btn"
            aria-label="Book options"
            onClick={(e) => { e.stopPropagation(); setTouched(false); setEditMode("menu") }}
          >
            ···
          </button>
        )}

        {/* ── Hover overlay — Add to Bag only ────────────── */}
        {editMode === null && (
          <div className="book-in-shelf__overlay">
            <button
              className={`book-in-shelf__overlay-btn book-in-shelf__overlay-btn--add${bagFull ? " book-in-shelf__overlay-btn--disabled" : ""}`}
              onClick={() => !bagFull && handleAddToBagFromShelf(id)}
              title={bagFull ? `Bag is full (${bagCount}/${bagCapacity}) — finish a book to unlock more space` : undefined}
            >
              {bagFull ? "🎒 Bag full" : "Add to Bag"}
            </button>
          </div>
        )}
        {/* ── ⋯ top-level menu: Edit Book / My Note / Remove ── */}
        {editMode === "menu" && (
          <div className="book-in-shelf__edit-overlay">
            <p className="book-in-shelf__edit-overlay-label">Options</p>
            <button className="book-in-shelf__edit-btn book-in-shelf__edit-btn--light" onClick={() => setEditMode("editBook")}>Edit Book</button>
            <button className="book-in-shelf__edit-btn book-in-shelf__edit-btn--light" onClick={() => { setNoteInput(initialNote); setRecommendedByInput(recommendedBy); setEditMode("note") }}>My Note</button>
            <button
              className="book-in-shelf__edit-btn book-in-shelf__edit-btn--remove"
              onClick={() => {
                if (skipRemoveConfirm) {
                  handleBookDeleteFromShelf(id)
                } else {
                  setDontShowAgain(false)
                  setEditMode("confirmRemove")
                }
              }}
            >
              Remove
            </button>
            <button className="book-in-shelf__edit-btn book-in-shelf__edit-btn--cancel" onClick={closeAll}>Cancel</button>
          </div>
        )}

        {/* ── Edit Book sub-menu: Title / Author / Cover / Pages ── */}
        {editMode === "editBook" && (
          <div className="book-in-shelf__edit-overlay">
            <p className="book-in-shelf__edit-overlay-label">Edit book</p>
            <button className="book-in-shelf__edit-btn book-in-shelf__edit-btn--light" onClick={() => { setTitleInput(title); setEditMode("title") }}>Title</button>
            <button className="book-in-shelf__edit-btn book-in-shelf__edit-btn--light" onClick={() => { setAuthorInput(author); setEditMode("author") }}>Author</button>
            <button className="book-in-shelf__edit-btn book-in-shelf__edit-btn--light" onClick={() => setEditMode("confirmCover")}>Cover</button>
            <button className="book-in-shelf__edit-btn book-in-shelf__edit-btn--light" onClick={() => { setPagesInput(allPages === "N/A" ? "" : String(allPages)); setEditMode("pages") }}>Pages</button>
            <button className="book-in-shelf__edit-btn book-in-shelf__edit-btn--cancel" onClick={() => setEditMode("menu")}>← Back</button>
          </div>
        )}

        {/* ── Title editor ───────────────────────────────── */}
        {editMode === "title" && (
          <div className="book-in-shelf__edit-overlay">
            <p className="book-in-shelf__edit-overlay-label">Edit title</p>
            <input className="book-in-shelf__edit-input" type="text" value={titleInput} onChange={(e) => setTitleInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleTitleSubmit()} autoFocus />
            <button className="book-in-shelf__edit-btn book-in-shelf__edit-btn--save" onClick={handleTitleSubmit}>Save</button>
            <button className="book-in-shelf__edit-btn book-in-shelf__edit-btn--cancel" onClick={() => setEditMode("editBook")}>← Back</button>
          </div>
        )}

        {/* ── Author editor ──────────────────────────────── */}
        {editMode === "author" && (
          <div className="book-in-shelf__edit-overlay">
            <p className="book-in-shelf__edit-overlay-label">Edit author</p>
            <input className="book-in-shelf__edit-input" type="text" value={authorInput} onChange={(e) => setAuthorInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAuthorSubmit()} autoFocus />
            <button className="book-in-shelf__edit-btn book-in-shelf__edit-btn--save" onClick={handleAuthorSubmit}>Save</button>
            <button className="book-in-shelf__edit-btn book-in-shelf__edit-btn--cancel" onClick={() => setEditMode("editBook")}>← Back</button>
          </div>
        )}

        {/* ── Cover editor ───────────────────────────────── */}
        {editMode === "cover" && (
          <div className="book-in-shelf__edit-overlay">
            <p className="book-in-shelf__edit-overlay-label">Change cover</p>
            <input className="book-in-shelf__edit-input" type="url" placeholder="https://..." value={urlInput} onChange={(e) => setUrlInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleUrlSubmit()} autoFocus />
            <button className="book-in-shelf__edit-btn book-in-shelf__edit-btn--save" onClick={handleUrlSubmit}>Apply URL</button>
            <button className="book-in-shelf__edit-btn book-in-shelf__edit-btn--light" onClick={() => fileInputRef.current?.click()}>Upload file</button>
            <button className="book-in-shelf__edit-btn book-in-shelf__edit-btn--cancel" onClick={() => setEditMode("editBook")}>← Back</button>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileChange} />
          </div>
        )}

        {/* ── Cover-change confirm ───────────────────────── */}
        {editMode === "confirmCover" && (
          <div className="book-in-shelf__edit-overlay">
            <p className="book-in-shelf__edit-overlay-label">Change cover?</p>
            <p className="book-in-shelf__edit-overlay-body">This is permanent — you won't be able to revert to the original.</p>
            <button
              className="book-in-shelf__edit-btn book-in-shelf__edit-btn--save"
              onClick={() => setEditMode("cover")}
            >
              Continue
            </button>
            <button
              className="book-in-shelf__edit-btn book-in-shelf__edit-btn--cancel"
              onClick={() => setEditMode("editBook")}
            >
              Cancel
            </button>
          </div>
        )}

        {/* ── Remove confirm ─────────────────────────────── */}
        {editMode === "confirmRemove" && (
          <div className="book-in-shelf__edit-overlay">
            <p className="book-in-shelf__edit-overlay-label">Remove book?</p>
            <p className="book-in-shelf__edit-overlay-body">This book will be tossed away from your shelf.</p>
            <button
              className="book-in-shelf__edit-btn book-in-shelf__edit-btn--remove"
              onClick={() => {
                if (dontShowAgain) {
                  localStorage.setItem("myBookBag.skipRemoveConfirm", "true")
                  setSkipRemoveConfirm(true)
                }
                handleBookDeleteFromShelf(id)
              }}
            >
              Yes, remove it
            </button>
            <button
              className="book-in-shelf__edit-btn book-in-shelf__edit-btn--cancel"
              onClick={() => setEditMode(null)}
            >
              Cancel
            </button>
            <label className="book-in-shelf__edit-dont-show">
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
              />
              Don't ask me again
            </label>
          </div>
        )}

        {/* ── Pages editor ───────────────────────────────── */}
        {editMode === "pages" && (
          <div className="book-in-shelf__edit-overlay">
            <p className="book-in-shelf__edit-overlay-label">
              Pages{allPages !== "N/A" ? ` (now: ${allPages})` : ""}
            </p>
            <input className="book-in-shelf__edit-input" type="number" inputMode="numeric" pattern="[0-9]*" min={1} placeholder="e.g. 320" value={pagesInput} onChange={(e) => setPagesInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handlePagesSubmit()} autoFocus />
            <button className="book-in-shelf__edit-btn book-in-shelf__edit-btn--save" onClick={handlePagesSubmit}>Save</button>
            <button className="book-in-shelf__edit-btn book-in-shelf__edit-btn--cancel" onClick={() => setEditMode("editBook")}>← Back</button>
          </div>
        )}

        {/* ── Note editor ────────────────────────────────── */}
        {editMode === "note" && (
          <div className="book-in-shelf__edit-overlay book-in-shelf__edit-overlay--note">
            <p className="book-in-shelf__edit-overlay-label">My note</p>
            <textarea
              className="book-in-shelf__edit-textarea"
              placeholder="Your thoughts on this book…"
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              rows={4}
              autoFocus
            />
            <input
              className="book-in-shelf__edit-input"
              type="text"
              placeholder="Recommended by (a friend, a blog, …)"
              value={recommendedByInput}
              onChange={(e) => setRecommendedByInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { handleNoteSubmit(); handleRecommendedBySubmit() } }}
            />
            <button className="book-in-shelf__edit-btn book-in-shelf__edit-btn--save" onClick={() => { handleNoteSubmit(); handleRecommendedBySubmit() }}>Save</button>
            <button className="book-in-shelf__edit-btn book-in-shelf__edit-btn--cancel" onClick={() => setEditMode("menu")}>← Back</button>
          </div>
        )}
      </div>

      {/* ── Below-cover meta: last read + progress ─────── */}
      {lastReadAt && (status === "reading" || status === "finish") && (
        <div className="book-in-shelf__meta">
          <span className="book-in-shelf__meta-date">
            {new Date(lastReadAt + "T00:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
          </span>
          {status === "reading" && typeof currentPage === "number" && typeof allPages === "number" && allPages > 0 && (
            <span className="book-in-shelf__meta-pct">
              {Math.round((currentPage / allPages) * 100)}%
            </span>
          )}
        </div>
      )}
    </div>
  )
}
