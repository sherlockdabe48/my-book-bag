import { useEffect, useRef, useState } from "react"
import axios from "axios"
import type { ClassicsBook } from "./useSearchClassics"

const SEARCH_URI = "https://openlibrary.org/search.json"
const DEBOUNCE_MS = 400

interface SearchDoc {
  key: string
  title: string
  author_name?: string[]
  cover_i?: number
  first_publish_year?: number
  isbn?: string[]
}

function mapDoc(doc: SearchDoc): ClassicsBook {
  const author = doc.author_name?.join(", ") ?? "N/A"
  const coverURL = doc.cover_i
    ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
    : ""

  // Pick the first ISBN-13 if available, else ISBN-10
  const isbn13 = doc.isbn?.find((s) => s.length === 13)
  const isbn10 = doc.isbn?.find((s) => s.length === 10)
  const isbn = isbn13 ?? isbn10 ?? false

  return {
    id:               doc.key,
    title:            doc.title,
    author,
    publisher:        "",
    allPages:         "N/A",
    currentPage:      1,
    imageURL:         coverURL,
    description:      false,
    isbn,
    status:           "onRead",
    note:             "",
    recommendedBy:    "",
    lastReadAt:       "",
    timesRead:        0,
    firstPublishYear: doc.first_publish_year ?? false,
  }
}

export default function useSearchClassicsQuery(query: string) {
  const [results, setResults]   = useState<ClassicsBook[]>([])
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)

  // Keep a ref to the latest abort controller so we can cancel on new query
  const controllerRef = useRef<AbortController | null>(null)
  const timerRef      = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const q = query.trim()

    if (!q) {
      setResults([])
      setLoading(false)
      setError(null)
      return
    }

    // Debounce
    if (timerRef.current) clearTimeout(timerRef.current)

    timerRef.current = setTimeout(() => {
      // Cancel any in-flight request
      controllerRef.current?.abort()
      const controller = new AbortController()
      controllerRef.current = controller

      setLoading(true)
      setError(null)

      axios
        .get(SEARCH_URI, {
          params: {
            subject: "classics",
            q,
            limit: 20,
            fields: "key,title,author_name,cover_i,first_publish_year,isbn",
          },
          signal: controller.signal,
        })
        .then((res) => {
          const docs: SearchDoc[] = res.data.docs ?? []
          setResults(
            docs
              .map(mapDoc)
              .filter((b) => b.author !== "N/A" && b.imageURL !== ""),
          )
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
              : "Something went wrong. Please try again.",
          )
        })
    }, DEBOUNCE_MS)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [query])

  return { results, loading, error }
}
