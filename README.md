# AdélierBag

A feature-rich, personal book management and progress tracking web app built with React, TypeScript, and Vite. AdélierBag leverages the free Open Library API to let you search, organize, and monitor your reading progress. It features gamified progression, custom feature toggling, full offline capability (PWA), native mobile builds (Capacitor), and tactile sound design—all without requiring any account, server login, or API keys.

🌐 **Live demo:** https://adelierbag.netlify.app/

![AdélierBag Overall](./public/images/my-book-bag-overall.jpg)

---

## Features

### 🔍 Search & Discover
- **Open Library API Integration:** Discover and fetch millions of books—completely free and open.
- **Browse Classics:** A curated section utilizing Open Library’s Subject API to browse timeless public domain works. Features server-side searching as well as local sorting by publication year.
- **Smart Filtering:** Client-side filters ensure results strictly match title, subtitle, or author queries (filtering out full-text-only noise).
- **Auto-Cleanup:** Automatically filters out search results that lack cover art, author details, or page counts, maintaining a clean library.
- **Infinite Loading:** Features a robust "Load More" pagination setup and a sleek "Back to Top" scrolling shortcut.

### 📚 Manual Creation
- **Custom Additions:** Add books not found in Open Library. Specify custom titles, authors, publishers, page counts, and cover images (either URL or image uploads).
- **Dynamic Cover Generator:** If no cover image is provided, the app dynamically constructs and colors a beautiful, theme-matching SVG cover embedded as a Data URI. It features the AdélierBag icon, book title, and author.

### 🗂️ Shelf Management
- **Milestone Upgrades:** Start with a 5-book limit (`Small Shelf`) and expand it up to unlimited capacity (`Master's Shelf`) by finishing books and adding personal reading notes!
- **Action Overlay:** Hover (or tap) shelf covers to reveal action shortcuts:
  - **Move to Bag:** Bring a book into your active reading tray.
  - **Edit Metadata:** In-cover modal to adjust title, author, total page counts, or swap cover images (via URL or local uploads).
  - **Delete:** Safer removal with overlay confirmations. Tick *"Don't ask me again"* to skip future warnings (saved securely in `localStorage`).
- **Interactive Tags:** Toggle tag management inline. Add custom keywords/tags to organize your library and filter your shelf dynamically by tags.
- **Status Chips:** Filter shelf items by status (Unread, Reading, Finished) and sort by title, author, date added, or status.

### 👜 Active Bag Tracker
- **Tote Bag Capacities:** Your active reading queue is constrained by bag capacity tiers. Upgrade from `Starter Bag` (1 book) up to `Master's Bag` (7 books) by completing more reads!
- **Visual Progress:** Dynamic visual progress bars depicting percentage completion.
- **Inline Editing:** Click or tap any page number to edit your current page inline.
- **Session Logging:** Hit the **"I read today"** button to log daily sessions, automatically updating timestamps and feeding your continuous daily reading streak.
- **Progress Control:** Reset progress instantly with **Read Again** or return a book to the shelf using **Back to Shelf**.

### 📊 Statistics & Day Streaks
- **Streak Calculation:** Calculates your continuous daily reading streak (consecutive calendar days read, ending today or yesterday) based on your log history.
- **Monthly Active Days:** Displays a beautiful, lightweight, pure SVG bar chart visualizing the number of active reading days per month across the last 12 months.
- **Top Authors:** Lists your most-read authors with total reads completed.
- **Summary Metrics:** Live metrics tracking total books finished, books in active bag, books on shelf, total pages logged, and active streaks.

### ⚙️ Feature Flags & Settings
- **Customizable Dashboard:** Enable or disable specific features (sounds, progress bars, tags, manual adding, sorting, filtering) via a dedicated hamburger utility panel.
- **Gamified Unlocks:** Higher capacity tiers unlock advanced shelf utilities—like status filtering, book tags, shelf sorting, and custom manual adding. Unlocked capabilities dynamically activate in your settings as you read!

---

## 🔊 Rich Sound Design (Web Audio API)

AdélierBag features a rich, responsive Web Audio setup that introduces tactile physical dimensions to book-organizing interactions:

