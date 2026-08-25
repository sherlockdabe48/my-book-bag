import SwiftUI

@main
struct MyBookBagApp: App {
    @StateObject private var store = BookStore()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(store)
        }
    }
}
