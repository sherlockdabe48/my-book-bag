import React from "react"
import "@testing-library/jest-dom"
import { render, screen } from "@testing-library/react"
import SearchBook from "./SearchBook"
import { searchBookContext } from "./App"

const defaultProps = {
  id: "book-1",
  title: "Test Book",
  author: "Jane Author",
  description: "A useful description",
  allPages: 250,
  imageURL: "https://example.com/book.jpg",
  shelfBooks: [{ id: "book-1", title: "Test Book" }],
}

test("does not show add button when the book is already on the shelf", () => {
  render(
    <searchBookContext.Provider
      value={{
        handleMoveToShelfFromSearch: jest.fn(),
      }}
    >
      <SearchBook {...defaultProps} />
    </searchBookContext.Provider>
  )

  expect(screen.queryByRole("button", { name: /add to shelf/i })).not.toBeInTheDocument()
  expect(screen.getByRole("button", { name: /see in shelf/i })).toBeInTheDocument()
})
