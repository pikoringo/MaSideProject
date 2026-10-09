import SwiftUI

@main
struct MaBestieWidgetHostApp: App {
    var body: some Scene {
        WindowGroup {
            VStack(alignment: .leading, spacing: 20) {
                Text("MaBestie")
                    .font(.system(size: 26, weight: .medium))

                Text("Your shared space still lives in the web app. This small companion installs the partner-status widget on your iPhone.")
                    .font(.system(size: 15))
                    .foregroundStyle(.secondary)

                Link("Open MaBestie", destination: URL(string: "https://pikoringo.github.io/MaSideProject/")!)
                    .font(.system(size: 16, weight: .medium))

                Text("After installing, add “Julius status” if you are Rin, or “Rin status” if you are Julius. Change your status and pet in the web app.")
                    .font(.system(size: 14))
                    .foregroundStyle(.secondary)
            }
            .padding(24)
        }
    }
}
