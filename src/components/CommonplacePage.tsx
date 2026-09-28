import { type MouseEvent, useEffect, useMemo, useState } from "react"
import type { Book, BookQuote } from "../types/book"
import "../css/commonplace.css"

interface CommonplacePageProps {
  shelfBooks: Book[]
  bagBooks: Book[]
  onClose: () => void
}

interface FlatQuote extends BookQuote {
  bookTitle: string
  bookAuthor: string
  bookImageURL: string
  bookId: string
}

export default function CommonplacePage({ shelfBooks, bagBooks, onClose }: CommonplacePageProps) {
  const [filterBookId, setFilterBookId] = useState<string | "all">("all")

  const allBooks = useMemo(() => [...bagBooks, ...shelfBooks], [bagBooks, shelfBooks])

  const flatQuotes = useMemo<FlatQuote[]>(() => {
    const result: FlatQuote[] = []
    for (const book of allBooks) {
      for (const q of (book.quotes ?? [])) {
        result.push({
          ...q,
          bookId: book.id,
          bookTitle: book.title,
          bookAuthor: book.author,
          bookImageURL: book.imageURL,
        })
      }
    }
    // Most recently added first
    return result.sort((a, b) => b.addedAt.localeCompare(a.addedAt))
  }, [allBooks])

  const booksWithQuotes = useMemo(
    () => allBooks.filter((b) => (b.quotes ?? []).length > 0),
    [allBooks],
  )

  const visibleQuotes = useMemo(
    () => filterBookId === "all" ? flatQuotes : flatQuotes.filter((q) => q.bookId === filterBookId),
    [flatQuotes, filterBookId],
  )

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [onClose])

  function handleBackdropClick(e: MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div
      className="search-modal__backdrop"
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
      aria-label="Commonplace Journal"
    >
      <div className="search-modal__panel">

        {/* Header */}
        <div className="search-modal__header">
          <h2 className="search-modal__title">
            <svg className="commonplace__title-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
            Commonplace Journal
          </h2>
          <button className="search-modal__close-btn" onClick={onClose} aria-label="Close" type="button">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="search-modal__body commonplace__body">
          {flatQuotes.length === 0 ? (
            <div className="search-modal__welcome">
              <p className="search-modal__welcome-sub">
                No quotes yet. Open a book on your shelf, tap ···, choose <strong>Quotes</strong>, and add your first passage.
              </p>
            </div>
          ) : (
            <>
              {/* Filter bar */}
              {booksWithQuotes.length > 1 && (
                <div className="commonplace__filter-bar">
                  <button
                    className={`commonplace__filter-pill${filterBookId === "all" ? " commonplace__filter-pill--active" : ""}`}
                    onClick={() => setFilterBookId("all")}
                  >All books</button>
                  {booksWithQuotes.map((b) => (
                    <button
                      key={b.id}
                      className={`commonplace__filter-pill${filterBookId === b.id ? " commonplace__filter-pill--active" : ""}`}
                      onClick={() => setFilterBookId(b.id)}
                    >{b.title}</button>
                  ))}
                </div>
              )}

              {/* Quote cards */}
              <ol className="commonplace__list">
                {visibleQuotes.map((q) => (
                  <li key={q.id} className="commonplace__card">
                    <blockquote className="commonplace__quote">"{q.text}"</blockquote>
                    <div className="commonplace__meta">
                      <img className="commonplace__thumb" src={q.bookImageURL} alt="" loading="lazy" />
                      <div className="commonplace__source">
                        <span className="commonplace__book-title">{q.bookTitle}</span>
                        {q.bookAuthor && q.bookAuthor !== "N/A" && (
                          <span className="commonplace__book-author">{q.bookAuthor}</span>
                        )}
                      </div>
                      {q.page && <span className="commonplace__page">p.&nbsp;{q.page}</span>}
                      <span className="commonplace__date">
                        {new Date(q.addedAt + "T00:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </div>
                  </li>
                ))}
              </ol>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
