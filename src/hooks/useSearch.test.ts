import { act, renderHook, waitFor } from "@testing-library/react"
import axios from "axios"
import MockAdapter from "axios-mock-adapter"
import useSearch, { matchesQuery } from "./useSearch"
import type { SearchBook } from "./useSearch"

const mock = new MockAdapter(axios)

const SEARCH_URI = "https://openlibrary.org/search.json"

const fakeDoc = {
  key: "/works/OL82563W",
  title: "The Hobbit",
  subtitle: "There and Back Again",
  author_name: ["J.R.R. Tolkien"],
  number_of_pages_median: 310,
  cover_i: 8406786,
  first_sentence: "In a hole in the ground there lived a hobbit.",
  ia: ["someotherentry", "isbn_026110296X", "isbn_9780261102361"],
}

afterEach(() => {
  mock.reset()
})

describe("useSearch", () => {
  test("initial state is empty", () => {
    const { result } = renderHook(() => useSearch())

    expect(result.current.searchInputValue).toBe("")
    expect(result.current.searchBooks).toEqual([])
    expect(result.current.loading).toBe(false)
    expect(result.current.searchError).toBeNull()
  })

  test("sets searchInputValue on handleGetSearchInputValue", () => {
    const { result } = renderHook(() => useSearch())

    act(() => { result.current.handleGetSearchInputValue("hobbit") })

    expect(result.current.searchInputValue).toBe("hobbit")
  })

  test("clears all state on handleClearSearchInputValue", async () => {
    mock.onGet(SEARCH_URI).reply(200, { numFound: 1, docs: [fakeDoc] })

    const { result } = renderHook(() => useSearch())

    act(() => { result.current.handleGetSearchInputValue("hobbit") })
    await waitFor(() => expect(result.current.loading).toBe(false))

    act(() => { result.current.handleClearSearchInputValue() })

    expect(result.current.searchInputValue).toBe("")
    expect(result.current.searchBooks).toEqual([])
    expect(result.current.searchError).toBeNull()
  })

  test("fetches books and maps them correctly", async () => {
    mock.onGet(SEARCH_URI).reply(200, { numFound: 1, docs: [fakeDoc] })

    const { result } = renderHook(() => useSearch())

    act(() => { result.current.handleGetSearchInputValue("hobbit") })
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.searchBooks).toHaveLength(1)
    expect(result.current.searchBooks[0]).toMatchObject({
      id:          "/works/OL82563W",
      title:       "The Hobbit",
      subtitle:    "There and Back Again",
      author:      "J.R.R. Tolkien",
      allPages:    310,
      currentPage: 1,
      imageURL:    "https://covers.openlibrary.org/b/id/8406786-M.jpg",
      description: "In a hole in the ground there lived a hobbit.",
      isbn:        "9780261102361",
      status:      "onRead",
    })
  })

  test("prefers ISBN-13 over ISBN-10 from ia array", async () => {
    mock.onGet(SEARCH_URI).reply(200, { numFound: 1, docs: [fakeDoc] })

    const { result } = renderHook(() => useSearch())

    act(() => { result.current.handleGetSearchInputValue("hobbit") })
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.searchBooks[0].isbn).toBe("9780261102361")
  })

  test("books without an ISBN in ia are still shown with isbn: false", async () => {
    mock.onGet(SEARCH_URI).reply(200, {
      numFound: 2,
      docs: [
        fakeDoc,
        { key: "/works/OL999W", title: "Hobbit Studies", author_name: ["A. Scholar"], number_of_pages_median: 120, cover_i: 999 },
      ],
    })

    const { result } = renderHook(() => useSearch())

    act(() => { result.current.handleGetSearchInputValue("hobbit") })
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.searchBooks).toHaveLength(2)
    expect(result.current.searchBooks[1].isbn).toBe(false)
  })

  test("returns all results on a single page (no slicing)", async () => {
    const docs = Array.from({ length: 25 }, (_, i) => ({
      ...fakeDoc,
      key: `/works/OL${i}W`,
      ia: [`isbn_978000000${String(i).padStart(4, "0")}`],
    }))
    mock.onGet(SEARCH_URI).reply(200, { numFound: 25, docs })

    const { result } = renderHook(() => useSearch())

    act(() => { result.current.handleGetSearchInputValue("hobbit") })
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.searchBooks).toHaveLength(25)
  })

  test("filters out books missing author, page count, or cover", async () => {
    const noAuthor = { key: "/works/OL1W", title: "Unknown", number_of_pages_median: 100, cover_i: 111 }
    const noPages  = { key: "/works/OL2W", title: "Unknown", author_name: ["Someone"], cover_i: 222 }
    const noCover  = { key: "/works/OL3W", title: "Unknown", author_name: ["Someone"], number_of_pages_median: 100 }
    const valid    = { key: "/works/OL4W", title: "Unknown", author_name: ["Someone"], number_of_pages_median: 100, cover_i: 333 }
    mock.onGet(SEARCH_URI).reply(200, { numFound: 4, docs: [noAuthor, noPages, noCover, valid] })

    const { result } = renderHook(() => useSearch())

    act(() => { result.current.handleGetSearchInputValue("unknown") })
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.searchBooks).toHaveLength(1)
    expect(result.current.searchBooks[0].id).toBe("/works/OL4W")
  })

  test("sets generic error message on network failure", async () => {
    mock.onGet(SEARCH_URI).networkError()

    const { result } = renderHook(() => useSearch())

    act(() => { result.current.handleGetSearchInputValue("hobbit") })
    await waitFor(() => {
      expect(result.current.searchError).toBe("Something went wrong. Please try again.")
      expect(result.current.loading).toBe(false)
    })
  })

  test("sets rate-limit error message on 429 response", async () => {
    mock.onGet(SEARCH_URI).reply(429)

    const { result } = renderHook(() => useSearch())

    act(() => { result.current.handleGetSearchInputValue("hobbit") })
    await waitFor(() => {
      expect(result.current.searchError).toBe(
        "Too many requests — please wait a moment and try again."
      )
    })
  })

  test("filters out full-text-only matches that don't appear in title/subtitle/author", async () => {
    const betweenFriends = {
      key: "/works/OL_ARENDT",
      title: "Between Friends",
      author_name: ["Hannah Arendt"],
    }
    const theCorrespondent = {
      key: "/works/OL_CORR",
      title: "The Correspondent",
      author_name: ["Someone Else"],
      number_of_pages_median: 200,
      cover_i: 12345,
    }
    mock.onGet(SEARCH_URI).reply(200, { numFound: 2, docs: [betweenFriends, theCorrespondent] })

    const { result } = renderHook(() => useSearch())

    act(() => { result.current.handleGetSearchInputValue("The correspondent") })
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.searchBooks).toHaveLength(1)
    expect(result.current.searchBooks[0].title).toBe("The Correspondent")
  })
})

