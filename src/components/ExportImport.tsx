import React, { useContext, useEffect, useRef, useState } from "react"
import { bookBagContext } from "./App"
import "../css/export-import.css"

export default function ExportImport() {
  const { handleExportData, handleImportData } = useContext(bookBagContext)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle")
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  function showStatus(result: "ok" | "error") {
    setStatus(result)
    setTimeout(() => setStatus("idle"), 2500)
  }

  function handleImportClick() {
    setOpen(false)
    fileInputRef.current?.click()
  }

  function handleExportClick() {
    setOpen(false)
    handleExportData()
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (ev) => {
      const raw = ev.target?.result
      if (typeof raw !== "string") { showStatus("error"); return }
      const ok = handleImportData(raw)
      showStatus(ok ? "ok" : "error")
    }
    reader.readAsText(file)
    // Reset so the same file can be re-imported if needed
    e.target.value = ""
  }

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
        className="export-import__hamburger"
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
            onClick={handleExportClick}
            type="button"
          >
            <ExportIcon />
            <span>Export</span>
          </button>
          <button
            className="export-import__dropdown-item"
            onClick={handleImportClick}
            type="button"
          >
            <ImportIcon />
            <span>Import</span>
          </button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        className="export-import__file-input"
        onChange={handleFileChange}
      />

      {status !== "idle" && (
        <span className={`export-import__feedback export-import__feedback--${status}`}>
          {status === "ok" ? "✓ Imported" : "✗ Invalid file"}
        </span>
      )}
    </div>
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

function ExportIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  )
}

function ImportIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}
