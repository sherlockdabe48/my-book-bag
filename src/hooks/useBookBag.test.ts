import { act, renderHook } from "@testing-library/react"
import useBookBag from "./useBookBag"
import type { Book } from "../types/book"

const makeBook = (id: string, overrides: Partial<Book> = {}): Book => ({
  id,
  title: `Book ${id}`,
  author: "Author",
  allPages: 200,
  currentPage: 1,
  imageURL: "cover.jpg",
  description: false,
  status: "onRead",
  ...overrides,
})

beforeEach(() => {
  localStorage.clear()
})

describe("useBookBag", () => {
  test("starts with empty shelf and bag", () => {
    const { result } = renderHook(() => useBookBag([]))
    expect(result.current.shelfBooks).toEqual([])
    expect(result.current.bagBooks).toEqual([])
  })

  test("loads persisted books from localStorage on mount", () => {
    const shelf = [makeBook("s1")]
    const bag = [makeBook("b1")]
    localStorage.setItem("myBookBag.shelfBooks", JSON.stringify(shelf))
    localStorage.setItem("myBookBag.bagBooks", JSON.stringify(bag))

    const { result } = renderHook(() => useBookBag([]))
    expect(result.current.shelfBooks).toEqual(shelf)
    expect(result.current.bagBooks).toEqual(bag)
  })

  test("persists shelf and bag to localStorage when they change", () => {
    const book = makeBook("s1")
    const { result } = renderHook(() => useBookBag([book]))

    act(() => result.current.handleMoveToShelfFromSearch("s1"))

    expect(JSON.parse(localStorage.getItem("myBookBag.shelfBooks")!)).toEqual([book])
  })

  test("handleMoveToShelfFromSearch adds book to shelf", () => {
    const book = makeBook("b1")
    const { result } = renderHook(() => useBookBag([book]))

    act(() => result.current.handleMoveToShelfFromSearch("b1"))

    expect(result.current.shelfBooks).toHaveLength(1)
    expect(result.current.shelfBooks[0].id).toBe("b1")
  })

  test("handleMoveToShelfFromSearch does not add duplicate to shelf", () => {
    const book = makeBook("b1")
    const { result } = renderHook(() => useBookBag([book]))

    act(() => result.current.handleMoveToShelfFromSearch("b1"))
    act(() => result.current.handleMoveToShelfFromSearch("b1"))

    expect(result.current.shelfBooks).toHaveLength(1)
  })

  test("handleAddToBagFromShelf moves book from shelf to bag", () => {
    const book = makeBook("s1")
    const { result } = renderHook(() => useBookBag([book]))

    act(() => result.current.handleMoveToShelfFromSearch("s1"))
    act(() => result.current.handleAddToBagFromShelf("s1"))

    expect(result.current.shelfBooks).toHaveLength(0)
    expect(result.current.bagBooks).toHaveLength(1)
    expect(result.current.bagBooks[0].id).toBe("s1")
  })

  test("handleMoveToShelfFromBag moves book from bag back to shelf", () => {
    const book = makeBook("s1")
    const { result } = renderHook(() => useBookBag([book]))

    act(() => result.current.handleMoveToShelfFromSearch("s1"))
    act(() => result.current.handleAddToBagFromShelf("s1"))
    act(() => result.current.handleMoveToShelfFromBag("s1"))

    expect(result.current.bagBooks).toHaveLength(0)
    expect(result.current.shelfBooks).toHaveLength(1)
  })

  test("handleBagBookProgressChange updates currentPage", () => {
    const book = makeBook("s1")
    const { result } = renderHook(() => useBookBag([book]))

    act(() => result.current.handleMoveToShelfFromSearch("s1"))
    act(() => result.current.handleAddToBagFromShelf("s1"))
    act(() => result.current.handleBagBookProgressChange("s1", 99))

    expect(result.current.bagBooks[0].currentPage).toBe(99)
  })

  test("handleBookDeleteFromShelf removes book from shelf", () => {
    const book = makeBook("s1")
    const { result } = renderHook(() => useBookBag([book]))

    act(() => result.current.handleMoveToShelfFromSearch("s1"))
    act(() => result.current.handleBookDeleteFromShelf("s1"))

    expect(result.current.shelfBooks).toHaveLength(0)
  })

  test("handleActiveShelfHighLight sets shelfHighLight to true then false", async () => {
    jest.useFakeTimers()
    const { result } = renderHook(() => useBookBag([]))

    act(() => result.current.handleActiveShelfHighLight())
    expect(result.current.shelfHighLight).toBe(true)

    act(() => jest.advanceTimersByTime(1500))
    expect(result.current.shelfHighLight).toBe(false)

    jest.useRealTimers()
  })
})
