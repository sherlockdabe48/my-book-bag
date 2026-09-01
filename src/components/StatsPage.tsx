import { type MouseEvent, useEffect, useMemo } from "react"
import type { Book } from "../types/book"
import "../css/stats.css"

interface StatsPageProps {
  shelfBooks: Book[]
  bagBooks: Book[]
  readingStreak: number
  onClose: () => void
}

// ── Helpers ────────────────────────────────────────────────────────────────

function totalPagesLogged(books: Book[]): number {
  return books.reduce((sum, b) => {
    const p = Number(b.currentPage)
    return sum + (isNaN(p) ? 0 : p)
  }, 0)
}

function topAuthors(books: Book[], n = 5): { author: string; count: number }[] {
  const map: Record<string, number> = {}
  for (const b of books) {
    if (!b.author || b.author === "N/A") continue
    map[b.author] = (map[b.author] ?? 0) + (b.timesRead > 0 ? b.timesRead : 0)
  }
  return Object.entries(map)
    .filter(([, c]) => c > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, n)
    .map(([author, count]) => ({ author, count }))
}

/** Count distinct days read per month across last 12 months.
 *  Each book contributes its lastReadAt date — multiple books read on the
 *  same day count as one active day, not multiple. */
function activeDaysByMonth(books: Book[]): { label: string; count: number }[] {
  const now = new Date()
  const months: { label: string; key: string }[] = []
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    const label = d.toLocaleString("default", { month: "short" })
    months.push({ label, key })
  }

  // Collect all distinct lastReadAt dates that fall inside the 12-month window
  const monthKeys = new Set(months.map((m) => m.key))
  const daysByMonth: Record<string, Set<string>> = {}
  for (const b of books) {
    if (!b.lastReadAt) continue
    const monthKey = b.lastReadAt.slice(0, 7) // "YYYY-MM"
    if (!monthKeys.has(monthKey)) continue
    if (!daysByMonth[monthKey]) daysByMonth[monthKey] = new Set()
    daysByMonth[monthKey].add(b.lastReadAt)   // full "YYYY-MM-DD" — deduplicates same-day reads
  }

  return months.map(({ label, key }) => ({
    label,
    count: daysByMonth[key]?.size ?? 0,
  }))
}

// ── Mini bar chart (pure SVG, no deps) ────────────────────────────────────

function BarChart({ data }: { data: { label: string; count: number }[] }) {
  const maxVal = Math.max(...data.map((d) => d.count), 1)
  const W = 580
  const H = 80
  const barW = Math.floor((W - (data.length - 1) * 4) / data.length)
  const gap = 4

  return (
    <svg
      viewBox={`0 0 ${W} ${H + 20}`}
      className="stats-chart"
      role="img"
      aria-label="Days read per month, last 12 months"
    >
      {data.map((d, i) => {
        const barH = Math.max(d.count === 0 ? 2 : Math.round((d.count / maxVal) * H), 2)
        const x = i * (barW + gap)
        const y = H - barH
        return (
          <g key={d.label + i}>
            <rect
              x={x}
              y={y}
              width={barW}
              height={barH}
              rx={2}
              className={d.count > 0 ? "stats-chart__bar--active" : "stats-chart__bar--empty"}
            />
            <text
              x={x + barW / 2}
              y={H + 14}
              textAnchor="middle"
              className="stats-chart__label"
            >
              {d.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

// ── Component ─────────────────────────────────────────────────────────────

export default function StatsPage({ shelfBooks, bagBooks, readingStreak, onClose }: StatsPageProps) {
  const allBooks = useMemo(() => [...bagBooks, ...shelfBooks], [bagBooks, shelfBooks])

  const totalFinished   = useMemo(() => allBooks.reduce((s, b) => s + (b.timesRead ?? 0), 0), [allBooks])
  const currentlyReading = useMemo(() => bagBooks.length, [bagBooks])
  const onShelf         = useMemo(() => shelfBooks.length, [shelfBooks])
  const pagesLogged     = useMemo(() => totalPagesLogged(allBooks), [allBooks])
  const authors         = useMemo(() => topAuthors(allBooks), [allBooks])
  const monthData       = useMemo(() => activeDaysByMonth(allBooks), [allBooks])

  const hasAnyData = allBooks.length > 0

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
      aria-label="Reading Stats"
    >
      <div className="search-modal__panel">

        {/* Header */}
        <div className="search-modal__header">
          <h2 className="search-modal__title">
            <svg className="stats-modal__title-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4"  />
              <line x1="6"  y1="20" x2="6"  y2="14" />
            </svg>
            Reading Stats
          </h2>
          <button
            className="search-modal__close-btn"
            onClick={onClose}
            aria-label="Close"
            type="button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6"  y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="search-modal__body stats-modal__body">

          {!hasAnyData ? (
            <div className="search-modal__welcome">
              <p className="search-modal__welcome-sub">
                Add books to your shelf or bag to see your reading stats here.
              </p>
            </div>
          ) : (
            <>
              {/* Stat tiles */}
              <div className="stats-modal__grid">
                <div className="stats-modal__tile">
                  <span className="stats-modal__tile-value">{totalFinished}</span>
                  <span className="stats-modal__tile-label">Books finished</span>
                </div>
                <div className="stats-modal__tile">
                  <span className="stats-modal__tile-value">{currentlyReading}</span>
                  <span className="stats-modal__tile-label">In bag now</span>
                </div>
                <div className="stats-modal__tile">
                  <span className="stats-modal__tile-value">{onShelf}</span>
                  <span className="stats-modal__tile-label">On shelf</span>
                </div>
                <div className="stats-modal__tile">
                  <span className="stats-modal__tile-value">{pagesLogged.toLocaleString()}</span>
                  <span className="stats-modal__tile-label">Pages logged</span>
                </div>
                <div className="stats-modal__tile">
                  <span className={`stats-modal__tile-value${readingStreak > 0 ? " stats-modal__tile-value--streak" : ""}`}>
                    {readingStreak > 0 ? `${readingStreak}d` : "—"}
                  </span>
                  <span className="stats-modal__tile-label">Day streak</span>
                </div>
              </div>

              {/* Monthly chart */}
              <section className="stats-modal__section">
                <h3 className="stats-modal__section-title">Days read · last 12 months</h3>
                <BarChart data={monthData} />
              </section>

              {/* Top authors */}
              {authors.length > 0 && (
                <section className="stats-modal__section">
                  <h3 className="stats-modal__section-title">Most-read authors</h3>
                  <ol className="stats-modal__authors">
                    {authors.map(({ author, count }) => (
                      <li key={author} className="stats-modal__author-row">
                        <span className="stats-modal__author-name">{author}</span>
                        <span className="stats-modal__author-count">
                          {count} read{count !== 1 ? "s" : ""}
                        </span>
                      </li>
                    ))}
                  </ol>
                </section>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
