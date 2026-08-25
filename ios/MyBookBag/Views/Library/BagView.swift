import SwiftUI

// MARK: - BagView  (list of books currently being read)
struct BagView: View {
    @EnvironmentObject var store: BookStore

    var body: some View {
        ScrollView {
            if store.bagBooks.isEmpty {
                VStack(spacing: 12) {
                    Image(systemName: "bag")
                        .font(.system(size: 48))
                        .foregroundColor(.secondary)
                    Text("Your bag is empty")
                        .foregroundColor(.secondary)
                    Text("Add books from your shelf to start reading.")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                .padding(.top, 80)
            } else {
                LazyVStack(spacing: 0) {
                    ForEach(store.bagBooks) { book in
                        BookInBagCard(book: book)
                        Divider()
                    }
                }
            }
        }
    }
}
