import React, { useContext, useState } from "react"
import { searchBookContext } from "./App"

export default function Header({ inputRef }) {
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
    inputRef.current[0].focus()
  }

  return (
    <div className="header-container">
      <h1 className="header__logo">MY BOOK BAG</h1>
      <div className="header__search-box-wrapper">
        <form onSubmit={handleSubmit}>
          <input
            className="header__input-search-box mr-1"
            type="text"
            placeholder="Find other book..."
            ref={(el) => (inputRef.current[0] = el)}
            value={inputValue}
            onChange={handleChange}
          />
          <input
            type="submit"
            value="Search"
            className="btn btn--primary header__search-button"
            onClick={focus}
          />
        </form>
      </div>
    </div>
  )
}
