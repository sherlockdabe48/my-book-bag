import SwiftUI

// MARK: - BookInShelfCard  (cover image with action sheet on tap)
struct BookInShelfCard: View {
    @EnvironmentObject var store: BookStore
    let book: Book

    @State private var showActions = false

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            // Cover
            AsyncImage(url: URL(string: book.imageURL)) { phase in
                switch phase {
                case .success(let image):
                    image
                        .resizable()
                        .scaledToFill()
                case .empty, .failure:
                    Rectangle()
                        .fill(Color(.systemGray5))
                        .overlay(
                            Image(systemName: "book.closed")
                                .foregroundColor(.secondary)
                                .font(.system(size: 32))
                        )
                @unknown default:
                    EmptyView()
                }
            }
            .frame(maxWidth: .infinity)
            .aspectRatio(2/3, contentMode: .fill)
            .clipped()
            .cornerRadius(8)
            .shadow(color: .black.opacity(0.15), radius: 4, x: 0, y: 2)
            .onTapGesture { showActions = true }

            // Title (2-line clamp)
            Text(book.title)
                .font(.custom("Georgia", size: 13))
                .fontWeight(.semibold)
                .lineLimit(2)
                .foregroundColor(.primary)
        }
        .confirmationDialog(book.title, isPresented: $showActions, titleVisibility: .visible) {
            Button("Add to Bag") {
                store.moveToBag(id: book.id)
            }
            Button("Remove from Shelf", role: .destructive) {
                store.deleteFromShelf(id: book.id)
            }
            Button("Cancel", role: .cancel) {}
        }
    }
}