// ---------------------------------------------------------------------------
// Unit tests for matchesQuery
// ---------------------------------------------------------------------------

function makeBook(overrides: Partial<SearchBook> = {}): SearchBook {
  return {
    id: "/works/OL1W",
    title: "Default Title",
    subtitle: false,
    author: "Default Author",
    allPages: 100,
    currentPage: 1,
    imageURL: "",
    description: false,
    isbn: false,
    status: "onRead",
    note: "",
    recommendedBy: "",
    lastReadAt: "",
    startedAt: "",
    timesRead: 0,
    ...overrides,
  }
}

describe("matchesQuery", () => {
  test("returns true when every meaningful term appears in the title", () => {
    const book = makeBook({ title: "The Art of War" })
    expect(matchesQuery(book, "art war")).toBe(true)
  })

  test("returns true when a term appears in the subtitle (not the title)", () => {
    const book = makeBook({
      title: "Between Friends",
      subtitle: "the correspondence of Hannah Arendt and Mary McCarthy",
    })
    expect(matchesQuery(book, "correspondence")).toBe(true)
  })

  test("returns false when a meaningful term is absent from title, subtitle, and author", () => {
    const book = makeBook({ title: "Between Friends", author: "Hannah Arendt" })
    expect(matchesQuery(book, "The correspondent")).toBe(false)
  })

  test("returns true when query consists only of stop words", () => {
    const book = makeBook({ title: "Some Book" })
    expect(matchesQuery(book, "the and of")).toBe(true)
  })

  test("matching is case-insensitive", () => {
    const book = makeBook({ title: "Dune", author: "Frank Herbert" })
    expect(matchesQuery(book, "DUNE HERBERT")).toBe(true)
  })
})
