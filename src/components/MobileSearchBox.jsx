import React, { useContext, useState } from "react"
import { searchBookContext } from "./App"

export default function MobileSearchBox({ inputRef }) {
  const { handleGetSearchInputValue } = useContext(searchBookContext)
  const [inputValue, setInputValue] = useState("")
  function handleChange(e) {
    setInputValue(e.target.value)
  }

  function handleSubmit(e) {
    handleGetSearchInputValue(inputValue)
    e.preventDefault()
  }

  function focus() {
    inputRef.current[1].focus()
  }

  return (
    <div className="mobile__search-box-wrapper">
      <form onSubmit={handleSubmit}>
        <input
          className="mobile__input-search-box mr-1"
          type="text"
          placeholder="Find other book..."
          value={inputValue}
          onChange={handleChange}
          ref={(el) => (inputRef.current[1] = el)}
        />
        <input
          type="submit"
          value="Search"
          className="btn btn--primary mobile__search-button"
          onClick={focus}
        />
      </form>
    </div>
  )
}
