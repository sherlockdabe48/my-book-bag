import { useContext, useEffect, useRef, useState } from "react"
import BookInBag from "./BookInBag"
import { toggleClassContext } from "./App"
import type { Book } from "../types/book"

interface BagBookListProps {
  bagBooks: Book[]
  bagCapacity: number
  recentlyAddedBagBookId?: string | null
}

export default function BagBookList({ bagBooks, bagCapacity, recentlyAddedBagBookId }: BagBookListProps) {
  const { handleActiveShelfHighLight, handleOpenShelf } = useContext(toggleClassContext)
  const isFull = bagBooks.length >= bagCapacity

  const listRef = useRef<HTMLDivElement>(null)
  const slideRefs = useRef<(HTMLDivElement | null)[]>([])
  // Ref to the active slide's cover image — used to measure actual rendered position
  const coverImgRef = useRef<HTMLImageElement>(null)
  // Peek top offset measured from the cover's real position
  const [peekTop, setPeekTop] = useState<number | null>(null)

  // activeIndex updates live during scroll (drives dots)
  const [activeIndex, setActiveIndex] = useState(0)
  // settledIndex updates only after scroll fully stops (drives peek images)
  const [settledIndex, setSettledIndex] = useState(0)
  // peekVisible controls the crossfade: false = fading out, true = fading in
  const [peekVisible, setPeekVisible] = useState(true)
  const settleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Track scroll: update activeIndex live, settle peek after scroll stops ──
  const touchActiveRef = useRef(false)

  useEffect(() => {
    const track = listRef.current
    if (!track) return

    // Capture in a stable const so TypeScript doesn't narrow to never
    const t = track

    function getIdx() {
      return Math.max(0, Math.min(
        Math.round(t.scrollLeft / t.clientWidth),
        bagBooks.length - 1
      ))
    }

    function settle() {
      setSettledIndex(getIdx())
      setPeekVisible(true)
      if (settleTimerRef.current) clearTimeout(settleTimerRef.current)
    }

    function onScroll() {
      const idx = getIdx()
      setActiveIndex(idx)
      setPeekVisible(false)
      if (settleTimerRef.current) clearTimeout(settleTimerRef.current)
      // Only start the debounce timer if the finger is already up
      if (!touchActiveRef.current) {
        settleTimerRef.current = setTimeout(settle, 150)
      }
    }

    function onTouchStart() { touchActiveRef.current = true }
    function onTouchEnd()   {
      touchActiveRef.current = false
      // Finger lifted — now safe to settle (slight delay for snap animation)
      if (settleTimerRef.current) clearTimeout(settleTimerRef.current)
      settleTimerRef.current = setTimeout(settle, 150)
    }

    function onScrollEnd() { settle() }

    t.addEventListener("scroll",     onScroll,     { passive: true })
    t.addEventListener("touchstart", onTouchStart, { passive: true })
    t.addEventListener("touchend",   onTouchEnd,   { passive: true })
    t.addEventListener("touchcancel",onTouchEnd,   { passive: true })
    if ("onscrollend" in t) t.addEventListener("scrollend", onScrollEnd)

    return () => {
      t.removeEventListener("scroll",      onScroll)
      t.removeEventListener("touchstart",  onTouchStart)
      t.removeEventListener("touchend",    onTouchEnd)
      t.removeEventListener("touchcancel", onTouchEnd)
      if ("onscrollend" in t) t.removeEventListener("scrollend", onScrollEnd)
      if (settleTimerRef.current) clearTimeout(settleTimerRef.current)
    }
  }, [bagBooks.length])

  // ── Smooth-scroll to first slide when first book changes ───────────────────
  const firstBookIdRef = useRef<string | undefined>(undefined)
  const firstBookId = bagBooks[0]?.id
  useEffect(() => {
    if (firstBookIdRef.current !== undefined && firstBookIdRef.current !== firstBookId) {
      slideRefs.current[0]?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" })
      setActiveIndex(0)
      setSettledIndex(0)
    }
    firstBookIdRef.current = firstBookId
  }, [firstBookId])

  // ── Scroll newly-added book into view ─────────────────────────────────────
  // The bag tab panel may be hidden (display:none) when the book is added, so
  // clientWidth is 0 and a plain scrollTo lands on slide 0. We watch the track
  // with a ResizeObserver and perform the scroll as soon as it has a real width.
  useEffect(() => {
    if (!recentlyAddedBagBookId) return
    const idx = bagBooks.findIndex((b) => b.id === recentlyAddedBagBookId)
    if (idx === -1) return

    const track = listRef.current
    if (!track) return

    function doScroll() {
      if (!track || track.clientWidth === 0) return
      track.scrollTo({ left: idx * track.clientWidth, behavior: "instant" })
      setActiveIndex(idx)
      setSettledIndex(idx)
    }

    // Try immediately (works if the panel is already visible)
    doScroll()

    // Also watch for when the panel becomes visible (clientWidth goes from 0 → real)
    const ro = new ResizeObserver(() => {
      if (track.clientWidth > 0) {
        doScroll()
        ro.disconnect()
      }
    })
    ro.observe(track)
    return () => ro.disconnect()
  }, [recentlyAddedBagBookId, bagBooks])

  // ── Measure cover position for peek alignment ─────────────────────────────
  useEffect(() => {
    const img = coverImgRef.current
    if (!img) return
    function measure() {
      if (!img || !listRef.current) return
      const wrapperRect = listRef.current.parentElement!.getBoundingClientRect()
      const imgRect = img.getBoundingClientRect()
      // top of peek = centre of cover, relative to carousel wrapper
      setPeekTop(imgRect.top - wrapperRect.top + imgRect.height / 2)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(img)
    return () => ro.disconnect()
  }, [activeIndex, bagBooks.length])

  function goToShelf() {
    handleOpenShelf?.()
    handleActiveShelfHighLight()
    document.getElementById("in-my-shelf")?.scrollIntoView({ behavior: "smooth" })
  }

  function scrollToSlide(idx: number) {
    const track = listRef.current
    if (!track) return
    track.scrollTo({ left: idx * track.clientWidth, behavior: "smooth" })
    setActiveIndex(idx)
  }

  if (bagBooks.length === 0) {
    return (
      <div className="bag-book-list">
        <div className="bag-book-list__empty">
          <svg className="bag-book-list__empty-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 8h16l-1.5 11a2 2 0 0 1-2 1.5H7.5a2 2 0 0 1-2-1.5L4 8z"/>
            <path d="M9 8c0-3 1-5 3-5"/>
            <path d="M15 8c0-3-1-5-3-5"/>
          </svg>
          <p className="bag-book-list__empty-heading">Your bag is empty</p>
          <p className="bag-book-list__empty-sub">Pick a book from your shelf and start reading.</p>
          <button className="btn btn--primary btn--see-more" onClick={goToShelf}>
            Pick from shelf
          </button>
        </div>
      </div>
    )
  }

  // Peek images use settledIndex so they only update after scroll finishes
  const prevBook = settledIndex > 0 ? bagBooks[settledIndex - 1] : null
  const nextBook = settledIndex < bagBooks.length - 1 ? bagBooks[settledIndex + 1] : null

  return (
    <>
      {/* Carousel wrapper — positions the peek overlays relative to the track */}
      <div className="bag-carousel-wrapper">
        {/* Scroll track — each slide is exactly 100% wide */}
        <div className="bag-book-list" ref={listRef}>
          {bagBooks.map((bagBook, index) => (
            <div
              key={bagBook.id}
              data-book-id={bagBook.id}
              ref={(el) => { slideRefs.current[index] = el }}
            >
              <BookInBag
                {...bagBook}
                isActive={index === activeIndex}
                isLanding={bagBook.id === recentlyAddedBagBookId}
                coverImgRef={index === activeIndex ? coverImgRef : undefined}
              />
            </div>
          ))}
        </div>

  
          {/* Peek overlays — crossfade on settle */}
          {prevBook && (
          <button
            className={`bag-peek bag-peek--left${peekVisible ? " bag-peek--visible" : ""}`}
            style={peekTop !== null ? { top: peekTop } : undefined}
            onClick={() => scrollToSlide(activeIndex - 1)}
            aria-label={`Go to previous book: ${prevBook.title}`}
          >
            <img src={prevBook.imageURL} alt={prevBook.title} />
          </button>
        )}
        {nextBook && (
          <button
            className={`bag-peek bag-peek--right${peekVisible ? " bag-peek--visible" : ""}`}
            style={peekTop !== null ? { top: peekTop } : undefined}
            onClick={() => scrollToSlide(activeIndex + 1)}
            aria-label={`Go to next book: ${nextBook.title}`}
          >
            <img src={nextBook.imageURL} alt={nextBook.title} />
          </button>
        )}
      </div>
    </>
  )
}
