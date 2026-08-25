import SwiftUI

// MARK: - WelcomeView  (shown when library is empty)
struct WelcomeView: View {
    var body: some View {
        VStack(spacing: 16) {
            Spacer()
            Image(systemName: "bag.fill")
                .font(.system(size: 64))
                .foregroundColor(Color("Charcoal").opacity(0.3))

            Text("Welcome to\nMy Book Bag")
                .font(.custom("Georgia", size: 24))
                .fontWeight(.semibold)
                .multilineTextAlignment(.center)
                .foregroundColor(Color("Charcoal"))

            Text("Your personal reading tracker")
                .font(.subheadline)
                .foregroundColor(.secondary)

            VStack(alignment: .leading, spacing: 10) {
                Label("Search for books using the Search tab", systemImage: "magnifyingglass")
                Label("Add them to your Shelf to save",         systemImage: "books.vertical")
                Label("Move to your Bag when you start reading", systemImage: "bag")
                Label("Track your reading progress",            systemImage: "chart.bar.fill")
            }
            .font(.callout)
            .foregroundColor(.secondary)
            .padding(.top, 8)

            Spacer()
        }
        .padding(.horizontal, 32)
    }
}
