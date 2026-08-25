import SwiftUI

// MARK: - SearchView  (mirrors SearchPage.tsx + useSearch.ts)
struct SearchView: View {
    @EnvironmentObject var store: BookStore

    @State private var query        = ""
    @State private var results: [Book] = []
    @State private var totalItems   = 0
    @State private var startIndex   = 0
    @State private var isLoading    = false
    @State private var errorMessage: String?

    private let pageSize = 20

    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // Search bar
                HStack {
                    Image(systemName: "magnifyingglass")
                        .foregroundColor(.secondary)
                    TextField("Search books…", text: $query)
                        .autocorrectionDisabled()
                        .onSubmit { Task { await search(reset: true) } }
                    if !query.isEmpty {
                        Button { query = ""; results = []; errorMessage = nil } label: {
                            Image(systemName: "xmark.circle.fill")
                                .foregroundColor(.secondary)
                        }
                    }
                }
                .padding(10)
                .background(Color(.systemGray6))
                .cornerRadius(10)
                .padding()

                // Results
                if isLoading && results.isEmpty {
                    Spacer()
                    ProgressView()
                    Spacer()
                } else if let err = errorMessage {
                    Spacer()
                    Text(err)
                        .foregroundColor(.red)
                        .multilineTextAlignment(.center)
                        .padding()
                    Spacer()
                } else if results.isEmpty && !query.isEmpty {
                    Spacer()
                    Text("No results found.")
                        .foregroundColor(.secondary)
                    Spacer()
                } else {
                    List {
                        ForEach(results) { book in
                            SearchResultRow(book: book)
                                .listRowInsets(EdgeInsets(top: 8, leading: 16, bottom: 8, trailing: 16))
                        }

                        // Pagination
                        if results.count < totalItems {
                            HStack {
                                Spacer()
                                Button("Load more") {
                                    Task { await search(reset: false) }
                                }
                                .buttonStyle(.bordered)
                                .tint(Color("Charcoal"))
                                if isLoading { ProgressView().padding(.leading, 8) }
                                Spacer()
                            }
                            .listRowSeparator(.hidden)
                            .padding(.vertical, 8)
                        }
                    }
                    .listStyle(.plain)
                }
            }
            .navigationTitle("Search")
            .navigationBarTitleDisplayMode(.inline)
            .toolbarBackground(Color("Charcoal"), for: .navigationBar)
            .toolbarBackground(.visible, for: .navigationBar)
            .toolbarColorScheme(.dark, for: .navigationBar)
        }
    }

    @MainActor
    private func search(reset: Bool) async {
        guard !query.trimmingCharacters(in: .whitespaces).isEmpty else { return }
        if reset {
            startIndex = 0
            results = []
        }
        isLoading = true
        errorMessage = nil
        do {
            let (books, total) = try await GoogleBooksService.shared.search(
                query: query,
                startIndex: startIndex,
                maxResults: pageSize
            )
            results.append(contentsOf: books)
            totalItems = total
            startIndex += books.count
        } catch {
            errorMessage = error.localizedDescription
        }
        isLoading = false
    }
}
