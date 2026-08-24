import React from "react"
import { fireEvent, render, screen } from "@testing-library/react"
import Header from "./components/Header"
import BookInBag from "./components/BookInBag"
import { bookBagContext, searchBookContext } from "./components/App"

describe("Header", () => {
  test("submits the typed search value", () => {
    const handleGetSearchInputValue = jest.fn()
    const inputRef = { current: [] }

    render(
      <searchBookContext.Provider value={{ handleGetSearchInputValue }}>
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
  }

  beforeEach(() => {
    jest.spyOn(window, "alert").mockImplementation(() => {})
  })

  afterEach(() => {
    window.alert.mockRestore()
  })

  test("saves edited progress through context", () => {
    const handleBagBookProgressChange = jest.fn()

    render(
      <bookBagContext.Provider
        value={{ handleMoveToShelfFromBag: jest.fn(), handleBagBookProgressChange }}
      >
        <BookInBag {...baseProps} />
      </bookBagContext.Provider>
    )

    fireEvent.click(screen.getByText("EDIT"))
    fireEvent.change(screen.getByDisplayValue("10"), {
      target: { value: "25", max: "300" },
    })
    fireEvent.click(screen.getByText("SAVE"))

    expect(handleBagBookProgressChange).toHaveBeenCalledWith("book-1", 25)
  })

  test("resets progress to page 1 when reading again", () => {
    const handleBagBookProgressChange = jest.fn()

    render(
      <bookBagContext.Provider
        value={{ handleMoveToShelfFromBag: jest.fn(), handleBagBookProgressChange }}
      >
        <BookInBag {...baseProps} currentPage={300} />
      </bookBagContext.Provider>
    )

    fireEvent.click(screen.getByText("Read Again"))

    expect(handleBagBookProgressChange).toHaveBeenCalledWith("book-1", 1)
    expect(window.alert).not.toHaveBeenCalled()
  })
})