import ExportImport from "./ExportImport"
import "../css/header.css"

interface HeaderProps {
  onOpenSearch: () => void
}

export default function Header({ onOpenSearch }: HeaderProps) {
  return (
    <div className="header-container">
      <h1 className="header__logo">PagesBag</h1>
      <div className="header__right">
        <button
          className="header__search-icon-btn"
          onClick={onOpenSearch}
          aria-label="Open search"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>
        <ExportImport />
      </div>
    </div>
  )
}
