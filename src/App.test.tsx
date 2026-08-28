import { fireEvent, render, screen } from "@testing-library/react"
import BookInBag from "./components/BookInBag"
import BagBookList from "./components/BagBookList"
import SearchBook from "./components/SearchBook"
import { bookBagContext, toggleClassContext, searchBookContext } from "./components/App"

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
        value={{ bagCapacity: 3, bagCount: 1, shelfFull: false, handleMoveToShelfFromBag: jest.fn(), handleBagBookProgressChange, handleAddToBagFromShelf: jest.fn(), handleBookDeleteFromShelf: jest.fn(), handleBookChangeCover: jest.fn(), handleBookChangePages: jest.fn(), handleBookChangeTitle: jest.fn(), handleBookChangeAuthor: jest.fn(), handleBookChangeNote: jest.fn(), handleBookChangeRecommendedBy: jest.fn(), handleIncrementTimesRead: jest.fn(), handleLogReadingSession: jest.fn(), handleAddManualBook: jest.fn(), handleExportData: jest.fn(), handleImportData: jest.fn() }}
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
        value={{ bagCapacity: 3, bagCount: 1, shelfFull: false, handleMoveToShelfFromBag: jest.fn(), handleBagBookProgressChange, handleAddToBagFromShelf: jest.fn(), handleBookDeleteFromShelf: jest.fn(), handleBookChangeCover: jest.fn(), handleBookChangePages: jest.fn(), handleBookChangeTitle: jest.fn(), handleBookChangeAuthor: jest.fn(), handleBookChangeNote: jest.fn(), handleBookChangeRecommendedBy: jest.fn(), handleIncrementTimesRead: jest.fn(), handleLogReadingSession: jest.fn(), handleAddManualBook: jest.fn(), handleExportData: jest.fn(), handleImportData: jest.fn() }}
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

  test("BagBookList 'Pick from shelf' triggers handleOpenShelf and handleActiveShelfHighLight", () => {
    const handleOpenShelf = jest.fn()
    const handleActiveShelfHighLight = jest.fn()

    render(
      <toggleClassContext.Provider
        value={{
          handleActiveShelfHighLight,
          handleOpenShelf,
          shelfCollapsed: true,
          setShelfCollapsed: jest.fn(),
        }}
      >
        <BagBookList bagBooks={[]} bagCapacity={3} totalFinished={0} />
      </toggleClassContext.Provider>
    )

    fireEvent.click(screen.getByRole("button", { name: "Pick from shelf" }))

    expect(handleOpenShelf).toHaveBeenCalledTimes(1)
    expect(handleActiveShelfHighLight).toHaveBeenCalledTimes(1)
  })

  test("SearchBook '✓ In Shelf' triggers handleOpenShelf, handleActiveShelfHighLight, and closes search modal", () => {
    const handleOpenShelf = jest.fn()
    const handleActiveShelfHighLight = jest.fn()
    const handleClearSearchInputValue = jest.fn()

    const shelfBooks = [
      {
        id: "book-1",
        title: "The Hobbit",
        author: "J.R.R. Tolkien",
        publisher: "",
        currentPage: 10,
        allPages: 300,
        imageURL: "cover.jpg",
        status: "reading" as const,
        description: false as const,
        isbn: false as const,
        note: "",
        recommendedBy: "",
        lastReadAt: "",
        timesRead: 0,
      },
    ]

    render(
      <toggleClassContext.Provider
        value={{
          handleActiveShelfHighLight,
          handleOpenShelf,
          shelfCollapsed: true,
          setShelfCollapsed: jest.fn(),
        }}
      >
        <searchBookContext.Provider
          value={{
            handleGetSearchInputValue: jest.fn(),
            handleClearSearchInputValue,
            handleMoveToShelfFromSearch: jest.fn(),
            handleOpenSearch: jest.fn(),
          }}
        >
          <SearchBook
            id="book-1"
            title="The Hobbit"
            subtitle=""
            author="J.R.R. Tolkien"
            publisher=""
            description=""
            allPages={300}
            currentPage={0}
            imageURL="cover.jpg"
            isbn=""
            status="onRead"
            note=""
            recommendedBy=""
            lastReadAt=""
            timesRead={0}
            shelfBooks={shelfBooks}
          />
        </searchBookContext.Provider>
      </toggleClassContext.Provider>
    )

    fireEvent.click(screen.getByRole("button", { name: "✓ In Shelf" }))

    expect(handleOpenShelf).toHaveBeenCalledTimes(1)
    expect(handleActiveShelfHighLight).toHaveBeenCalledTimes(1)
    expect(handleClearSearchInputValue).toHaveBeenCalledTimes(1)
  })
})
