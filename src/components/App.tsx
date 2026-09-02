import React, { useCallback, useMemo, useState } from "react"
import type { Book } from "../types/book"
import { BrowserRouter as Router } from "react-router-dom"
import Header from "./Header"
import SearchPage from "./SearchPage"
import ClassicsPage from "./ClassicsPage"
import StatsPage from "./StatsPage"
import ShelfBagWrapper from "./ShelfBagWrapper"
import WelcomeMessage from "./WelcomeMessage"
import FeatureSettings from "./FeatureSettings"
import UpgradeBagModal from "./UpgradeBagModal"
import "../css/App.css"
import "../css/classics.css"
import useSearch from "../hooks/useSearch"
import useBookBag, { BAG_TIERS } from "../hooks/useBookBag"
import useSearchClassics from "../hooks/useSearchClassics"
import useFeatureFlags, { type FeatureFlags } from "../hooks/useFeatureFlags"
export interface SearchBookContextValue {
  handleGetSearchInputValue: (value: string) => void
  handleClearSearchInputValue: () => void
  handleMoveToShelfFromSearch: (id: string) => void
  handleOpenSearch: () => void
}

export interface BookBagContextValue {
  bagCapacity: number
  bagCount: number
  shelfFull: boolean
  handleAddToBagFromShelf: (id: string) => void
  handleAddToBagWithPages: (id: string, allPages: number) => void
  handleAddBookToShelf: (book: Book) => void
  handleBookDeleteFromShelf: (id: string) => void
  handleMoveToShelfFromBag: (id: string, note?: string) => void
  handleBagBookProgressChange: (id: string, currentPage: number) => void
  handleBookChangeCover: (id: string, imageURL: string) => void
  handleBookChangePages: (id: string, allPages: number) => void
  handleBookChangeTitle: (id: string, title: string) => void
  handleBookChangeAuthor: (id: string, author: string) => void
  handleBookChangeNote: (id: string, note: string) => void
  handleBookChangeRecommendedBy: (id: string, recommendedBy: string) => void
  handleBookChangeTags: (id: string, tags: string[]) => void
  handleIncrementTimesRead: (id: string) => void
  handleLogReadingSession: (id: string) => void
  handleAddManualBook: (book: Book) => void
  handleExportData: () => void
  handleImportData: (raw: string) => boolean
}

export interface ToggleClassContextValue {
  handleActiveShelfHighLight: () => void
  shelfCollapsed: boolean
  setShelfCollapsed: React.Dispatch<React.SetStateAction<boolean>>
  handleOpenShelf: () => void
}

export interface FeatureFlagsContextValue {
  flags: FeatureFlags
  toggleFlag: (key: keyof FeatureFlags) => void
}

