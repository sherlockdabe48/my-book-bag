# My Book Bag — iOS (SwiftUI)

Native iOS companion to the [My Book Bag](https://mybookbag.netlify.app/) web app.

## Structure

```
ios/MyBookBag/
├── MyBookBagApp.swift          — @main entry point
├── Models/
│   └── Book.swift              — Book struct, API shapes, progress helpers
├── Services/
│   └── GoogleBooksService.swift — URLSession + async/await API calls
├── Stores/
│   └── BookStore.swift         — ObservableObject, shelf/bag state, UserDefaults
├── Views/
│   ├── ContentView.swift       — TabView root (Library + Search)
│   ├── WelcomeView.swift       — Empty state screen
│   ├── Library/
│   │   ├── LibraryView.swift       — Segmented Shelf / Bag tabs
│   │   ├── ShelfView.swift         — LazyVGrid of book covers
│   │   ├── BookInShelfCard.swift   — Cover card with action sheet
│   │   ├── BagView.swift           — Reading list
│   │   └── BookInBagCard.swift     — Progress bar + inline page edit
│   └── Search/
│       ├── SearchView.swift        — Search bar + paginated results
│       └── SearchResultRow.swift   — Single result row
└── Assets.xcassets/
    ├── Charcoal.colorset       — #2f2f2f nav/accent colour
    └── Cream.colorset          — #f5f0e8 primary button colour
```

## Setup in Xcode

1. Open Xcode → **File → New → Project** → iOS App
2. Set **Product Name**: `MyBookBag`, **Interface**: SwiftUI, **Language**: Swift
3. Delete the generated `ContentView.swift` and `Assets.xcassets`
4. Drag all files from this `ios/MyBookBag/` folder into the Xcode project
5. Make sure all `.swift` files are added to the **MyBookBag** target

## Google Books API Key (optional)

Without a key the app works but is subject to unauthenticated rate limits.

1. Get a key at [console.developers.google.com](https://console.developers.google.com/)
2. In Xcode: select the **MyBookBag** scheme → **Edit Scheme → Run → Arguments → Environment Variables**
3. Add `GOOGLE_BOOKS_API_KEY` = your key

Or add it to `Info.plist`:
```xml
<key>GOOGLE_BOOKS_API_KEY</key>
<string>your_key_here</string>
```

## Features

- Search any book via Google Books API
- Add to Shelf, move to Bag when you start reading
- Track reading progress with inline page number editing
- Progress bar per book
- Finish / Read Again toggle
- Persists across app launches via UserDefaults

## Design

Matches the web app palette:
- Navigation bar: Charcoal `#2f2f2f`
- Primary buttons: Cream `#f5f0e8`
- Book titles: Georgia serif (system serif fallback for Lora)
