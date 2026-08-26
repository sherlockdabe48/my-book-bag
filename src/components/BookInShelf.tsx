import { useContext, useRef, useState, useEffect } from "react"
import { bookBagContext } from "./App"
import type { Book } from "../types/book"

type BookInShelfProps = Pick<Book, "id" | "title" | "author" | "imageURL" | "allPages" | "status" | "note" | "recommendedBy" | "lastReadAt">

export default function BookInShelf({ id, title, author, imageURL, allPages, status, note: initialNote, recommendedBy, lastReadAt }: BookInShelfProps) {
  const {
    handleAddToBagFromShelf,
    handleBookDeleteFromShelf,
    handleBookChangeCover,
    handleBookChangePages,
    handleBookChangeTitle,
    handleBookChangeAuthor,
    handleBookChangeNote,
    handleBookChangeRecommendedBy,
  } = useContext(bookBagContext)

  type EditMode = "menu" | "cover" | "pages" | "title" | "author" | "note" | "recommendedBy" | "confirmRemove" | "confirmCover"
  const [editMode, setEditMode]   = useState<EditMode | null>(null)
  const [skipRemoveConfirm, setSkipRemoveConfirm] = useState(false)
  const [dontShowAgain, setDontShowAgain] = useState(false)

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

  function closeAll() {
    setEditMode(null)
    setUrlInput("")
    setPagesInput("")
    setTitleInput("")
    setAuthorInput("")
    setNoteInput("")
    setRecommendedByInput("")
  }

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
    <div className="book-in-shelf__container">
      <div className="book-in-shelf__cover-wrapper">
        <img className="book-image-in-shelf" src={imageURL} alt={title} loading="lazy" />
        {editMode === null && (
          <div className="book-in-shelf__overlay">
            {status === "finish" && (
              <span className="book-in-shelf__read-badge" aria-label="Already read">✓ Read</span>
            )}
            {status === "reading" && (
              <span className="book-in-shelf__reading-badge" aria-label="In progress">Reading</span>
            )}
            <p className="book-in-shelf__overlay-title">{title}</p>
            <p className="book-in-shelf__overlay-author">{author}</p>
            {recommendedBy && (
              <p className="book-in-shelf__overlay-meta">Rec. by {recommendedBy}</p>
            )}
            {lastReadAt && (status === "reading" || status === "finish") && (
              <p className="book-in-shelf__overlay-meta">
                {new Date(lastReadAt + "T00:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
              </p>
            )}
            <button
              className="book-in-shelf__overlay-btn book-in-shelf__overlay-btn--add"
              onClick={() => handleAddToBagFromShelf(id)}
            >
              Add to Bag
            </button>
            <button
              className="book-in-shelf__overlay-btn book-in-shelf__overlay-btn--cover"
              onClick={() => setEditMode("menu")}
            >
              Edit Book
            </button>
            <button
              className="book-in-shelf__overlay-btn book-in-shelf__overlay-btn--remove"
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
          </div>
        )}
        {/* ── Edit Book sub-menu ─────────────────────────── */}
        {editMode === "menu" && (
          <div className="book-in-shelf__edit-overlay">
            <p className="book-in-shelf__edit-overlay-label">Edit book</p>
            <button className="book-in-shelf__edit-btn book-in-shelf__edit-btn--light" onClick={() => { setTitleInput(title); setEditMode("title") }}>Title</button>
            <button className="book-in-shelf__edit-btn book-in-shelf__edit-btn--light" onClick={() => { setAuthorInput(author); setEditMode("author") }}>Author</button>
            <button className="book-in-shelf__edit-btn book-in-shelf__edit-btn--light" onClick={() => setEditMode("confirmCover")}>Cover</button>
            <button className="book-in-shelf__edit-btn book-in-shelf__edit-btn--light" onClick={() => { setPagesInput(allPages === "N/A" ? "" : String(allPages)); setEditMode("pages") }}>Pages</button>
            <button className="book-in-shelf__edit-btn book-in-shelf__edit-btn--light" onClick={() => { setNoteInput(initialNote); setEditMode("note") }}>My Note</button>
            <button className="book-in-shelf__edit-btn book-in-shelf__edit-btn--light" onClick={() => { setRecommendedByInput(recommendedBy); setEditMode("recommendedBy") }}>Rec. by</button>
            <button className="book-in-shelf__edit-btn book-in-shelf__edit-btn--cancel" onClick={closeAll}>Cancel</button>
          </div>
        )}

        {/* ── Title editor ───────────────────────────────── */}
        {editMode === "title" && (
          <div className="book-in-shelf__edit-overlay">
            <p className="book-in-shelf__edit-overlay-label">Edit title</p>
            <input className="book-in-shelf__edit-input" type="text" value={titleInput} onChange={(e) => setTitleInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleTitleSubmit()} autoFocus />
            <button className="book-in-shelf__edit-btn book-in-shelf__edit-btn--save" onClick={handleTitleSubmit}>Save</button>
            <button className="book-in-shelf__edit-btn book-in-shelf__edit-btn--cancel" onClick={() => setEditMode("menu")}>← Back</button>
          </div>
        )}

        {/* ── Author editor ──────────────────────────────── */}
        {editMode === "author" && (
          <div className="book-in-shelf__edit-overlay">
            <p className="book-in-shelf__edit-overlay-label">Edit author</p>
            <input className="book-in-shelf__edit-input" type="text" value={authorInput} onChange={(e) => setAuthorInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAuthorSubmit()} autoFocus />
            <button className="book-in-shelf__edit-btn book-in-shelf__edit-btn--save" onClick={handleAuthorSubmit}>Save</button>
            <button className="book-in-shelf__edit-btn book-in-shelf__edit-btn--cancel" onClick={() => setEditMode("menu")}>← Back</button>
          </div>
        )}

        {/* ── Cover editor ───────────────────────────────── */}
        {editMode === "cover" && (
          <div className="book-in-shelf__edit-overlay">
            <p className="book-in-shelf__edit-overlay-label">Change cover</p>
            <input className="book-in-shelf__edit-input" type="url" placeholder="https://..." value={urlInput} onChange={(e) => setUrlInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleUrlSubmit()} autoFocus />
            <button className="book-in-shelf__edit-btn book-in-shelf__edit-btn--save" onClick={handleUrlSubmit}>Apply URL</button>
            <button className="book-in-shelf__edit-btn book-in-shelf__edit-btn--light" onClick={() => fileInputRef.current?.click()}>Upload file</button>
            <button className="book-in-shelf__edit-btn book-in-shelf__edit-btn--cancel" onClick={() => setEditMode("menu")}>← Back</button>
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
              onClick={() => setEditMode("menu")}
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
            <input className="book-in-shelf__edit-input" type="number" min={1} placeholder="e.g. 320" value={pagesInput} onChange={(e) => setPagesInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handlePagesSubmit()} autoFocus />
            <button className="book-in-shelf__edit-btn book-in-shelf__edit-btn--save" onClick={handlePagesSubmit}>Save</button>
            <button className="book-in-shelf__edit-btn book-in-shelf__edit-btn--cancel" onClick={() => setEditMode("menu")}>← Back</button>
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
              rows={5}
              autoFocus
            />
            <button className="book-in-shelf__edit-btn book-in-shelf__edit-btn--save" onClick={handleNoteSubmit}>Save</button>
            <button className="book-in-shelf__edit-btn book-in-shelf__edit-btn--cancel" onClick={() => setEditMode("menu")}>← Back</button>
          </div>
        )}

        {/* ── Recommended by editor ──────────────────────── */}
        {editMode === "recommendedBy" && (
          <div className="book-in-shelf__edit-overlay">
            <p className="book-in-shelf__edit-overlay-label">Recommended by</p>
            <input
              className="book-in-shelf__edit-input"
              type="text"
              placeholder="A friend, a blog, …"
              value={recommendedByInput}
              onChange={(e) => setRecommendedByInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRecommendedBySubmit()}
              autoFocus
            />
            <button className="book-in-shelf__edit-btn book-in-shelf__edit-btn--save" onClick={handleRecommendedBySubmit}>Save</button>
            <button className="book-in-shelf__edit-btn book-in-shelf__edit-btn--cancel" onClick={() => setEditMode("menu")}>← Back</button>
          </div>
        )}
      </div>

    </div>
  )
}
