import React, { useContext, useRef, useState } from "react"
import { bookBagContext } from "./App"
import "../css/export-import.css"

export default function ExportImport() {
  const { handleExportData, handleImportData } = useContext(bookBagContext)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle")

  function showStatus(result: "ok" | "error") {
    setStatus(result)
    setTimeout(() => setStatus("idle"), 2500)
  }

  function handleImportClick() {
    fileInputRef.current?.click()
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

  return (
    <div className="export-import">
      <button
        className="export-import__btn"
        onClick={handleExportData}
        title="Export your shelf & bag as a JSON file"
        type="button"
      >
        <ExportIcon />
        <span className="export-import__label">Export</span>
      </button>

      <button
        className="export-import__btn"
        onClick={handleImportClick}
        title="Import a previously exported JSON file"
        type="button"
      >
        <ImportIcon />
        <span className="export-import__label">Import</span>
      </button>

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
