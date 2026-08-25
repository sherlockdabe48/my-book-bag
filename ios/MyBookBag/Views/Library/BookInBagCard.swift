import SwiftUI

// MARK: - BookInBagCard  (mirrors BookInBag.tsx)
struct BookInBagCard: View {
    @EnvironmentObject var store: BookStore
    let book: Book

    @State private var isEditingProgress = false
    @State private var draftPage = ""

    var body: some View {
        HStack(alignment: .top, spacing: 16) {
            // Cover
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
            .frame(width: 80, height: 120)
            .clipped()
            .cornerRadius(6)
            .shadow(color: .black.opacity(0.12), radius: 4, x: 0, y: 2)

            // Details
            VStack(alignment: .leading, spacing: 6) {
                // Title
                Text(book.title)
                    .font(.custom("Georgia", size: 16))
                    .fontWeight(.semibold)
                    .lineLimit(2)

                // Author
                Text(book.author)
                    .font(.caption)
                    .foregroundColor(.secondary)

                // Progress row
                HStack(spacing: 4) {
                    Text("Progress:")
                        .font(.caption2)
                        .fontWeight(.semibold)
                        .textCase(.uppercase)
                        .foregroundColor(.secondary)
                        .tracking(0.5)

                    if isEditingProgress {
                        TextField("", text: $draftPage)
                            .keyboardType(.numberPad)
                            .frame(width: 48)
                            .textFieldStyle(.roundedBorder)
                            .font(.caption)
                            .onSubmit { commitEdit() }
                    } else {
                        Button {
                            draftPage = "\(book.currentPage)"
                            isEditingProgress = true
                        } label: {
                            Text("\(book.currentPage)")
                                .font(.caption)
                                .fontWeight(.bold)
                                .foregroundColor(.primary)
                                .underline(true, color: .secondary)
                        }
                        .buttonStyle(.plain)
                    }

                    Text("/ \(book.allPagesDisplay) pages")
                        .font(.caption)
                        .foregroundColor(.secondary)

                    if isEditingProgress {
                        Button("Done") { commitEdit() }
                            .font(.caption)
                            .buttonStyle(.borderedProminent)
                            .tint(Color("Charcoal"))
                            .controlSize(.mini)
                    }
                }

                // Progress bar
                GeometryReader { geo in
                    ZStack(alignment: .leading) {
                        RoundedRectangle(cornerRadius: 3)
                            .fill(Color(.systemGray5))
                            .frame(height: 5)
                        RoundedRectangle(cornerRadius: 3)
                            .fill(Color("Charcoal"))
                            .frame(width: geo.size.width * book.progressFraction, height: 5)
                    }
                }
                .frame(height: 5)
                .padding(.vertical, 2)

                // Action buttons
                HStack(spacing: 8) {
                    Button(book.isFinished ? "Read Again" : "Finish") {
                        if book.isFinished {
                            store.updateProgress(id: book.id, currentPage: 1)
                        } else if let total = book.allPages {
                            store.updateProgress(id: book.id, currentPage: total)
                        }
                    }
                    .font(.caption)
                    .fontWeight(.semibold)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 6)
                    .background(Color("Cream"))
                    .foregroundColor(Color("Charcoal"))
                    .cornerRadius(6)

                    Button("Remove") {
                        store.moveToShelf(id: book.id)
                    }
                    .font(.caption)
                    .fontWeight(.semibold)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 6)
                    .background(Color(red: 0.61, green: 0.13, blue: 0.15))
                    .foregroundColor(.white)
                    .cornerRadius(6)
                }
            }
        }
        .padding()
    }

    private func commitEdit() {
        let max = book.allPages ?? Int.max
        let val = max(0, min(max, Int(draftPage) ?? book.currentPage))
        store.updateProgress(id: book.id, currentPage: val)
        isEditingProgress = false
    }
}
