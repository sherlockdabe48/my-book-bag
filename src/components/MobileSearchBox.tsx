import React, { useContext, useState } from "react"
import { searchBookContext } from "./App"

interface MobileSearchBoxProps {
  inputRef: React.MutableRefObject<(HTMLInputElement | null)[]>
}

export default function MobileSearchBox({ inputRef }: MobileSearchBoxProps) {
  const { handleGetSearchInputValue } = useContext(searchBookContext)
  const [inputValue, setInputValue] = useState("")

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInputValue(e.target.value)
  }

  function handleSubmit(e: React.FormEvent) {
    handleGetSearchInputValue(inputValue)
    e.preventDefault()
  }

  function focus() {
    inputRef.current[1]?.focus()
  }

  return (
    <div className="mobile__search-box-wrapper">
      <form onSubmit={handleSubmit}>
        <input
          className="mobile__input-search-box"
          type="text"
          placeholder="Find other book..."
          value={inputValue}
          onChange={handleChange}
          onFocus={(e) => e.target.select()}
          ref={(el) => { inputRef.current[1] = el }}
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