export const bookBagContext = React.createContext<BookBagContextValue>({} as BookBagContextValue)
export const toggleClassContext = React.createContext<ToggleClassContextValue>({} as ToggleClassContextValue)
export const searchBookContext = React.createContext<SearchBookContextValue>({} as SearchBookContextValue)
export const featureFlagsContext = React.createContext<FeatureFlagsContextValue>({
  flags: { sortBooks: true, filterBooks: true, addOwnBook: true, bookTags: true, readingProgressBars: true, iReadToday: true, sounds: true },
  toggleFlag: () => {},
})
function App() {
  const [modalOpen, setModalOpen] = useState(false)
  const [classicsOpen, setClassicsOpen] = useState(false)
  const [statsOpen, setStatsOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [upgradeBagOpen, setUpgradeBagOpen] = useState(false)
  const [shelfCollapsed, setShelfCollapsed] = useState(false)

  const { flags, toggleFlag } = useFeatureFlags()

  const {
    searchInputValue,
    searchBooks,
    hasMore,
    loading,
    loadingMore,
    searchError,
    searchErrorType,
    handleGetSearchInputValue,
    handleClearSearchInputValue,
    loadMore,
  } = useSearch()

  const {
    classics,
    hasMore: classicsHasMore,
    loading: classicsLoading,
    loadingMore: classicsLoadingMore,
    error: classicsError,
    loadMore: classicsLoadMore,
  } = useSearchClassics()

  const {
    bagBooks,
    shelfBooks,
    recentlyAddedBagBookId,
    recentlyAddedShelfBookId,
    shelfHighLight,
    bagCapacity,
    bagUpgraded,
    bagTier,
    shelfCapacity,
    shelfTier,
    totalFinished,
    totalWithNote,
    readingStreak,
    handleActiveShelfHighLight,
    handleAddToBagFromShelf,
    handleAddToBagWithPages,
    handleAddBookToShelf,
    handleMoveToShelfFromSearch,
    handleMoveToShelfFromBag,
    handleBagBookProgressChange,
    handleBookDeleteFromShelf,
    handleBookChangeCover,
    handleBookChangePages,
    handleBookChangeTitle,
    handleBookChangeAuthor,
    handleBookChangeNote,
    handleBookChangeRecommendedBy,
    handleBookChangeTags,
    handleIncrementTimesRead,
    handleLogReadingSession,
    handleAddManualBook,
    handleExportData,
    handleImportData,
    handleUpgradeBag,
  } = useBookBag(searchBooks)

  const haveSomeBook = bagBooks.length > 0 || shelfBooks.length > 0

  const handleOpenSearch = useCallback(() => {
    setModalOpen(true)
  }, [])

  const handleCloseModal = useCallback(() => {
    handleClearSearchInputValue()
    setModalOpen(false)
  }, [handleClearSearchInputValue])

  const handleOpenClassics = useCallback(() => {
    setClassicsOpen(true)
  }, [])

  const handleCloseClassics = useCallback(() => {
    setClassicsOpen(false)
  }, [])

  const handleOpenStats = useCallback(() => {
    setStatsOpen(true)
  }, [])

  const handleCloseStats = useCallback(() => {
    setStatsOpen(false)
  }, [])

  const handleOpenSettings = useCallback(() => {
    setSettingsOpen(true)
  }, [])

  const handleCloseSettings = useCallback(() => {
    setSettingsOpen(false)
  }, [])

  const handleOpenUpgradeBag = useCallback(() => {
    setUpgradeBagOpen(true)
  }, [])

  const handleCloseUpgradeBag = useCallback(() => {
    setUpgradeBagOpen(false)
  }, [])

  const searchBookContextValue = useMemo<SearchBookContextValue>(() => ({
    handleGetSearchInputValue,
    handleClearSearchInputValue: handleCloseModal,
    handleMoveToShelfFromSearch,
    handleOpenSearch,
  }), [handleGetSearchInputValue, handleCloseModal, handleMoveToShelfFromSearch, handleOpenSearch])

  const bookBagContextValue = useMemo<BookBagContextValue>(() => ({
    bagCapacity,
    bagCount: bagBooks.length,
    shelfFull: shelfCapacity !== null && shelfBooks.length >= shelfCapacity,
    handleAddToBagFromShelf,
    handleAddToBagWithPages,
    handleAddBookToShelf,
    handleBookDeleteFromShelf,
    handleMoveToShelfFromBag,
    handleBagBookProgressChange,
    handleBookChangeCover,
    handleBookChangePages,
    handleBookChangeTitle,
    handleBookChangeAuthor,
    handleBookChangeNote,
    handleBookChangeRecommendedBy,
    handleBookChangeTags,
    handleIncrementTimesRead,
    handleLogReadingSession,
    handleAddManualBook,
    handleExportData,
    handleImportData,
  }), [
    bagCapacity,
    bagBooks.length,
    shelfCapacity,
    shelfBooks.length,
    handleAddToBagFromShelf,
    handleAddToBagWithPages,
    handleAddBookToShelf,
    handleBookDeleteFromShelf,
    handleMoveToShelfFromBag,
    handleBagBookProgressChange,
    handleBookChangeCover,
    handleBookChangePages,
    handleBookChangeTitle,
    handleBookChangeAuthor,
    handleBookChangeNote,
    handleBookChangeRecommendedBy,
    handleBookChangeTags,
    handleIncrementTimesRead,
    handleLogReadingSession,
    handleAddManualBook,
    handleExportData,
    handleImportData,
  ])

  const handleOpenShelf = useCallback(() => {
    setShelfCollapsed(false)
  }, [])

  const toggleClassContextValue = useMemo<ToggleClassContextValue>(() => ({
    handleActiveShelfHighLight,
    shelfCollapsed,
    setShelfCollapsed,
    handleOpenShelf,
  }), [handleActiveShelfHighLight, shelfCollapsed, handleOpenShelf])

  const featureFlagsContextValue = useMemo<FeatureFlagsContextValue>(() => ({
    flags,
    toggleFlag,
  }), [flags, toggleFlag])

  return (
    <Router>
      <bookBagContext.Provider value={bookBagContextValue}>
        <toggleClassContext.Provider value={toggleClassContextValue}>
          <searchBookContext.Provider value={searchBookContextValue}>
            <featureFlagsContext.Provider value={featureFlagsContextValue}>
            <Header
              onOpenSearch={handleOpenSearch}
              onOpenClassics={handleOpenClassics}
              onOpenStats={handleOpenStats}
              onOpenSettings={handleOpenSettings}
              onOpenUpgradeBag={handleOpenUpgradeBag}
              totalFinished={totalFinished}
            />
            {upgradeBagOpen && (
              <UpgradeBagModal
                bagTier={bagTier}
                tierIndex={BAG_TIERS.indexOf(bagTier)}
                totalFinished={totalFinished}
                onUpgrade={handleUpgradeBag}
                onClose={handleCloseUpgradeBag}
              />
            )}
            {settingsOpen && (
              <FeatureSettings flags={flags} tierIndex={BAG_TIERS.indexOf(bagTier)} onToggle={toggleFlag} onClose={handleCloseSettings} />
            )}
            {statsOpen && (
              <StatsPage
                shelfBooks={shelfBooks}
                bagBooks={bagBooks}
                readingStreak={readingStreak}
                onClose={handleCloseStats}
              />
            )}
            {classicsOpen && (
              <ClassicsPage
                classics={classics}
                loading={classicsLoading}
                loadingMore={classicsLoadingMore}
                hasMore={classicsHasMore}
                error={classicsError}
                shelfBooks={shelfBooks}
                onLoadMore={classicsLoadMore}
                onClose={handleCloseClassics}
              />
            )}
            {modalOpen && (
              <SearchPage
                loading={loading}
                loadingMore={loadingMore}
                hasMore={hasMore}
                searchBooks={searchBooks}
                searchInputValue={searchInputValue}
                shelfBooks={shelfBooks}
                searchError={searchError}
                searchErrorType={searchErrorType}
                onLoadMore={loadMore}
                onOpenClassics={handleOpenClassics}
              />
            )}
            {!haveSomeBook && <WelcomeMessage />}
            {haveSomeBook && (
              <ShelfBagWrapper
                bagBooks={bagBooks}
                shelfBooks={shelfBooks}
                shelfHighLight={shelfHighLight}
                bagCapacity={bagCapacity}
                bagUpgraded={bagUpgraded}
                bagTier={bagTier}
                shelfCapacity={shelfCapacity}
                shelfTier={shelfTier}
                totalFinished={totalFinished}
                totalWithNote={totalWithNote}
                readingStreak={readingStreak}
                shelfCollapsed={shelfCollapsed}
                setShelfCollapsed={setShelfCollapsed}
                recentlyAddedShelfBookId={recentlyAddedShelfBookId}
                recentlyAddedBagBookId={recentlyAddedBagBookId}
              />
            )}
            </featureFlagsContext.Provider>
          </searchBookContext.Provider>
        </toggleClassContext.Provider>
      </bookBagContext.Provider>
      <footer className="app-footer">
        v2.0 · 2026 · Adélier&nbsp;Classics
      </footer>
    </Router>
  )
}

export default App
