import Foundation
import Combine

// MARK: - BookStore  (mirrors useBookBag.ts)
final class BookStore: ObservableObject {

    @Published private(set) var shelfBooks: [Book] = []
    @Published private(set) var bagBooks: [Book] = []

    private let shelfKey = "shelfBooks"
    private let bagKey   = "bagBooks"

    init() {
        load()
    }

    // MARK: - Computed
    var hasAnyBook: Bool { !shelfBooks.isEmpty || !bagBooks.isEmpty }

    // MARK: - Search → Shelf
    func addToShelf(_ book: Book) {
        guard !shelfBooks.contains(where: { $0.id == book.id }),
              !bagBooks.contains(where:   { $0.id == book.id }) else { return }
        var b = book
        b.status = .onRead
        shelfBooks.append(b)
        save()
    }

    // MARK: - Shelf → Bag
    func moveToBag(id: String) {
        guard let idx = shelfBooks.firstIndex(where: { $0.id == id }) else { return }
        var b = shelfBooks.remove(at: idx)
        b.status = .reading
        bagBooks.append(b)
        save()
    }

    // MARK: - Bag → Shelf
    func moveToShelf(id: String) {
        guard let idx = bagBooks.firstIndex(where: { $0.id == id }) else { return }
        var b = bagBooks.remove(at: idx)
        b.status = .onRead
        shelfBooks.append(b)
        save()
    }

    // MARK: - Delete from Shelf
    func deleteFromShelf(id: String) {
        shelfBooks.removeAll { $0.id == id }
        save()
    }

    // MARK: - Update reading progress
    func updateProgress(id: String, currentPage: Int) {
        guard let idx = bagBooks.firstIndex(where: { $0.id == id }) else { return }
        bagBooks[idx].currentPage = currentPage
        save()
    }

    // MARK: - Already in library?
    func isInLibrary(id: String) -> Bool {
        shelfBooks.contains(where: { $0.id == id }) ||
        bagBooks.contains(where:   { $0.id == id })
    }

    // MARK: - Persistence (UserDefaults + Codable, mirrors localStorage)
    private func save() {
        if let data = try? JSONEncoder().encode(shelfBooks) {
            UserDefaults.standard.set(data, forKey: shelfKey)
        }
        if let data = try? JSONEncoder().encode(bagBooks) {
            UserDefaults.standard.set(data, forKey: bagKey)
        }
    }

    private func load() {
        if let data = UserDefaults.standard.data(forKey: shelfKey),
           let books = try? JSONDecoder().decode([Book].self, from: data) {
            shelfBooks = books
        }
        if let data = UserDefaults.standard.data(forKey: bagKey),
           let books = try? JSONDecoder().decode([Book].self, from: data) {
            bagBooks = books
        }
    }
}
