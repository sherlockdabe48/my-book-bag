import { act, renderHook, waitFor } from "@testing-library/react"
import axios from "axios"
import MockAdapter from "axios-mock-adapter"
import useSearch from "./useSearch"

const mock = new MockAdapter(axios)

const SEARCH_URI = "/.netlify/functions/search"

const fakeVolume = {
  id: "book-1",
  volumeInfo: {
    title: "The Hobbit",
    authors: ["J.R.R. Tolkien"],
    pageCount: 310,
    imageLinks: { thumbnail: "http://example.com/hobbit.jpg" },
    description: "A fantasy novel",
  },
}

afterEach(() => {
  mock.reset()
})

describe("useSearch", () => {
  test("initial state is empty", () => {
    const { result } = renderHook(() => useSearch())

    expect(result.current.searchInputValue).toBe("")
    expect(result.current.searchBooks).toEqual([])
    expect(result.current.totalSearchItems).toBe(0)
    expect(result.current.loading).toBe(false)
    expect(result.current.searchError).toBeNull()
  })

  test("sets searchInputValue and resets startIndex on handleGetSearchInputValue", () => {
    const { result } = renderHook(() => useSearch())

    act(() => {
      result.current.handleNextPageInSearchBook() // advance to page 2
    })
    expect(result.current.startIndex).toBe(20)

    act(() => {
      result.current.handleGetSearchInputValue("hobbit")
    })
    expect(result.current.searchInputValue).toBe("hobbit")
    expect(result.current.startIndex).toBe(0)
  })

  test("clears all state on handleClearSearchInputValue", async () => {
    mock.onGet(SEARCH_URI).reply(200, {
      totalItems: 1,
      items: [fakeVolume],
    })

    const { result } = renderHook(() => useSearch())

    act(() => {
      result.current.handleGetSearchInputValue("hobbit")
    })
    await waitFor(() => expect(result.current.loading).toBe(false))

    act(() => {
      result.current.handleClearSearchInputValue()
    })

    expect(result.current.searchInputValue).toBe("")
    expect(result.current.searchBooks).toEqual([])
    expect(result.current.totalSearchItems).toBe(0)
    expect(result.current.searchError).toBeNull()
  })

  test("fetches books and maps them correctly", async () => {
    mock.onGet(SEARCH_URI).reply(200, {
      totalItems: 42,
      items: [fakeVolume],
    })

    const { result } = renderHook(() => useSearch())

    act(() => {
      result.current.handleGetSearchInputValue("hobbit")
    })

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.searchBooks).toHaveLength(1)
    expect(result.current.searchBooks[0]).toMatchObject({
      id: "book-1",
      title: "The Hobbit",
      author: "J.R.R. Tolkien",
      allPages: 310,
      currentPage: 1,
      imageURL: "http://example.com/hobbit.jpg",
      description: "A fantasy novel",
      status: "onRead",
    })
    expect(result.current.totalSearchItems).toBe(42)
  })

  test("uses fallback values when volumeInfo fields are missing", async () => {
    mock.onGet(SEARCH_URI).reply(200, {
      totalItems: 1,
      items: [{ id: "book-2", volumeInfo: { title: "Unknown" } }],
    })

    const { result } = renderHook(() => useSearch())

    act(() => {
      result.current.handleGetSearchInputValue("unknown")
    })
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.searchBooks[0]).toMatchObject({
      author: "N/A",
      allPages: "N/A",
      description: false,
      imageURL: "../images/mybookbag-image-cover-sample-01.jpg",
    })
  })

  test("sets generic error message on network failure", async () => {
    mock.onGet(SEARCH_URI).networkError()

    const { result } = renderHook(() => useSearch())

    act(() => {
      result.current.handleGetSearchInputValue("hobbit")
    })
    await waitFor(() => {
      expect(result.current.searchError).toBe("Something went wrong. Please try again.")
      expect(result.current.loading).toBe(false)
    })
  })

  test("sets rate-limit error message on 429 response", async () => {
    mock.onGet(SEARCH_URI).reply(429)

    const { result } = renderHook(() => useSearch())

    act(() => {
      result.current.handleGetSearchInputValue("hobbit")
    })
    await waitFor(() => {
      expect(result.current.searchError).toBe(
        "Too many requests — please wait a moment and try again."
      )
    })
  })

  test("advances and decrements startIndex with pagination handlers", () => {
    const { result } = renderHook(() => useSearch())

    act(() => result.current.handleNextPageInSearchBook())
    expect(result.current.startIndex).toBe(20)

    act(() => result.current.handleNextPageInSearchBook())
    expect(result.current.startIndex).toBe(40)

    act(() => result.current.handlePrevPageInSearchBook())
    expect(result.current.startIndex).toBe(20)
  })
})
