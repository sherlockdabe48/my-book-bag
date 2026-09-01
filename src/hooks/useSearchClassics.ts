import { useCallback, useEffect, useRef, useState } from "react"
import axios from "axios"
import type { Book } from "../types/book"

const SUBJECTS_URI = "https://openlibrary.org/subjects/classics.json"
const FETCH_LIMIT = 50

// Shape returned by /subjects/classics.json works array
interface SubjectWork {
  key: string
  title: string
  authors?: { key: string; name: string }[]
  cover_id?: number
  first_publish_year?: number
  ia?: string | string[]
}

// Book extended with search-only fields not stored on shelf/bag
export interface ClassicsBook extends Book {
  firstPublishYear: number | false
}

function extractIsbn(ia: string | string[] | undefined): string | false {
  const entries = Array.isArray(ia) ? ia : ia ? [ia] : []
  const isbnEntries = entries.filter((s) => s.startsWith("isbn_"))
  const isbn13 = isbnEntries.find((s) => s.length === "isbn_".length + 13)?.slice("isbn_".length)
  const isbn10 = isbnEntries.find((s) => s.length === "isbn_".length + 10)?.slice("isbn_".length)
  return isbn13 ?? isbn10 ?? false
}

function mapWork(work: SubjectWork): ClassicsBook {
  const author = work.authors?.map((a) => a.name).join(", ") ?? "N/A"
  const coverURL = work.cover_id
    ? `https://covers.openlibrary.org/b/id/${work.cover_id}-M.jpg`
    : "../images/mybookbag-image-cover-sample-01.jpg"

  return {
    id:             work.key,
    title:          work.title,
    author,
    publisher:      "",
    allPages:       "N/A",
    currentPage:    1,
    imageURL:       coverURL,
    description:    false,
    isbn:           extractIsbn(work.ia),
    status:         "onRead",
    note:           "",
    recommendedBy:  "",
    lastReadAt:     "",
    timesRead:      0,
    firstPublishYear: work.first_publish_year ?? false,
  }
}

function applyFilters(works: SubjectWork[]): ClassicsBook[] {
  return works
    .map(mapWork)
    .filter(
      (b) =>
        b.author !== "N/A" &&
        !b.imageURL.includes("mybookbag-image-cover-sample-01"),
    )
}

export default function useSearchClassics() {
  const [classics, setClassics]           = useState<ClassicsBook[]>([])
  const [hasMore, setHasMore]             = useState(false)
  const [loading, setLoading]             = useState(false)
  const [loadingMore, setLoadingMore]     = useState(false)
  const [error, setError]                 = useState<string | null>(null)

  // Tracks the next offset for "load more"
  const nextOffsetRef = useRef(0)

  // Initial fetch on mount
  useEffect(() => {
    setLoading(true)
    setError(null)
    nextOffsetRef.current = 0

    const controller = new AbortController()

    axios
      .get(SUBJECTS_URI, {
        params: { limit: FETCH_LIMIT, offset: 0 },
        signal: controller.signal,
      })
      .then((res) => {
        const works: SubjectWork[]  = res.data.works   ?? []
        const workCount: number     = res.data.work_count ?? 0
        nextOffsetRef.current = FETCH_LIMIT
        setClassics(applyFilters(works))
        setHasMore(FETCH_LIMIT < workCount)
        setLoading(false)
      })
      .catch((err: unknown) => {
        if (axios.isCancel(err)) return
        setLoading(false)
        if (!axios.isAxiosError(err)) { setError("Something went wrong. Please try again."); return }
        const status = err.response?.status
        setError(
          status === 429
            ? "Too many requests — please wait a moment and try again."
            : status === 503
            ? "Classics library is temporarily unavailable. Please try again in a few seconds."
            : "Something went wrong. Please try again.",
        )
      })

    return () => controller.abort()
  }, [])

  // Fetch the next batch and append to the existing list
  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return

    setLoadingMore(true)
    const offset = nextOffsetRef.current

    axios
      .get(SUBJECTS_URI, {
        params: { limit: FETCH_LIMIT, offset },
      })
      .then((res) => {
        const works: SubjectWork[]  = res.data.works      ?? []
        const workCount: number     = res.data.work_count ?? 0
        nextOffsetRef.current = offset + FETCH_LIMIT
        setClassics((prev) => [...prev, ...applyFilters(works)])
        setHasMore(offset + FETCH_LIMIT < workCount)
        setLoadingMore(false)
      })
      .catch((err: unknown) => {
        if (axios.isCancel(err)) return
        setLoadingMore(false)
      })
  }, [loadingMore, hasMore])

  return {
    classics,
    hasMore,
    loading,
    loadingMore,
    error,
    loadMore,
  }
}
