import { useCallback, useEffect, useRef, useState } from "react"
import axios from "axios"
import type { Book } from "../types/book"

const OPEN_LIBRARY_SEARCH_URI = "https://openlibrary.org/search.json"
const FETCH_LIMIT = 100

// Common words that carry no meaningful signal for title/author matching
const STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "of", "in", "on", "at", "to", "for",
  "by", "with", "from", "is", "it", "as", "be", "this", "that", "his",
  "her", "their", "our", "my", "its", "was", "are", "were", "has", "have",
])

/**
 * Returns true if every meaningful term in `query` appears in the book's
 * title, subtitle, or author (case-insensitive).  Prevents Open Library
 * full-text-only matches (e.g. a query word found only in the book's body)
 * from polluting results.
 */
export function matchesQuery(book: SearchBook, query: string): boolean {
  const terms = query
    .toLowerCase()
    .split(/\W+/)
    .filter((t) => t.length > 0 && !STOP_WORDS.has(t))

  if (terms.length === 0) return true

  const haystack = [
    book.title,
    typeof book.subtitle === "string" ? book.subtitle : "",
    book.author,
  ]
    .join(" ")
    .toLowerCase()

  return terms.every((term) => haystack.includes(term))
}

interface OpenLibraryDoc {
  key: string
  title: string
  subtitle?: string
  author_name?: string[]
  number_of_pages_median?: number
  cover_i?: number
  first_sentence?: string | { value: string }
  ia?: string[]
}

// Book extended with search-only fields not stored on shelf/bag
export interface SearchBook extends Book {
  subtitle: string | false
}

function extractIsbn(doc: OpenLibraryDoc): string | false {
  const isbnEntries = (doc.ia ?? []).filter((s) => s.startsWith("isbn_"))
  const isbn13 = isbnEntries.find((s) => s.length === "isbn_".length + 13)?.slice("isbn_".length)
  const isbn10 = isbnEntries.find((s) => s.length === "isbn_".length + 10)?.slice("isbn_".length)
  return isbn13 ?? isbn10 ?? false
}

function mapDoc(doc: OpenLibraryDoc): SearchBook {
  const rawDescription = doc.first_sentence
  const description =
    typeof rawDescription === "string"
      ? rawDescription
      : typeof rawDescription === "object" && rawDescription !== null
      ? (rawDescription as { value: string }).value
      : false

  return {
    id:          doc.key,
    title:       doc.title,
    subtitle:    doc.subtitle ?? false,
    author:      doc.author_name ? doc.author_name.join(", ") : "N/A",
    publisher:   "",
    allPages:    doc.number_of_pages_median ?? "N/A",
    currentPage: 1,
    imageURL:    doc.cover_i
                   ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
                   : "../images/mybookbag-image-cover-sample-01.jpg",
    description,
    isbn:        extractIsbn(doc),
    status:      "onRead",
    note:        "",
    recommendedBy: "",
    lastReadAt:  "",
    timesRead:   0,
  }
}

function applyFilters(docs: OpenLibraryDoc[], query: string): SearchBook[] {
  return docs
    .map(mapDoc)
    .filter((b) =>
      matchesQuery(b, query) &&
      b.author !== "N/A" &&
      b.allPages !== "N/A" &&
      !b.imageURL.includes("mybookbag-image-cover-sample-01")
    )
}

export default function useSearch() {
  const [searchInputValue, setSearchInputValue] = useState("")
  const [searchBooks, setSearchBooks]           = useState<SearchBook[]>([])
  const [hasMore, setHasMore]                   = useState(false)
  const [loading, setLoading]                   = useState(false)
  const [loadingMore, setLoadingMore]           = useState(false)
  const [searchError, setSearchError]           = useState<string | null>(null)
  const [searchErrorType, setSearchErrorType]   = useState<"warning" | "error">("error")

  // Tracks the next offset to use for "load more" — stored as a ref so
  // updating it never causes re-renders or effect cleanup side-effects
  const nextOffsetRef = useRef(0)
  const queryRef      = useRef(searchInputValue)
  queryRef.current    = searchInputValue

  const handleGetSearchInputValue = useCallback((inputValue: string) => {
    setSearchInputValue(inputValue)
  }, [])

  const handleClearSearchInputValue = useCallback(() => {
    setSearchInputValue("")
  }, [])

  // Initial fetch — fires when the query changes
  useEffect(() => {
    if (!searchInputValue.trim()) {
      setSearchBooks([])
      setHasMore(false)
      setSearchError(null)
      nextOffsetRef.current = 0
      return
    }

    setLoading(true)
    setSearchError(null)
    nextOffsetRef.current = 0
    const controller = new AbortController()

    axios
      .get(OPEN_LIBRARY_SEARCH_URI, {
        params: {
          q: searchInputValue,
          limit: FETCH_LIMIT,
          offset: 0,
          fields: "key,title,subtitle,author_name,number_of_pages_median,cover_i,first_sentence,ia",
        },
        signal: controller.signal,
      })
      .then((res) => {
        const docs: OpenLibraryDoc[] = res.data.docs ?? []
        const numFound: number       = res.data.numFound ?? 0
        nextOffsetRef.current = FETCH_LIMIT
        setSearchBooks(applyFilters(docs, searchInputValue))
        setHasMore(FETCH_LIMIT < numFound)
        setLoading(false)
      })
      .catch((err: unknown) => {
        if (axios.isCancel(err)) return
        setLoading(false)
        if (!axios.isAxiosError(err)) { setSearchError("Something went wrong. Please try again."); return }
        const status = err.response?.status
        if (status === 422) {
          setSearchErrorType("warning")
          setSearchError("That's a bit too short — try typing at least 3 characters.")
        } else {
          setSearchErrorType("error")
          setSearchError(
            status === 429
              ? "Too many requests — please wait a moment and try again."
              : status === 503
              ? "Search is temporarily unavailable. Please try again in a few seconds."
              : "Something went wrong. Please try again."
          )
        }
      })

    return () => controller.abort()
  }, [searchInputValue])

  // Fetch the next batch and append to the existing list
  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return

    setLoadingMore(true)
    const offset = nextOffsetRef.current
    const query  = queryRef.current

    axios
      .get(OPEN_LIBRARY_SEARCH_URI, {
        params: {
          q: query,
          limit: FETCH_LIMIT,
          offset,
          fields: "key,title,subtitle,author_name,number_of_pages_median,cover_i,first_sentence,ia",
        },
      })
      .then((res) => {
        const docs: OpenLibraryDoc[] = res.data.docs ?? []
        const numFound: number       = res.data.numFound ?? 0
        nextOffsetRef.current = offset + FETCH_LIMIT
        setSearchBooks((prev) => [...prev, ...applyFilters(docs, query)])
        setHasMore(offset + FETCH_LIMIT < numFound)
        setLoadingMore(false)
      })
      .catch((err: unknown) => {
        if (axios.isCancel(err)) return
        setLoadingMore(false)
      })
  }, [loadingMore, hasMore])

  return {
    searchInputValue,
    searchBooks,
    hasMore,
    loading,
    loadingMore,
    searchError,
    searchErrorType,
    handleGetSearchInputValue,
    handleClearSearchInputValue,
    loadMore,
  }
}
