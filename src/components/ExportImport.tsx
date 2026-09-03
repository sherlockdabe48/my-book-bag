import { useEffect, useRef, useState } from "react"
import "../css/export-import.css"
import { Capacitor } from "@capacitor/core"

interface ExportImportProps {
  onOpenClassics: () => void
  onOpenStats: () => void
  onOpenSettings: () => void
  onOpenUpgradeBag: () => void
  statsUnlocked: boolean
}

export default function ExportImport({ onOpenClassics, onOpenStats, onOpenSettings, onOpenUpgradeBag, statsUnlocked }: ExportImportProps) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const isIOS = Capacitor.getPlatform() === "ios"

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener("mousedown", handleOutsideClick)
    return () => document.removeEventListener("mousedown", handleOutsideClick)
  }, [open])

  return (
    <div className="export-import" ref={menuRef}>
      <button
        className={`export-import__hamburger${isIOS ? " export-import__hamburger--ios" : ""}`}
        onClick={() => setOpen((prev) => !prev)}
        title="Menu"
        type="button"
        aria-label="Open menu"
        aria-expanded={open}
      >
        <HamburgerIcon />
      </button>

      {open && (
        <div className="export-import__dropdown">
          <button
            className="export-import__dropdown-item"
            onClick={() => { setOpen(false); onOpenClassics() }}
            type="button"
          >
            <ClassicsIcon />
            <span>Browse Classics</span>
          </button>
          {statsUnlocked && (
            <button
              className="export-import__dropdown-item"
              onClick={() => { setOpen(false); onOpenStats() }}
              type="button"
            >
              <StatsIcon />
              <span>Reading Stats</span>
            </button>
          )}
          <button
            className="export-import__dropdown-item"
            onClick={() => { setOpen(false); onOpenUpgradeBag() }}
            type="button"
          >
            <UpgradeBagIcon />
            <span>Upgrade Bag</span>
          </button>
          <div className="export-import__divider" />
          <button
            className="export-import__dropdown-item"
            onClick={() => { setOpen(false); onOpenSettings() }}
            type="button"
          >
            <SettingsIcon />
            <span>Settings</span>
          </button>
        </div>
      )}

    </div>
  )
}

function ClassicsIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

function StatsIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4"  />
      <line x1="6"  y1="20" x2="6"  y2="14" />
    </svg>
  )
}

function HamburgerIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  )
}

function UpgradeBagIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 8h16l-1.5 11a2 2 0 0 1-2 1.5H7.5a2 2 0 0 1-2-1.5L4 8z"/>
      <path d="M9 8c0-3 1-5 3-5"/>
      <path d="M15 8c0-3-1-5-3-5"/>
      <line x1="12" y1="11" x2="12" y2="17" />
      <polyline points="9 14 12 11 15 14" />
    </svg>
  )
}

function SettingsIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}
