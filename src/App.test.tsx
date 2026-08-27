import { fireEvent, render, screen } from "@testing-library/react"
import Header from "./components/Header"
import BookInBag from "./components/BookInBag"
import { bookBagContext, searchBookContext } from "./components/App"

describe("Header", () => {
  test("submits the typed search value", () => {
    const handleGetSearchInputValue = jest.fn()
    const inputRef = { current: [] as (HTMLInputElement | null)[] }

    render(
      <searchBookContext.Provider value={{ handleGetSearchInputValue, handleClearSearchInputValue: jest.fn(), handleMoveToShelfFromSearch: jest.fn() }}>
        <Header inputRef={inputRef} />
      </searchBookContext.Provider>
    )

    fireEvent.change(screen.getByPlaceholderText("Find other book..."), {
      target: { value: "The Hobbit" },
    })
    fireEvent.submit(screen.getByRole("textbox"))

    expect(handleGetSearchInputValue).toHaveBeenCalledWith("The Hobbit")
  })
})

describe("BookInBag", () => {
  const baseProps = {
    id: "book-1",
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    currentPage: 10,
    allPages: 300,
    imageURL: "cover.jpg",
    note: "",
    recommendedBy: "",
    lastReadAt: "",
    startedAt: "",
    timesRead: 0,
  }

  beforeEach(() => {
    jest.spyOn(window, "alert").mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test("saves edited progress through context", () => {
    const handleBagBookProgressChange = jest.fn()

    render(
      <bookBagContext.Provider
        value={{ bagCapacity: 3, bagCount: 1, handleMoveToShelfFromBag: jest.fn(), handleBagBookProgressChange, handleAddToBagFromShelf: jest.fn(), handleBookSelect: jest.fn(), handleBookDeleteFromShelf: jest.fn(), handleBookChangeCover: jest.fn(), handleBookChangePages: jest.fn(), handleBookChangeTitle: jest.fn(), handleBookChangeAuthor: jest.fn(), handleBookChangeNote: jest.fn(), handleBookChangeRecommendedBy: jest.fn(), handleIncrementTimesRead: jest.fn(), handleLogReadingSession: jest.fn(), handleAddManualBook: jest.fn() }}
      >
        <BookInBag {...baseProps} isActive={false} />
      </bookBagContext.Provider>
    )

    fireEvent.change(screen.getByRole("spinbutton", { name: "Current page" }), {
      target: { value: "25" },
    })
    fireEvent.blur(screen.getByRole("spinbutton", { name: "Current page" }))

    expect(handleBagBookProgressChange).toHaveBeenCalledWith("book-1", 25)
  })

  test("resets progress to page 1 when reading again", () => {
    const handleBagBookProgressChange = jest.fn()

    render(
      <bookBagContext.Provider
        value={{ bagCapacity: 3, bagCount: 1, handleMoveToShelfFromBag: jest.fn(), handleBagBookProgressChange, handleAddToBagFromShelf: jest.fn(), handleBookSelect: jest.fn(), handleBookDeleteFromShelf: jest.fn(), handleBookChangeCover: jest.fn(), handleBookChangePages: jest.fn(), handleBookChangeTitle: jest.fn(), handleBookChangeAuthor: jest.fn(), handleBookChangeNote: jest.fn(), handleBookChangeRecommendedBy: jest.fn(), handleIncrementTimesRead: jest.fn(), handleLogReadingSession: jest.fn(), handleAddManualBook: jest.fn() }}
      >
        <BookInBag {...baseProps} currentPage={300} isActive={true} />
      </bookBagContext.Provider>
    )

    // open the ⋯ menu first, then click "Read Again"
    fireEvent.click(screen.getByRole("button", { name: "Book actions" }))
    fireEvent.click(screen.getByText("Read Again"))
    // confirm prompt appears — click the confirm button
    fireEvent.click(screen.getByText("Yes, reset"))

    expect(handleBagBookProgressChange).toHaveBeenCalledWith("book-1", 1)
    expect(window.alert).not.toHaveBeenCalled()
  })
})
