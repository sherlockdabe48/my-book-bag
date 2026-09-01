import { type ChangeEvent, type KeyboardEvent, useCallback, useContext, useEffect, useRef, useState } from "react"
import { bookBagContext } from "./App"
import type { Book } from "../types/book"
import { playBirdFlapSound } from "../utils/sound"

type BookInShelfProps = Pick<Book, "id" | "title" | "author" | "imageURL" | "allPages" | "currentPage" | "status" | "note" | "recommendedBy" | "lastReadAt" | "tags"> & {
  isLanding?: boolean
}

export default function BookInShelf({ id, title, author, imageURL, allPages, currentPage, status, note: initialNote, recommendedBy, lastReadAt, tags: initialTags, isLanding }: BookInShelfProps) {
  const {
    bagCapacity,
    bagCount,
    handleAddToBagFromShelf,
    handleAddToBagWithPages,
    handleBookDeleteFromShelf,
    handleBookChangeCover,
    handleBookChangePages,
    handleBookChangeTitle,
    handleBookChangeAuthor,
    handleBookChangeNote,
    handleBookChangeRecommendedBy,
    handleBookChangeTags,
  } = useContext(bookBagContext)
  const bagFull = bagCount >= bagCapacity

  type EditMode = "menu" | "editBook" | "cover" | "pages" | "title" | "author" | "note" | "recommendedBy" | "tags" | "confirmRemove" | "confirmCover" | "pagesBeforeBag"
  const [editMode, setEditMode]   = useState<EditMode | null>(null)
  const [touched, setTouched] = useState(false)
  const [urlInput, setUrlInput]           = useState("")
  const [pagesInput, setPagesInput]       = useState("")
  const [titleInput, setTitleInput]       = useState("")
  const [authorInput, setAuthorInput]     = useState("")
  const [noteInput, setNoteInput]         = useState("")
  const [recommendedByInput, setRecommendedByInput] = useState("")
  const [tags, setTags]                   = useState<string[]>(initialTags ?? [])
  const [tagInput, setTagInput]           = useState("")
  const fileInputRef                      = useRef<HTMLInputElement>(null)
  const containerRef                      = useRef<HTMLDivElement>(null)

  // Keep local tags in sync when parent updates (e.g. import)
  useEffect(() => { setTags(initialTags ?? []) }, [initialTags])

  const closeAll = useCallback(() => {
    setEditMode(null)
    setTouched(false)
    setUrlInput("")
    setPagesInput("")
    setTitleInput("")
    setAuthorInput("")
    setNoteInput("")
    setRecommendedByInput("")
    setTagInput("")
  }, [])

  function addTag(raw: string) {
    const trimmed = raw.trim().toLowerCase()
    if (!trimmed || tags.includes(trimmed)) { setTagInput(""); return }
    const next = [...tags, trimmed]
    setTags(next)
    handleBookChangeTags(id, next)
    setTagInput("")
  }

  function removeTag(tag: string) {
    const next = tags.filter((t) => t !== tag)
    setTags(next)
    handleBookChangeTags(id, next)
  }

  function handleTagKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(tagInput) }
    if (e.key === "Backspace" && tagInput === "" && tags.length > 0) {
      removeTag(tags[tags.length - 1])
    }
  }

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

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
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

  function handlePagesBeforeBagSubmit() {
    const n = parseInt(pagesInput, 10)
    if (!Number.isFinite(n) || n < 1) return
    handleAddToBagWithPages(id, n)
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
    handleBookChangeRecommendedBy(id, recommendedByInput)
    closeAll()
  }

  return (
    <div className={`book-in-shelf__container${isLanding ? " book-in-shelf__container--landing" : ""}`} ref={containerRef}>
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
              onClick={() => {
                if (bagFull) return
                if (allPages === "N/A") { setPagesInput(""); setEditMode("pagesBeforeBag") }
                else handleAddToBagFromShelf(id)
              }}
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
              onClick={() => setEditMode("confirmRemove")}
            >
              Remove
            </button>
            <button className="book-in-shelf__edit-btn book-in-shelf__edit-btn--cancel" onClick={closeAll}>Cancel</button>
          </div>
        )}

        {/* ── Edit Book sub-menu: Title / Author / Cover / Pages / Tags ── */}
        {editMode === "editBook" && (
          <div className="book-in-shelf__edit-overlay">
            <p className="book-in-shelf__edit-overlay-label">Edit book</p>
            <button className="book-in-shelf__edit-btn book-in-shelf__edit-btn--light" onClick={() => { setTitleInput(title); setEditMode("title") }}>Title</button>
            <button className="book-in-shelf__edit-btn book-in-shelf__edit-btn--light" onClick={() => { setAuthorInput(author); setEditMode("author") }}>Author</button>
            <button className="book-in-shelf__edit-btn book-in-shelf__edit-btn--light" onClick={() => setEditMode("confirmCover")}>Cover</button>
            <button className="book-in-shelf__edit-btn book-in-shelf__edit-btn--light" onClick={() => { setPagesInput(allPages === "N/A" ? "" : String(allPages)); setEditMode("pages") }}>Pages</button>
            <button className="book-in-shelf__edit-btn book-in-shelf__edit-btn--light" onClick={() => { setTagInput(""); setEditMode("tags") }}>Tags</button>
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
              onClick={() => { playBirdFlapSound(); handleBookDeleteFromShelf(id) }}
            >
              Yes, remove it
            </button>
            <button
              className="book-in-shelf__edit-btn book-in-shelf__edit-btn--cancel"
              onClick={() => setEditMode(null)}
            >
              Cancel
            </button>
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

        {/* ── Pages prompt before adding to bag ──────────── */}
        {editMode === "pagesBeforeBag" && (
          <div className="book-in-shelf__edit-overlay">
            <p className="book-in-shelf__edit-overlay-label">How long is this book?</p>
            <p className="book-in-shelf__edit-overlay-body">Enter the page count so you can track progress while reading.</p>
            <input className="book-in-shelf__edit-input" type="number" inputMode="numeric" pattern="[0-9]*" min={1} placeholder="e.g. 320" value={pagesInput} onChange={(e) => setPagesInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handlePagesBeforeBagSubmit()} autoFocus />
            <button className="book-in-shelf__edit-btn book-in-shelf__edit-btn--save" onClick={handlePagesBeforeBagSubmit}>Add to Bag</button>
            <button className="book-in-shelf__edit-btn book-in-shelf__edit-btn--cancel" onClick={closeAll}>Cancel</button>
          </div>
        )}

        {/* ── Tags editor ────────────────────────────────── */}
        {editMode === "tags" && (
          <div className="book-in-shelf__edit-overlay book-in-shelf__edit-overlay--tags">
            <p className="book-in-shelf__edit-overlay-label">Tags</p>
            {tags.length > 0 && (
              <div className="book-in-shelf__tag-pills">
                {tags.map((tag) => (
                  <span key={tag} className="book-in-shelf__tag-pill">
                    {tag}
                    <button
                      className="book-in-shelf__tag-pill-remove"
                      aria-label={`Remove tag ${tag}`}
                      onClick={() => removeTag(tag)}
                    >✕</button>
                  </span>
                ))}
              </div>
            )}
            <input
              className="book-in-shelf__edit-input"
              type="text"
              placeholder="e.g. fiction, history…"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              autoFocus
            />
            <p className="book-in-shelf__edit-overlay-body">Press Enter or comma to add · Backspace to remove last</p>
            <button className="book-in-shelf__edit-btn book-in-shelf__edit-btn--save" onClick={() => { if (tagInput.trim()) addTag(tagInput); setEditMode("editBook") }}>Done</button>
            <button className="book-in-shelf__edit-btn book-in-shelf__edit-btn--cancel" onClick={() => { setTagInput(""); setEditMode("editBook") }}>← Back</button>
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
              onKeyDown={(e) => { if (e.key === "Enter") handleNoteSubmit() }}
            />
            <button className="book-in-shelf__edit-btn book-in-shelf__edit-btn--save" onClick={handleNoteSubmit}>Save</button>
            <button className="book-in-shelf__edit-btn book-in-shelf__edit-btn--cancel" onClick={() => setEditMode("menu")}>← Back</button>
          </div>
        )}
      </div>

      {/* ── Below-cover tag pills ──────────────────────── */}
      {tags.length > 0 && editMode === null && (
        <div className="book-in-shelf__below-tags">
          {tags.map((tag) => (
            <span key={tag} className="book-in-shelf__below-tag">{tag}</span>
          ))}
        </div>
      )}

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
