import Foundation

// MARK: - Book status
enum BookStatus: String, Codable {
    case onRead   // on shelf
    case reading  // in bag
}

// MARK: - Book model (mirrors TypeScript Book interface)
struct Book: Identifiable, Codable, Equatable {
    let id: String
    var title: String
    var author: String
    var currentPage: Int
    var allPages: Int?          // nil = unknown
    var imageURL: String
    var description: String?
    var status: BookStatus

    // MARK: - Google Books API shapes
    struct APIResponse: Decodable {
        let totalItems: Int
        let items: [Volume]?
    }

    struct Volume: Decodable {
        let id: String
        let volumeInfo: VolumeInfo

        struct VolumeInfo: Decodable {
            let title: String
            let authors: [String]?
            let pageCount: Int?
            let imageLinks: ImageLinks?
            let description: String?

            struct ImageLinks: Decodable {
                let thumbnail: String?
            }
        }
    }

    // MARK: - Map API volume → Book
    static func from(volume: Volume) -> Book {
        // Google returns http:// thumbnails — upgrade to https
        let rawURL = volume.volumeInfo.imageLinks?.thumbnail ?? ""
        let imageURL = rawURL.replacingOccurrences(of: "http://", with: "https://")

        return Book(
            id: volume.id,
            title: volume.volumeInfo.title,
            author: volume.volumeInfo.authors?.joined(separator: ", ") ?? "N/A",
            currentPage: 1,
            allPages: volume.volumeInfo.pageCount,
            imageURL: imageURL.isEmpty ? "" : imageURL,
            description: volume.volumeInfo.description,
            status: .onRead
        )
    }

    // MARK: - Progress helpers
    var progressFraction: Double {
        guard let total = allPages, total > 0 else { return 0 }
        return min(1.0, Double(currentPage) / Double(total))
    }

    var isFinished: Bool {
        guard let total = allPages else { return false }
        return currentPage >= total
    }

    var allPagesDisplay: String {
        allPages.map { "\($0)" } ?? "?"
    }
}
