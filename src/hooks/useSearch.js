import { useEffect, useState } from "react"
import axios from "axios"

const SEARCH_URI = "https://www.googleapis.com/books/v1/volumes"
const GOOGLE_BOOKS_API_KEY = import.meta.env.REACT_APP_GOOGLE_BOOKS_API_KEY

function mapVolume(volume) {
  return {
    id: volume.id,
    title: volume.volumeInfo.title,
    author: volume.volumeInfo.authors
      ? volume.volumeInfo.authors.join(", ")
      : "N/A",
    allPages: volume.volumeInfo.pageCount ? volume.volumeInfo.pageCount : "N/A",
    currentPage: 1,
    imageURL: volume.volumeInfo.imageLinks
      ? volume.volumeInfo.imageLinks.thumbnail
      : "../images/mybookbag-image-cover-sample-01.jpg",
    description: volume.volumeInfo.description
      ? volume.volumeInfo.description
      : false,
    status: "onRead",
  }
}

export default function useSearch() {
  const [searchInputValue, setSearchInputValue] = useState("")
  const [startIndex, setStartIndex] = useState(0)
  const [searchBooks, setSearchBooks] = useState([])
  const [totalSearchItems, setTotalSearchItems] = useState(0)
  const [loading, setLoading] = useState(false)
  const [searchError, setSearchError] = useState(null)

  function handleGetSearchInputValue(inputValue) {
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
    const params = {
      q: searchInputValue,
      printType: "books",
      startIndex,
      maxResults: 20,
    }

    if (GOOGLE_BOOKS_API_KEY) {
      params.key = GOOGLE_BOOKS_API_KEY
    }

    axios
      .get(SEARCH_URI, { params, signal: controller.signal })
      .then((res) => {
        setLoading(false)
        if (!res.data.items) return
        setTotalSearchItems(res.data.totalItems)
        setSearchBooks(res.data.items.map(mapVolume))
      })
      .catch((err) => {
        if (axios.isCancel(err)) return
        setLoading(false)
        setSearchError(
          err.response?.status === 429
            ? "Too many requests — please add a Google Books API key or wait a moment."
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
