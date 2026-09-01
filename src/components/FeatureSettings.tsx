import type { FeatureFlags } from "../hooks/useFeatureFlags"
import "../css/feature-settings.css"

interface FeatureSettingsProps {
  flags: FeatureFlags
  onToggle: (key: keyof FeatureFlags) => void
  onClose: () => void
}

interface FeatureItem {
  key: keyof FeatureFlags
  label: string
  description: string
}

const FEATURES: FeatureItem[] = [
  {
    key: "filterBooks",
    label: "Filter books in shelf",
    description: "Show status filter chips (Unread, Reading, Finished) above the shelf.",
  },
  {
    key: "sortBooks",
    label: "Sort books in shelf",
    description: "Show the sort selector (by date, title, author, status) above the shelf.",
  },
  {
    key: "addOwnBook",
    label: "Add your own book",
    description: 'Show the "Add your own book" button on the shelf.',
  },
  {
    key: "bookTags",
    label: "Book tags",
    description: "Show tag chips on book covers and allow adding / filtering by tags.",
  },
  {
    key: "readingProgressBars",
    label: "Reading progress bars",
    description: "Show the progress bar and page counter inside each bag book.",
  },
  {
    key: "iReadToday",
    label: '"I read today" button',
    description: "Show the daily reading-session log button on bag books.",
  },
  {
    key: "sounds",
    label: "App sounds",
    description: "Play sound effects when turning pages, placing books, finishing, etc.",
  },
]

export default function FeatureSettings({ flags, onToggle, onClose }: FeatureSettingsProps) {
  return (
    <div className="feature-settings__backdrop" onClick={onClose}>
      <div
        className="feature-settings__panel"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Feature settings"
      >
        <div className="feature-settings__header">
          <h2 className="feature-settings__title">Features</h2>
          <button
            className="feature-settings__close-btn"
            onClick={onClose}
            aria-label="Close settings"
            type="button"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <p className="feature-settings__subtitle">Toggle features on or off. Changes are saved automatically.</p>
        <ul className="feature-settings__list">
          {FEATURES.map(({ key, label, description }) => (
            <li key={key} className="feature-settings__item">
              <div className="feature-settings__item-text">
                <span className="feature-settings__item-label">{label}</span>
                <span className="feature-settings__item-desc">{description}</span>
              </div>
              <button
                role="switch"
                aria-checked={flags[key]}
                aria-label={`${flags[key] ? "Disable" : "Enable"} ${label}`}
                className={`feature-settings__toggle${flags[key] ? " feature-settings__toggle--on" : ""}`}
                onClick={() => onToggle(key)}
                type="button"
              >
                <span className="feature-settings__toggle-thumb" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