- **Synthesized Wood Thump (`playShelfPlaceSound`):** Real-time synthesizer sweep and biquad-bandpass friction noise simulating a heavy hardcover book settling onto a wooden shelf.
- **Synthesized Canvas Slide (`playBagPlaceSound`):** Gentle, lowpass-filtered noise and soft sub-envelope representing a book slipping into a fabric tote bag.
- **Tactile Page Turn (`playPageTurnSound`):** High-fidelity audio sample player for a realistic paper page turn.
- **Hardcover Close (`playBookCloseSound`):** Authentic, high-quality audio sample playing on book-closing events with custom pre-roll silence trimming.
- **Reading Session Combo (`playReadTodaySound`):** Plays a motivational vocal segment combined with a precisely scheduled hardcover close sweep.
- **Wings Flapping (`playBirdFlapSound`):** Tactile bird wings flap sound playing when deleting books or tossing books off your shelf.

*All assets are cached in memory on first fetch to prevent redundant server roundtrips. Audio effects can be toggled on/off in the Settings menu.*

---

## 🛠️ Tech Stack & Architecture

AdélierBag is designed to operate completely serverless and client-contained:

| Domain | Technology | Description |
|---|---|---|
| **Framework** | [React 18](https://react.dev/) + [TypeScript 5](https://www.typescriptlang.org/) | Type-safe declarative UI rendering |
| **Routing** | [React Router v6](https://reactrouter.com/) | Client routing handles primary pages & deep links |
| **Build & Tooling** | [Vite 4](https://vitejs.dev/) | Lightning-fast ESM builds and dev servers |
| **Data Fetching** | [Axios 1.x](https://axios-http.com/) | Structured HTTP client integration with Open Library |
| **Data Source** | [Open Library API](https://openlibrary.org/developers/api) | Public-domain metadata and subject indices |
| **PWA Capability** | [Vite PWA Plugin](https://vite-pwa-org.netlify.app/) | Service worker caching, offline shells, and manifest |
| **Mobile Sync** | [Capacitor 8](https://capacitorjs.com/) | Cross-platform runtime exporting to native iOS |
| **Testing** | [Jest 29](https://jestjs.io/) + [React Testing Library](https://testing-library.com/) | Comprehensive unit, hook, and integration suites |
| **Sound Synthesis** | [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) | Low-level synthesizer & sample engine |
| **Storage** | `localStorage` | Self-contained, zero-login, persistent user data |

---

## ⚡ Offline-First PWA

AdélierBag functions completely offline. Powered by a service worker with custom Workbox caching rules configured in `vite.config.js`:
1. **App Shell Pre-caching:** Pre-caches all HTML, JS, CSS, system fonts, and static SVGs for near-instant offline boots.
2. **Open Library Queries (Stale-While-revalidate):** Book searches and subjects are cached for up to 7 days, enabling you to browse and view books even with weak or missing connections.
3. **Cover Images (Cache-First):** Fetched book covers from the Open Library CDN are stored locally on the device for up to 30 days.

---

## 📱 Mobile Native Integration (Capacitor)

AdélierBag is equipped with **Capacitor**, letting you compile the web shell into native mobile clients (fully configured for iOS):
- **Backup & Restore:** Data is portable! Export all your shelf, bag, and reading logs into a JSON package. On iOS, Capacitor hooks into `@capacitor/filesystem` and `@capacitor/share` to write back-up files into the native `Documents` folder and open the native iOS Share Sheet automatically. On Web, it defaults to a standard browser download.
- **Safe Layouts:** Adaptive styling automatically adjusts margins, spacing, and hamburger overlays to account for native safe-area insets on mobile notches and home indicators.

---

## 📈 Capacity Tiers & Progression

As you complete books, you earn upgrades to carry and store more.

### Active Bag Tiers
| Tier | Finished Books Required | Bag Capacity | Label |
|---|---|---|---|
| **Tier 0** | 0 | 1 Book | Starter Bag |
| **Tier 1** | 1 | 2 Books | Reader's Bag |
| **Tier 2** | 2 | 3 Books | Bookworm Bag |
| **Tier 3** | 5 | 5 Books | Scholar's Bag |
| **Tier 4** | 12 | 7 Books | Master's Bag |

### Shelf Capacity Tiers
*Unlocks require a combination of books finished AND shelf books with personalized reading notes.*
| Tier | Books Finished | Shelf Notes Logged | Shelf Capacity | Label |
|---|---|---|---|---|
| **Tier 0** | 0 | 0 | 5 Books | Small Shelf |
| **Tier 1** | 3 | 1 | 10 Books | Reader's Shelf |
| **Tier 2** | 5 | 3 | 20 Books | Bookworm Shelf |
| **Tier 3** | 12 | 6 | 40 Books | Scholar's Shelf |
| **Tier 4** | 25 | 12 | Unlimited | Master's Shelf |

---

## 📁 Project Structure

```
src/
├── components/
│   ├── App.tsx                 # Root coordinator, context, and modal routes
│   ├── Header.tsx              # Top navigational brand & desktop search
│   ├── MobileSearchBox.tsx     # Compact overlay-aligned search bar
│   ├── SearchPage.tsx          # Main Search modal wrapping results
│   ├── SearchBookList.tsx      # Open Library query container
│   ├── SearchBook.tsx          # Individual Open Library search cards
│   ├── ShelfBagWrapper.tsx     # Responsive layouts for Shelf & Bag
│   ├── Shelf.tsx               # Shelf tray, status filtering, and sorting selectors
│   ├── ShelfBookList.tsx       # Shelf books container
│   ├── BookInShelf.tsx         # Shelf card featuring action overlays, inline notes, and tags
│   ├── AddManualBookForm.tsx   # Custom manual book form with dynamic SVG cover generator
│   ├── ClassicsPage.tsx        # Classics subject browser & search modal
│   ├── ClassicsBookList.tsx    # Classics catalog layout
│   ├── ClassicsBook.tsx        # Card display for ClassicsSubject works
│   ├── Bag.tsx                 # Bag tray with capacity status & progress updates
│   ├── BagBookList.tsx         # Bag books layout
│   ├── BookInBag.tsx           # Bag card with live progress bar and "I read today" loggers
│   ├── ExportImport.tsx        # Hamburger dropdown for system configurations, imports, exports
│   ├── FeatureSettings.tsx     # Settings modal showcasing toggles and gamified lock details
│   ├── StatsPage.tsx           # Reading stats modal with active reading monthly SVG charts
│   ├── BottomNav.tsx           # Responsive bottom navigation bar with notification badges
│   └── WelcomeMessage.tsx      # Interactive empty state for newly created profiles
├── hooks/
│   ├── useBookBag.ts           # Storage, state, streak logging, and import/export triggers
│   ├── useFeatureFlags.ts      # Custom capability settings state manager
│   ├── useSearch.ts            # Client-side filtered Open Library API query fetcher
│   ├── useSearchClassics.ts    # Open Library Subject Classics fetcher & paginator
│   └── useSearchClassicsQuery.ts # Open Library Classics server-side search query fetcher
├── utils/
│   └── sound.ts                # Real-time Web Audio API synthesizer and audio sample player cache
├── types/
│   └── book.ts                 # Shared Book, ClassicsBook, and ExportPayload declarations
├── css/                        # Modular CSS stylesheets
├── setupTests.js               # Jest testing environment mocks & setups
└── index.tsx                   # Render entrypoint with Vite PWA registrations
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js:** 16+
- **npm:** 8+

### Install & Run
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the local Vite development server:
   ```bash
   npm start
   ```
3. Open [http://localhost:5173](http://localhost:5173) in your browser.

*No external API keys are needed! Open Library is free, public, and open.*

### iOS Native Build (Capacitor)
To compile and open the iOS project in Xcode:
```bash
# Fast build and synchronize assets to Xcode iOS platform
npm run cap:sync

# Compile and open the iOS workspace in Xcode
npm run cap:open

# Run directly on your connected iOS simulator or device
npm run cap:run
```

---

## 🧪 Running Tests

AdélierBag uses **Jest** and **React Testing Library** for rigorous coverage of hooks, context triggers, and core layout components.

To execute the test suite:
```bash
npm test
```

Currently, **43 tests** pass successfully across **4 main test suites**:
1. `useBookBag.test.ts` (Core logic, localized operations, streak calculations, JSON exports)
2. `useSearch.test.ts` (Smart filtering, Open Library mapping, error handling)
3. `useSearchClassics.test.ts` (Classics retrieval, ISBN parsing, state transitions)
4. `App.test.tsx` (Integration tests, component routing, modal states)
