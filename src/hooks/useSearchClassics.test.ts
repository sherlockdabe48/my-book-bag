import { act, renderHook, waitFor } from "@testing-library/react"
import axios from "axios"
import MockAdapter from "axios-mock-adapter"
import useSearchClassics from "./useSearchClassics"

const mock = new MockAdapter(axios)

const SUBJECTS_URI = "https://openlibrary.org/subjects/classics.json"

const fakeWork = {
  key: "/works/OL138052W",
  title: "Alice's Adventures in Wonderland",
  authors: [{ key: "/authors/OL22098A", name: "Lewis Carroll" }],
  cover_id: 10527843,
  first_publish_year: 1865,
  ia: ["isbn_9780141439761"],
}

afterEach(() => {
  mock.reset()
})

describe("useSearchClassics", () => {
  test("starts loading immediately on mount", () => {
    mock.onGet(SUBJECTS_URI).reply(() => new Promise(() => {})) // never resolves

    const { result } = renderHook(() => useSearchClassics())

    expect(result.current.loading).toBe(true)
    expect(result.current.classics).toEqual([])
    expect(result.current.error).toBeNull()
  })

  test("fetches classics on mount and maps them correctly", async () => {
    mock.onGet(SUBJECTS_URI).reply(200, { work_count: 1, works: [fakeWork] })

    const { result } = renderHook(() => useSearchClassics())

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.classics).toHaveLength(1)
    expect(result.current.classics[0]).toMatchObject({
      id:               "/works/OL138052W",
      title:            "Alice's Adventures in Wonderland",
      author:           "Lewis Carroll",
      imageURL:         "https://covers.openlibrary.org/b/id/10527843-M.jpg",
      isbn:             "9780141439761",
      firstPublishYear: 1865,
      status:           "onRead",
      currentPage:      1,
    })
  })

  test("filters out works with no author", async () => {
    const noAuthor = { key: "/works/OL999W", title: "Unknown", cover_id: 111 }
    mock.onGet(SUBJECTS_URI).reply(200, { work_count: 1, works: [noAuthor] })

    const { result } = renderHook(() => useSearchClassics())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.classics).toHaveLength(0)
  })

  test("filters out works with no cover", async () => {
    const noCover = { key: "/works/OL888W", title: "No Cover", authors: [{ key: "/authors/OL1A", name: "Someone" }] }
    mock.onGet(SUBJECTS_URI).reply(200, { work_count: 1, works: [noCover] })

    const { result } = renderHook(() => useSearchClassics())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.classics).toHaveLength(0)
  })

  test("sets hasMore when work_count exceeds one page", async () => {
    mock.onGet(SUBJECTS_URI).reply(200, { work_count: 200, works: [fakeWork] })

    const { result } = renderHook(() => useSearchClassics())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.hasMore).toBe(true)
  })

  test("sets hasMore to false when all results fit in one page", async () => {
    mock.onGet(SUBJECTS_URI).reply(200, { work_count: 1, works: [fakeWork] })

    const { result } = renderHook(() => useSearchClassics())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.hasMore).toBe(false)
  })

  test("loadMore appends next batch to the list", async () => {
    const secondWork = { ...fakeWork, key: "/works/OL222W", title: "Moby Dick", authors: [{ key: "/authors/OL2A", name: "Herman Melville" }], cover_id: 99999 }

    mock
      .onGet(SUBJECTS_URI, { params: { limit: 50, offset: 0 } })
      .reply(200, { work_count: 100, works: [fakeWork] })
    mock
      .onGet(SUBJECTS_URI, { params: { limit: 50, offset: 50 } })
      .reply(200, { work_count: 100, works: [secondWork] })

    const { result } = renderHook(() => useSearchClassics())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.classics).toHaveLength(1)

    act(() => { result.current.loadMore() })

    await waitFor(() => expect(result.current.loadingMore).toBe(false))
    expect(result.current.classics).toHaveLength(2)
    expect(result.current.classics[1].title).toBe("Moby Dick")
  })

  test("sets generic error on network failure", async () => {
    mock.onGet(SUBJECTS_URI).networkError()

    const { result } = renderHook(() => useSearchClassics())

    await waitFor(() => expect(result.current.error).toBe("Something went wrong. Please try again."))
    expect(result.current.loading).toBe(false)
  })

  test("sets rate-limit error on 429 response", async () => {
    mock.onGet(SUBJECTS_URI).reply(429)

    const { result } = renderHook(() => useSearchClassics())

    await waitFor(() => {
      expect(result.current.error).toBe("Too many requests — please wait a moment and try again.")
    })
  })

  test("sets unavailable error on 503 response", async () => {
    mock.onGet(SUBJECTS_URI).reply(503)

    const { result } = renderHook(() => useSearchClassics())

    await waitFor(() => {
      expect(result.current.error).toBe(
        "Classics library is temporarily unavailable. Please try again in a few seconds.",
      )
    })
  })

  test("multiple authors are joined with comma", async () => {
    const multiAuthor = {
      ...fakeWork,
      authors: [
        { key: "/authors/OL1A", name: "Author One" },
        { key: "/authors/OL2A", name: "Author Two" },
      ],
    }
    mock.onGet(SUBJECTS_URI).reply(200, { work_count: 1, works: [multiAuthor] })

    const { result } = renderHook(() => useSearchClassics())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.classics[0].author).toBe("Author One, Author Two")
  })

  test("isbn is false when no ia field present", async () => {
    const noIsbn = { ...fakeWork, ia: undefined }
    mock.onGet(SUBJECTS_URI).reply(200, { work_count: 1, works: [noIsbn] })

    const { result } = renderHook(() => useSearchClassics())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.classics[0].isbn).toBe(false)
  })

  test("firstPublishYear is false when missing from response", async () => {
    const noYear = { ...fakeWork, first_publish_year: undefined }
    mock.onGet(SUBJECTS_URI).reply(200, { work_count: 1, works: [noYear] })

    const { result } = renderHook(() => useSearchClassics())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.classics[0].firstPublishYear).toBe(false)
  })
})
