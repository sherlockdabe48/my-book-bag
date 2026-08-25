import React, { useContext, useState } from "react"
import { searchBookContext, authContext } from "./App"

interface HeaderProps {
  inputRef: React.MutableRefObject<(HTMLInputElement | null)[]>
}

export default function Header({ inputRef }: HeaderProps) {
  const { handleGetSearchInputValue } = useContext(searchBookContext)
  const { user, signIn, signOut, isAuthReady } = useContext(authContext)
  const [inputValue, setInputValue] = useState("")

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInputValue(e.target.value)
  }

  function handleSubmit(e: React.FormEvent) {
    handleGetSearchInputValue(inputValue)
    e.preventDefault()
  }

  function focus() {
    inputRef.current[0]?.focus()
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
            ref={(el) => { inputRef.current[0] = el }}
            value={inputValue}
            onChange={handleChange}
            onFocus={(e) => e.target.select()}
          />
          <input
            type="submit"
            value="Search"
            className="btn btn--primary header__search-button"
            onClick={focus}
          />
        </form>
      </div>

      {isAuthReady && (
        <div className="header__auth">
          {user ? (
            <div className="header__user">
              <span className="header__user-email">{user.email}</span>
              <button
                className="header__signout-btn"
                onClick={signOut}
                title="Sign out"
              >
                Sign out
              </button>
            </div>
          ) : (
            <button
              className="header__signin-btn"
              onClick={signIn}
              title="Sign in with Google to sync your library"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: 6, verticalAlign: "middle" }}>
                <path d="M21.35 11.1H12v2.8h5.35C16.69 16.13 14.58 17.5 12 17.5c-3.04 0-5.5-2.46-5.5-5.5s2.46-5.5 5.5-5.5c1.39 0 2.65.52 3.61 1.37l2.09-2.09A9.46 9.46 0 0 0 12 3C7.03 3 3 7.03 3 12s4.03 9 9 9c5.24 0 9-3.66 9-8.65 0-.58-.07-1.15-.2-1.7l.55.45z"/>
              </svg>
              Sign in
            </button>
          )}
        </div>
      )}
    </div>
  )
}
