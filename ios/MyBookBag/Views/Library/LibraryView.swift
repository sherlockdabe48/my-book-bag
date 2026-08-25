import SwiftUI

// MARK: - LibraryView  (Shelf + Bag as segmented tabs)
struct LibraryView: View {
    @EnvironmentObject var store: BookStore
    @State private var selectedTab = 0

    var body: some View {
        NavigationView {
            Group {
                if !store.hasAnyBook {
                    WelcomeView()
                } else {
                    VStack(spacing: 0) {
                        Picker("Library", selection: $selectedTab) {
                            Text("Shelf").tag(0)
                            Text("Bag").tag(1)
                        }
                        .pickerStyle(.segmented)
                        .padding(.horizontal)
                        .padding(.vertical, 8)

                        if selectedTab == 0 {
                            ShelfView()
                        } else {
                            BagView()
                        }
                    }
                }
            }
            .navigationTitle("MY BOOK BAG")
            .navigationBarTitleDisplayMode(.inline)
            .toolbarBackground(Color("Charcoal"), for: .navigationBar)
            .toolbarBackground(.visible, for: .navigationBar)
            .toolbarColorScheme(.dark, for: .navigationBar)
        }
    }
}
