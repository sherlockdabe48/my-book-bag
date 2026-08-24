import React from "react"
import { render } from "@testing-library/react"
import axios from "axios"
import App from "./App"

jest.mock("axios")

test("does not fetch books when the search input is empty", () => {
  render(<App />)

  expect(axios.get).not.toHaveBeenCalled()
})
