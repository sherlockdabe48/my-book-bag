import { type ChangeEvent, type KeyboardEvent, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import { bookBagContext } from "./App"
import type { Book } from "../types/book"
import { playPageTurnSound, playBookCloseSound, playReadTodaySound } from "../utils/sound"

type BookInBagProps = Pick<Book, "id" | "title" | "author" | "currentPage" | "allPages" | "imageURL" | "note" | "recommendedBy" | "lastReadAt" | "timesRead"> & {
  isActive: boolean
  isLanding?: boolean
}

function finishedBanner(times: number): string {
  if (times === 1) return "🎉 You finished this book!"
  if (times === 2) return "🎉 You've read this book twice!"
  return `🎉 You've read this book ${times} times!`
}

function formatLastRead(dateStr: string): string {
  if (!dateStr) return ""
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const date = new Date(dateStr + "T00:00:00")
  const diffDays = Math.round((today.getTime() - date.getTime()) / 86400000)
  if (diffDays === 0) return "Last read today"
  if (diffDays === 1) return "Last read yesterday"
  if (diffDays < 7) return `Last read ${diffDays} days ago`
  return `Last read ${date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`
}

const READER_NAME_KEY = "myBookBag.readerName"

const REFLECTION_QUESTIONS = [
  "What's one thing in this book you disagree with?",
  "Which character would you least want to be, and why?",
  "What did this book change your mind about, if anything?",
  "What would you tell a friend who asked if they should read this?",
  "What question does this book leave unanswered?",
  "Was there a moment you wanted to stop reading? What caused it?",
  "What's the one sentence you'd underline if you could only pick one?",
  "Did the ending feel earned? Why or why not?",
  "What did the author assume about you as a reader?",
  "If you could ask the author one question, what would it be?",
  "What will you remember about this book in five years?",
  "Who should read this, and who definitely shouldn't?",
  "What emotion did this book leave you with?",
  "Was there a character you wanted to shake some sense into?",
  "What did this book make you want to do or read next?",
]

export default function BookInBag({ id, title, author, currentPage, allPages, imageURL, note: initialNote, recommendedBy, lastReadAt, timesRead, isActive, isLanding }: BookInBagProps) {
  const { handleMoveToShelfFromBag, handleBagBookProgressChange, handleLogReadingSession, handleBookChangeNote, handleBookChangeRecommendedBy, handleIncrementTimesRead, shelfFull } = useContext(bookBagContext)
  const [progress, setProgress] = useState(currentPage)
  const [isEditing, setIsEditing] = useState(false)
  const [draftProgress, setDraftProgress] = useState(currentPage)
  const [confirmReadAgain, setConfirmReadAgain] = useState(false)
  const [justFinished, setJustFinished] = useState(false)
  const [note, setNote] = useState(initialNote)
  const [menuOpen, setMenuOpen] = useState(false)
  const coverRef = useRef<HTMLDivElement>(null)

  // ── Note flow state ──────────────────────────────
  type NoteStep = "idle" | "writing" | "saved" | "reflecting"
  const [noteStep, setNoteStep] = useState<NoteStep>("idle")
  const [noteDraft, setNoteDraft] = useState("")
  const [readerName, setReaderName] = useState(() => localStorage.getItem(READER_NAME_KEY) ?? "")
  const [recByDraft, setRecByDraft] = useState(recommendedBy)

  // Keep local progress in sync when the parent updates currentPage
  // (e.g. after rehydrating from localStorage)
  useEffect(() => {
    setProgress(currentPage)
    setDraftProgress(currentPage)
  }, [currentPage])

  // Keep local note in sync when the parent updates it
  // (e.g. after editing on the shelf and moving back to the bag)
  useEffect(() => {
    setNote(initialNote)
    // If we were in "saved" step and note changed externally, stay idle
    setNoteStep("idle")
  }, [initialNote])
  // Close action menu when clicking outside the cover
  const closeMenu = useCallback(() => setMenuOpen(false), [])
  useEffect(() => {
    if (!menuOpen) return
    function handleOutside(e: MouseEvent) {
      if (coverRef.current && !coverRef.current.contains(e.target as Node)) closeMenu()
    }
    document.addEventListener("mousedown", handleOutside)
    return () => document.removeEventListener("mousedown", handleOutside)
  }, [menuOpen, closeMenu])

  const inputRef = useRef<HTMLInputElement>(null)
  const maxPages = allPages === "N/A" ? null : Number(allPages)
  const atLastPage = maxPages !== null && Number(progress) >= maxPages
  const everFinished = timesRead > 0
  const todayStr = new Date().toISOString().slice(0, 10)
  const alreadyReadToday = lastReadAt === todayStr

  function applyProgress(next: number) {
    if (maxPages === null) return
    if (Number.isNaN(next) || next < 0) next = 0
    if (next > maxPages) next = maxPages
    setProgress(next)
    setDraftProgress(next)
    handleBagBookProgressChange(id, next)
    playPageTurnSound()
  }

  function doFinish() {
    handleIncrementTimesRead(id)
    setJustFinished(true)
    playBookCloseSound()
  }

  function commitEdit() {
    applyProgress(Number(draftProgress))
    setIsEditing(false)
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") { e.preventDefault(); commitEdit() }
    if (e.key === "Escape") { setIsEditing(false); setDraftProgress(progress) }
  }

  function handleDraftChange(e: ChangeEvent<HTMLInputElement>) {
    setDraftProgress(Number(e.target.value))
  }

  function startEditing() {
    setDraftProgress(progress)
    setIsEditing(true)
    requestAnimationFrame(() => {
      inputRef.current?.focus()
      inputRef.current?.select()
    })
  }

  const reflectionQuestion = useMemo(
    () => REFLECTION_QUESTIONS[Math.floor(Math.random() * REFLECTION_QUESTIONS.length)],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  function handleFinishBook() {
    if (atLastPage && everFinished) {
      setConfirmReadAgain(true)
      return
    }
    setNoteDraft("")
    setNoteStep("reflecting")
    setMenuOpen(false)
  }

  function commitFinish() {
    if (noteDraft.trim()) {
      const name = readerName.trim() || "Reader"
      if (readerName.trim()) localStorage.setItem(READER_NAME_KEY, readerName.trim())
      const date = new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })
      const signed = `${reflectionQuestion}\n${noteDraft.trimEnd()}\n\n— ${name}, ${date}`
      setNote(signed)
      handleBookChangeNote(id, signed)
    }
    doFinish()
    setNoteStep("idle")
  }

  function confirmReset() {
    setProgress(1)
    handleBagBookProgressChange(id, 1)
    setConfirmReadAgain(false)
    setJustFinished(false)
  }

  function openNoteWriter() {
    // Strip any existing signature line so the user only edits their prose
    const existing = note.replace(/\n\n—[^\n]+$/, "")
    setNoteDraft(existing)
    setRecByDraft(recommendedBy)
    setNoteStep("writing")
  }

  function saveNote() {
    const name = readerName.trim() || "Reader"
    if (readerName.trim()) localStorage.setItem(READER_NAME_KEY, readerName.trim())
    const date = new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })
    const signed = `${noteDraft.trimEnd()}\n\n— ${name}, ${date}`
    setNote(signed)
    handleBookChangeNote(id, signed)
    handleBookChangeRecommendedBy(id, recByDraft.trim())
    setNoteStep("saved")
  }

  return (
    <div className={`book-in-bag__container${isLanding ? " book-in-bag__container--landing" : ""}`}>
      <div className="book-in-bag__cover-wrapper" ref={coverRef}>
        <img className="book-image-in-bag" src={imageURL} alt={title} loading="lazy" />
        <div className={`book-in-bag__bookmark ${isActive ? "book-in-bag__bookmark--active" : ""}`} aria-label={isActive ? "Currently reading" : "In your bag"}>
          <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 3a2 2 0 0 0-2 2v16l7-3 7 3V5a2 2 0 0 0-2-2H5z"/>
          </svg>
        </div>

        {/* ── ⋯ button ───────────────────────────────── */}
        {!menuOpen && (
          <button
            className="book-in-bag__dots-btn"
            aria-label="Book actions"
            onClick={() => setMenuOpen(true)}
          >
            ···
          </button>
        )}

        {/* ── Action menu over cover ──────────────────── */}
        {menuOpen && (
          <div className="book-in-bag__action-menu">
            {confirmReadAgain ? (
              <>
                <p className="book-in-bag__menu-label">Read again?</p>
                <button className="book-in-bag__menu-btn book-in-bag__menu-btn--danger" onClick={() => { confirmReset(); setMenuOpen(false) }}>Yes, reset</button>
                <button className="book-in-bag__menu-btn book-in-bag__menu-btn--cancel" onClick={() => setConfirmReadAgain(false)}>Cancel</button>
              </>
            ) : (
              <>
                <p className="book-in-bag__menu-label">Actions</p>
                <button className="book-in-bag__menu-btn" onClick={() => { openNoteWriter(); setMenuOpen(false) }}>✏️ My note</button>
                <button className="book-in-bag__menu-btn" onClick={() => { handleFinishBook() }}>
                  {atLastPage && everFinished ? "Read Again" : "Finish"}
                </button>
                <button
                  className="book-in-bag__menu-btn book-in-bag__menu-btn--shelf"
                  onClick={() => { handleMoveToShelfFromBag(id, note); setMenuOpen(false) }}
                  disabled={shelfFull}
                  title={shelfFull ? "Your shelf is full — upgrade it by finishing more books and adding notes" : undefined}
                >Back to Shelf{shelfFull ? " (shelf full)" : ""}</button>
                <button className="book-in-bag__menu-btn book-in-bag__menu-btn--cancel" onClick={closeMenu}>Cancel</button>
              </>
            )}
          </div>
        )}
      </div>
      <div className="book-in-bag__detail-grid">

        {/* ── Book meta ──────────────────────────────── */}
        <div className="book-in-bag__meta-block">
          <p className="book-in-bag__title">{title}</p>
          <dl className="book-in-bag__dl">
            <div className="book-in-bag__dl-row">
              <dt>By</dt>
              <dd>{author}</dd>
            </div>
            {recommendedBy && (
              <div className="book-in-bag__dl-row">
                <dt>Rec. by</dt>
                <dd>{recommendedBy}</dd>
              </div>
            )}
          </dl>
        </div>

        {justFinished && (
          <p className="book-in-bag__finished-banner">{finishedBanner(timesRead)}</p>
        )}
        {noteStep === "reflecting" && (
          <div className="book-in-bag__note-editor">
            <p className="book-in-bag__reflection-question">{reflectionQuestion}</p>
            <textarea
              className="book-in-bag__note-textarea"
              placeholder="Your answer… (or skip to finish without a note)"
              value={noteDraft}
              onChange={(e) => setNoteDraft(e.target.value)}
              rows={3}
              autoFocus
            />
            <input
              className="book-in-bag__note-name-input"
              type="text"
              placeholder="Your name (for the signature)"
              value={readerName}
              onChange={(e) => setReaderName(e.target.value)}
            />
            <div className="book-in-bag__note-actions">
              <button className="book-in-bag__note-save-btn" onClick={commitFinish}>Finish & save</button>
              <button className="book-in-bag__note-cancel-btn" onClick={() => { doFinish(); setNoteStep("idle") }}>Skip</button>
            </div>
          </div>
        )}
        {noteStep === "writing" && (
          <div className="book-in-bag__note-editor">
            <textarea
              className="book-in-bag__note-textarea"
              placeholder="Your thoughts on this book…"
              value={noteDraft}
              onChange={(e) => setNoteDraft(e.target.value)}
              rows={4}
              autoFocus
            />
            <input
              className="book-in-bag__note-name-input"
              type="text"
              placeholder="Recommended by (a friend, a blog, …)"
              value={recByDraft}
              onChange={(e) => setRecByDraft(e.target.value)}
            />
            <input
              className="book-in-bag__note-name-input"
              type="text"
              placeholder="Your name (for the signature)"
              value={readerName}
              onChange={(e) => setReaderName(e.target.value)}
            />
            <div className="book-in-bag__note-actions">
              <button className="book-in-bag__note-save-btn" onClick={saveNote}>Save</button>
              <button className="book-in-bag__note-cancel-btn" onClick={() => setNoteStep("idle")}>Cancel</button>
            </div>
          </div>
        )}
        {noteStep === "saved" && (
          <div className="book-in-bag__note-saved">
            <span className="book-in-bag__note-saved-text">✓ Note saved</span>
            <button className="book-in-bag__note-invite" onClick={openNoteWriter}>Edit →</button>
          </div>
        )}
        {/* ── Progress section ───────────────────────── */}
        <div className="book-in-bag__progress-section">
          <div className="book-in-bag__progress-row">
            <div className="book-in-bag__scroller-wrap">
              <button
                className="book-in-bag__scroller-btn"
                onClick={() => applyProgress(Number(progress) - 1)}
                disabled={Number(progress) <= 0 || maxPages === null}
                aria-label="Previous page"
              >−</button>
              <input
                ref={inputRef}
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                value={isEditing ? draftProgress : progress}
                min={0}
                max={maxPages ?? undefined}
                className="book-in-bag__scroller-input"
                onChange={handleDraftChange}
                onFocus={startEditing}
                onBlur={commitEdit}
                onKeyDown={handleKeyDown}
                aria-label="Current page"
                disabled={maxPages === null}
              />
              <button
                className="book-in-bag__scroller-btn"
                onClick={() => applyProgress(Number(progress) + 1)}
                disabled={maxPages === null || Number(progress) >= maxPages}
                aria-label="Next page"
              >+</button>
            </div>
            <span className="book-in-bag__progress-text">/ {allPages} pages</span>
            {lastReadAt && (
              <span className="book-in-bag__last-read">{formatLastRead(lastReadAt)}</span>
            )}
          </div>
          <div
            className="book-in-bag__progress-bar-wrapper"
            role="progressbar"
            aria-valuenow={Number(progress)}
            aria-valuemin={0}
            aria-valuemax={maxPages ?? 0}
            aria-label={`Page ${progress} of ${allPages}`}
          >
            <div
              className="book-in-bag__progress-bar"
              style={{ width: maxPages ? `${Math.min(100, (Number(progress) / maxPages) * 100)}%` : "0%" }}
            />
          </div>
          {atLastPage && !everFinished && noteStep !== "reflecting" && (
            <div className="book-in-bag__finish-nudge">
              <p className="book-in-bag__finish-nudge-quote">The last page doesn't finish itself — you do.</p>
              <button className="book-in-bag__finish-nudge-btn" onClick={handleFinishBook}>
                Finish this book →
              </button>
            </div>
          )}
          {!atLastPage && (
            <button
              className="book-in-bag__read-today-btn"
              onClick={() => { playReadTodaySound(); handleLogReadingSession(id) }}
              disabled={alreadyReadToday}
              title={alreadyReadToday ? "You've already logged a reading session today" : undefined}
            >
              {alreadyReadToday ? "✅ Read today" : "📖 I read today"}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
