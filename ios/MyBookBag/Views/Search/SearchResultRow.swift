import SwiftUI

// MARK: - SearchResultRow  (mirrors SearchBook.tsx)
struct SearchResultRow: View {
    @EnvironmentObject var store: BookStore
    let book: Book

    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            // Thumbnail
            AsyncImage(url: URL(string: book.imageURL)) { phase in
                switch phase {
                case .success(let image):
                    image.resizable().scaledToFill()
                case .empty, .failure:
                    Rectangle()
                        .fill(Color(.systemGray5))
                        .overlay(Image(systemName: "book.closed").foregroundColor(.secondary))
                @unknown default: EmptyView()
                }
            }
            .frame(width: 60, height: 90)
            .clipped()
            .cornerRadius(4)

            // Details
            VStack(alignment: .leading, spacing: 4) {
                Text(book.title)
                    .font(.custom("Georgia", size: 15))
                    .fontWeight(.semibold)
                    .lineLimit(2)

                Text(book.author)
                    .font(.caption)
                    .foregroundColor(.secondary)

                if let desc = book.description {
                    Text(desc)
                        .font(.caption)
                        .foregroundColor(.secondary)
                        .lineLimit(3)
                        .padding(.top, 2)
                }

                Spacer(minLength: 6)

                HStack {
                    if let pages = book.allPages {
                        Text("\(pages) pages")
                            .font(.caption2)
                            .foregroundColor(.secondary)
                    }
                    Spacer()
                    if store.isInLibrary(id: book.id) {
                        Label("In Library", systemImage: "checkmark")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    } else {
                        Button("+ Add to Shelf") {
                            store.addToShelf(book)
                        }
                        .font(.caption)
                        .fontWeight(.semibold)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 6)
                        .background(Color("Cream"))
                        .foregroundColor(Color("Charcoal"))
                        .cornerRadius(6)
                    }
                }
            }
        }
    }
}
