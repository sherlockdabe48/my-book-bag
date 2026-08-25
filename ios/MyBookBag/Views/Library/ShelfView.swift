import SwiftUI

// MARK: - ShelfView  (2-column grid of book covers)
struct ShelfView: View {
    @EnvironmentObject var store: BookStore

    private let columns = [
        GridItem(.flexible()),
        GridItem(.flexible()),
    ]

    var body: some View {
        ScrollView {
            if store.shelfBooks.isEmpty {
                VStack(spacing: 12) {
                    Image(systemName: "books.vertical")
                        .font(.system(size: 48))
                        .foregroundColor(.secondary)
                    Text("Your shelf is empty")
                        .foregroundColor(.secondary)
                    Text("Search for books to add them here.")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                .padding(.top, 80)
            } else {
                LazyVGrid(columns: columns, spacing: 16) {
                    ForEach(store.shelfBooks) { book in
                        BookInShelfCard(book: book)
                    }
                }
                .padding()
            }
        }
    }
}
