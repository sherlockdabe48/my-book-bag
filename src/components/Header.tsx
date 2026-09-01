import { Capacitor } from "@capacitor/core"
import ExportImport from "./ExportImport"
import "../css/header.css"

interface HeaderProps {
  onOpenSearch: () => void
  onOpenClassics: () => void
}

const isIOS = Capacitor.getPlatform() === "ios"

export default function Header({ onOpenSearch, onOpenClassics }: HeaderProps) {
  return (
    <div className={`header-container${isIOS ? " header-container--ios" : ""}`}>
      {!isIOS && <h1 className="header__logo">PagesBag</h1>}
      <div className="header__right">
        <button
          className={`header__search-icon-btn${isIOS ? " header__search-icon-btn--ios" : ""}`}
          onClick={onOpenClassics}
          aria-label="Browse classics"
          title="Browse Classics"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </button>
        <button
          className={`header__search-icon-btn${isIOS ? " header__search-icon-btn--ios" : ""}`}
          onClick={onOpenSearch}
          aria-label="Open search"
          title="Search books"
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
