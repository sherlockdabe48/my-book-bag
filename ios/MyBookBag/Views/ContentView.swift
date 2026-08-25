import SwiftUI

struct ContentView: View {
    @EnvironmentObject var store: BookStore

    var body: some View {
        TabView {
            LibraryView()
                .tabItem {
                    Label("Library", systemImage: "books.vertical")
                }

            SearchView()
                .tabItem {
                    Label("Search", systemImage: "magnifyingglass")
                }
        }
        .accentColor(Color("Charcoal"))
    }
}
