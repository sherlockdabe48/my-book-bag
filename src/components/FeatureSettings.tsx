import { useEffect } from "react"
import type { FeatureFlags } from "../hooks/useFeatureFlags"
import "../css/feature-settings.css"

interface FeatureSettingsProps {
  flags: FeatureFlags
  tierIndex: number
  onToggle: (key: keyof FeatureFlags) => void
  onClose: () => void
}

interface FeatureItem {
  key: keyof FeatureFlags
  label: string
  description: string
  /** Minimum bag-tier index required. 0 = always available. */
  minTier: number
  /** Human-readable label of the unlocking tier, shown in the locked hint. */
  unlocksAt?: string
}

// Tier indices mirror BAG_TIERS in useBookBag.ts:
// 0 = Starter Bag, 1 = Reader's Bag, 2 = Bookworm Bag, 3 = Scholar's Bag, 4 = Master's Bag
const TIER_BOOKWORM = 2
const TIER_SCHOLAR  = 3

const FEATURES: FeatureItem[] = [
  {
    key: "filterBooks",
    label: "Filter books in shelf",
    description: "Show status filter chips (Unread, Reading, Finished) above the shelf.",
    minTier: TIER_BOOKWORM,
    unlocksAt: "Bookworm Bag",
  },
  {
    key: "sortBooks",
    label: "Sort books in shelf",
    description: "Show the sort selector (by date, title, author, status) above the shelf.",
    minTier: TIER_SCHOLAR,
    unlocksAt: "Scholar's Bag",
  },
  {
    key: "addOwnBook",
    label: "Add your own book",
    description: 'Show the "Add your own book" button on the shelf.',
    minTier: TIER_BOOKWORM,
    unlocksAt: "Bookworm Bag",
  },
  {
    key: "bookTags",
    label: "Book tags",
    description: "Show tag chips on book covers and allow adding / filtering by tags.",
    minTier: TIER_BOOKWORM,
    unlocksAt: "Bookworm Bag",
  },
  {
    key: "readingProgressBars",
    label: "Reading progress bars",
    description: "Show the progress bar and page counter inside each bag book.",
    minTier: 0,
  },
  {
    key: "iReadToday",
    label: '"I read today" button',
    description: "Show the daily reading-session log button on bag books.",
    minTier: 0,
  },
  {
    key: "sounds",
    label: "App sounds",
    description: "Play sound effects when turning pages, placing books, finishing, etc.",
    minTier: 0,
  },
]

export default function FeatureSettings({ flags, tierIndex, onToggle, onClose }: FeatureSettingsProps) {
  useEffect(() => {
    const prevBody = document.body.style.overflow
    const prevHtml = document.documentElement.style.overflow
    document.body.style.overflow = "hidden"
    document.documentElement.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prevBody
      document.documentElement.style.overflow = prevHtml
    }
  }, [])

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
          {FEATURES.map(({ key, label, description, minTier, unlocksAt }) => {
            const locked = tierIndex < minTier
            return (
              <li key={key} className={`feature-settings__item${locked ? " feature-settings__item--locked" : ""}`}>
                <div className="feature-settings__item-text">
                  <span className="feature-settings__item-label">
                    {locked && <LockIcon />}
                    {label}
                  </span>
                  {locked
                    ? <span className="feature-settings__item-desc feature-settings__item-desc--locked">Unlocks at {unlocksAt}</span>
                    : <span className="feature-settings__item-desc">{description}</span>
                  }
                </div>
                <button
                  role="switch"
                  aria-checked={locked ? false : flags[key]}
                  aria-label={locked ? `${label} — locked` : `${flags[key] ? "Disable" : "Enable"} ${label}`}
                  className={`feature-settings__toggle${!locked && flags[key] ? " feature-settings__toggle--on" : ""}${locked ? " feature-settings__toggle--locked" : ""}`}
                  onClick={() => { if (!locked) onToggle(key) }}
                  type="button"
                  disabled={locked}
                >
                  <span className="feature-settings__toggle-thumb" />
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

function LockIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ marginRight: "5px", verticalAlign: "middle", flexShrink: 0 }}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}
