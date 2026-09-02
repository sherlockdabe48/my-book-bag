import { useEffect } from "react"
import { type BAG_TIERS, getNextTier } from "../hooks/useBookBag"
import "../css/upgrade-bag-modal.css"

interface UpgradeBagModalProps {
  bagTier: typeof BAG_TIERS[number]
  tierIndex: number
  totalFinished: number
  onUpgrade: () => void
  onClose: () => void
}

export default function UpgradeBagModal({ bagTier, tierIndex, totalFinished, onUpgrade, onClose }: UpgradeBagModalProps) {
  const nextTier = getNextTier(tierIndex)

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

  const canUpgrade = nextTier !== null && totalFinished >= nextTier.booksFinished
  const booksRemaining = nextTier ? Math.max(0, nextTier.booksFinished - totalFinished) : 0
  const progressPct = nextTier
    ? Math.min(100, Math.round((totalFinished / nextTier.booksFinished) * 100))
    : 100

  return (
    <div className="upgrade-bag-modal__backdrop" onClick={onClose}>
      <div
        className="upgrade-bag-modal__panel"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Upgrade Bag"
      >
        <div className="upgrade-bag-modal__header">
          <h2 className="upgrade-bag-modal__title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 8h16l-1.5 11a2 2 0 0 1-2 1.5H7.5a2 2 0 0 1-2-1.5L4 8z"/>
              <path d="M9 8c0-3 1-5 3-5"/>
              <path d="M15 8c0-3-1-5-3-5"/>
            </svg>
            Upgrade Bag
          </h2>
          <button
            className="upgrade-bag-modal__close-btn"
            onClick={onClose}
            aria-label="Close modal"
            type="button"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="upgrade-bag-modal__body">
          {/* Current vs Next Tier Card */}
          <div className="upgrade-bag-modal__tier-card">
            <div className="upgrade-bag-modal__tier-side">
              <span className="upgrade-bag-modal__tier-label">Current Tier</span>
              <span className="upgrade-bag-modal__tier-name">{bagTier.label}</span>
              <span className="upgrade-bag-modal__tier-cap">{bagTier.capacity} book{bagTier.capacity !== 1 ? "s" : ""}</span>
            </div>

            <div className="upgrade-bag-modal__arrow">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </div>

            <div className="upgrade-bag-modal__tier-side" style={{ textAlign: "right" }}>
              <span className="upgrade-bag-modal__tier-label">Next Tier</span>
              <span className="upgrade-bag-modal__tier-name">{nextTier ? nextTier.label : "Max Tier"}</span>
              <span className="upgrade-bag-modal__tier-cap">{nextTier ? `${nextTier.capacity} books` : "Unlimited mastery"}</span>
            </div>
          </div>

          {nextTier ? (
            <div className="upgrade-bag-modal__req-card">
              <h3 className="upgrade-bag-modal__req-title">Upgrade Requirement</h3>
              <div className="upgrade-bag-modal__req-status">
                <span>Books finished: <strong>{totalFinished} / {nextTier.booksFinished}</strong></span>
                {canUpgrade ? (
                  <span className="upgrade-bag-modal__req-badge upgrade-bag-modal__req-badge--met">✓ Ready</span>
                ) : (
                  <span className="upgrade-bag-modal__req-badge upgrade-bag-modal__req-badge--pending">
                    {booksRemaining} more needed
                  </span>
                )}
              </div>

              <div className="upgrade-bag-modal__progress-bar">
                <div
                  className={`upgrade-bag-modal__progress-fill${canUpgrade ? " upgrade-bag-modal__progress-fill--complete" : ""}`}
                  style={{ width: `${progressPct}%` }}
                />
              </div>

              <p className="upgrade-bag-modal__req-hint">
                {canUpgrade
                  ? `You have met the requirement to unlock ${nextTier.label} (${nextTier.capacity} slots)!`
                  : `Finish ${booksRemaining} more book${booksRemaining !== 1 ? "s" : ""} to unlock ${nextTier.label} and carry up to ${nextTier.capacity} books.`
                }
              </p>
            </div>
          ) : (
            <div className="upgrade-bag-modal__max-notice">
              🏆 You have unlocked the highest bag tier (<strong>{bagTier.label}</strong>)! You can carry up to <strong>{bagTier.capacity} books</strong> at once.
            </div>
          )}
        </div>

        <div className="upgrade-bag-modal__footer">
          <button
            className="upgrade-bag-modal__upgrade-btn"
            disabled={!canUpgrade}
            onClick={() => {
              if (canUpgrade) {
                onUpgrade()
                onClose()
              }
            }}
            type="button"
          >
            {canUpgrade ? `Upgrade to ${nextTier?.label}` : nextTier ? "Upgrade (Requirement Not Met)" : "Max Tier Reached"}
          </button>
        </div>
      </div>
    </div>
  )
}
