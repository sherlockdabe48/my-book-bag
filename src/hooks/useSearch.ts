import { useEffect, useState } from "react"
import axios from "axios"
import type { Book } from "../types/book"

const SEARCH_URI = "/.netlify/functions/search"

interface GoogleVolume {
  id: string
  volumeInfo: {
    title: string
    authors?: string[]
    pageCount?: number
    imageLinks?: { thumbnail: string }
    description?: string
  }
}

function mapVolume(volume: GoogleVolume): Book {
  return {
    id: volume.id,
    title: volume.volumeInfo.title,
    author: volume.volumeInfo.authors
      ? volume.volumeInfo.authors.join(", ")
      : "N/A",
    allPages: volume.volumeInfo.pageCount ?? "N/A",
    currentPage: 1,
    imageURL: volume.volumeInfo.imageLinks?.thumbnail
      ?? "../images/mybookbag-image-cover-sample-01.jpg",
    description: volume.volumeInfo.description ?? false,
    status: "onRead",
  }
}

export default function useSearch() {
  const [searchInputValue, setSearchInputValue] = useState("")
  const [startIndex, setStartIndex] = useState(0)
  const [searchBooks, setSearchBooks] = useState<Book[]>([])
  const [totalSearchItems, setTotalSearchItems] = useState(0)
  const [loading, setLoading] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)

  function handleGetSearchInputValue(inputValue: string) {
    setSearchInputValue(inputValue)
    setStartIndex(0)
  }

  function handleClearSearchInputValue() {
    setSearchInputValue("")
  }

  function handleNextPageInSearchBook() {
    setStartIndex((prev) => prev + 20)
  }

  function handlePrevPageInSearchBook() {
    setStartIndex((prev) => prev - 20)
  }

  useEffect(() => {
    if (!searchInputValue.trim()) {
      setLoading(false)
      setSearchBooks([])
      setTotalSearchItems(0)
      setSearchError(null)
      return
    }

    setLoading(true)
    setSearchError(null)
    const controller = new AbortController()
    const params: Record<string, string | number> = {
      q: searchInputValue,
      startIndex,
      maxResults: 20,
    }

    axios
      .get(SEARCH_URI, { params, signal: controller.signal })
      .then((res) => {
        setLoading(false)
        if (!res.data.items) return
        setTotalSearchItems(res.data.totalItems)
        setSearchBooks((res.data.items as GoogleVolume[]).map(mapVolume))
      })
      .catch((err: unknown) => {
        if (axios.isCancel(err)) return
        setLoading(false)
        const status = axios.isAxiosError(err) ? err.response?.status : null
        setSearchError(
          status === 429
            ? "Too many requests — please wait a moment and try again."
            : status === 503
            ? "Search is temporarily unavailable. Please try again in a few seconds."
            : "Something went wrong. Please try again."
        )
      })

    return () => controller.abort()
  }, [searchInputValue, startIndex])

  return {
    searchInputValue,
    startIndex,
    searchBooks,
    totalSearchItems,
    loading,
    searchError,
    handleGetSearchInputValue,
    handleClearSearchInputValue,
    handleNextPageInSearchBook,
    handlePrevPageInSearchBook,
  }
}
