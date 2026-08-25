import Foundation

// MARK: - Google Books API Service
final class GoogleBooksService {

    static let shared = GoogleBooksService()
    private init() {}

    private let baseURL = "https://www.googleapis.com/books/v1/volumes"

    // Read key from Info.plist (set GOOGLE_BOOKS_API_KEY in your scheme environment)
    private var apiKey: String? {
        Bundle.main.object(forInfoDictionaryKey: "GOOGLE_BOOKS_API_KEY") as? String
    }

    // MARK: - Search
    func search(query: String, startIndex: Int = 0, maxResults: Int = 20) async throws -> (books: [Book], totalItems: Int) {
        guard !query.trimmingCharacters(in: .whitespaces).isEmpty else {
            return ([], 0)
        }

        var components = URLComponents(string: baseURL)!
        var queryItems = [
            URLQueryItem(name: "q", value: query),
            URLQueryItem(name: "printType", value: "books"),
            URLQueryItem(name: "startIndex", value: "\(startIndex)"),
            URLQueryItem(name: "maxResults", value: "\(maxResults)"),
        ]
        if let key = apiKey, !key.isEmpty {
            queryItems.append(URLQueryItem(name: "key", value: key))
        }
        components.queryItems = queryItems

        guard let url = components.url else {
            throw URLError(.badURL)
        }

        let (data, response) = try await URLSession.shared.data(from: url)

        if let http = response as? HTTPURLResponse, http.statusCode != 200 {
            throw APIError.httpError(statusCode: http.statusCode)
        }

        let decoded = try JSONDecoder().decode(Book.APIResponse.self, from: data)
        let books = (decoded.items ?? []).map { Book.from(volume: $0) }
        return (books, decoded.totalItems)
    }
}

// MARK: - API Errors
enum APIError: LocalizedError {
    case httpError(statusCode: Int)

    var errorDescription: String? {
        switch self {
        case .httpError(let code):
            if code == 429 {
                return "Too many requests — please wait a moment and try again."
            } else if code == 503 {
                return "Search is temporarily unavailable. Please try again."
            }
            return "Search failed (error \(code)). Please try again."
        }
    }
}
