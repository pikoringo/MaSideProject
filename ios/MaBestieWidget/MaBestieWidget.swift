import SwiftUI
import WidgetKit

private enum WidgetTheme {
    static func background(_ scheme: ColorScheme) -> Color {
        scheme == .dark
            ? Color(red: 21 / 255, green: 20 / 255, blue: 22 / 255)
            : Color(red: 250 / 255, green: 250 / 255, blue: 250 / 255)
    }

    static func text(_ scheme: ColorScheme) -> Color {
        scheme == .dark
            ? Color(red: 245 / 255, green: 244 / 255, blue: 247 / 255)
            : Color(red: 29 / 255, green: 29 / 255, blue: 31 / 255)
    }

    static func muted(_ scheme: ColorScheme) -> Color {
        scheme == .dark
            ? Color(red: 170 / 255, green: 165 / 255, blue: 174 / 255)
            : Color(red: 110 / 255, green: 107 / 255, blue: 113 / 255)
    }

    static func accent(for character: MyCharacter, scheme: ColorScheme) -> Color {
        switch (character, scheme) {
        case (.rin, .dark): Color(red: 186 / 255, green: 165 / 255, blue: 228 / 255)
        case (.rin, _): Color(red: 125 / 255, green: 104 / 255, blue: 167 / 255)
        case (.julius, .dark): text(.dark)
        case (.julius, _): text(.light)
        }
    }
}

private enum MyCharacter: String {
    case rin = "Rin"
    case julius = "Julius"

    var partner: String { self == .rin ? "Julius" : "Rin" }
}

private struct SharedProfile: Codable {
    let name: String
    let status: String
    let statusMessage: String
    let statusUpdatedAt: String?
    let petId: String
    let petState: String

    enum CodingKeys: String, CodingKey {
        case name, status
        case statusMessage = "status_message"
        case statusUpdatedAt = "status_updated_at"
        case petId = "pet_id"
        case petState = "pet_state"
    }

    var updateDate: Date? {
        guard let statusUpdatedAt else { return nil }
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        return formatter.date(from: statusUpdatedAt)
            ?? ISO8601DateFormatter().date(from: statusUpdatedAt)
    }

    var safePetId: String {
        ["royal_lemur", "tiny_lemur"].contains(petId) ? petId : "tiny_lemur"
    }

    var safePetState: String {
        ["idle", "hungry", "busy", "on_my_way", "sleepy", "need_a_hug", "happy"].contains(petState)
            ? petState : "idle"
    }
}

private enum SharedStatusStore {
    private static let baseURL = URL(string: "https://yxogvfsgfekipibthjxs.supabase.co/rest/v1/profiles")!
    private static let publishableKey = "sb_publishable_DFh8lrv4AZtbwQLQkOCX-A_bIV7DVxS"

    static func fetch(partner: String) async -> SharedProfile? {
        var components = URLComponents(url: baseURL, resolvingAgainstBaseURL: false)!
        components.queryItems = [
            URLQueryItem(name: "name", value: "eq.\(partner)"),
            URLQueryItem(name: "select", value: "name,status,status_message,status_updated_at,pet_id,pet_state"),
            URLQueryItem(name: "limit", value: "1")
        ]
        guard let url = components.url else { return cached(partner: partner) }
        var request = URLRequest(url: url)
        request.setValue(publishableKey, forHTTPHeaderField: "apikey")
        request.timeoutInterval = 10

        do {
            let (data, response) = try await URLSession.shared.data(for: request)
            guard (response as? HTTPURLResponse)?.statusCode == 200,
                  let profile = try JSONDecoder().decode([SharedProfile].self, from: data).first,
                  profile.name == partner else { return cached(partner: partner) }
            UserDefaults.standard.set(data, forKey: cacheKey(partner))
            return profile
        } catch {
            return cached(partner: partner)
        }
    }

    static func cached(partner: String) -> SharedProfile? {
        guard let data = UserDefaults.standard.data(forKey: cacheKey(partner)) else { return nil }
        return try? JSONDecoder().decode([SharedProfile].self, from: data).first
    }

    private static func cacheKey(_ partner: String) -> String { "partner-status-\(partner)" }
}

private struct PartnerEntry: TimelineEntry {
    let date: Date
    let character: MyCharacter
    let profile: SharedProfile?
}

private struct PartnerProvider: TimelineProvider {
    let character: MyCharacter

    func placeholder(in context: Context) -> PartnerEntry {
        PartnerEntry(date: .now, character: character, profile: nil)
    }

    func getSnapshot(in context: Context, completion: @escaping (PartnerEntry) -> Void) {
        completion(PartnerEntry(date: .now, character: character,
                                profile: SharedStatusStore.cached(partner: character.partner)))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<PartnerEntry>) -> Void) {
        Task {
            let profile = await SharedStatusStore.fetch(partner: character.partner)
            let entry = PartnerEntry(date: .now, character: character, profile: profile)
            // WidgetKit may refresh later than requested; this is not a live feed.
            completion(Timeline(entries: [entry], policy: .after(Date().addingTimeInterval(15 * 60))))
        }
    }
}

private struct PartnerWidgetView: View {
    let entry: PartnerEntry
    @Environment(\.widgetFamily) private var family
    @Environment(\.colorScheme) private var colorScheme

    private var petImage: UIImage? {
        guard let profile = entry.profile,
              let url = Bundle.main.url(
                forResource: "\(profile.safePetId)-\(profile.safePetState)",
                withExtension: "png", subdirectory: "Resources"
              ) else { return nil }
        return UIImage(contentsOfFile: url.path)
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(entry.character.partner.uppercased())
                    .font(.system(size: 12, weight: .medium))
                    .tracking(0.5)
                    .foregroundStyle(WidgetTheme.accent(for: entry.character, scheme: colorScheme))
                Spacer()
                Text("MaBestie")
                    .font(.system(size: 11))
                    .foregroundStyle(WidgetTheme.muted(colorScheme))
            }

            HStack(alignment: .center, spacing: 8) {
                if let petImage {
                    Image(uiImage: petImage)
                        .interpolation(.none)
                        .resizable()
                        .scaledToFit()
                        .frame(width: family == .systemSmall ? 72 : 96, height: family == .systemSmall ? 62 : 88)
                        .accessibilityHidden(true)
                }

                VStack(alignment: .leading, spacing: 4) {
                    Text(entry.profile?.status.isEmpty == false ? (entry.profile?.status ?? "") : "No status yet")
                        .font(.system(size: 16, weight: .medium))
                        .foregroundStyle(WidgetTheme.text(colorScheme))
                        .lineLimit(2)

                    if family != .systemSmall, let message = entry.profile?.statusMessage, !message.isEmpty {
                        Text(message)
                            .font(.system(size: 13))
                            .foregroundStyle(WidgetTheme.muted(colorScheme))
                            .lineLimit(2)
                    }
                }
                Spacer(minLength: 0)
            }
            Spacer(minLength: 0)

            if let updated = entry.profile?.updateDate {
                Text(updated < Date().addingTimeInterval(-6 * 60 * 60) ? "Last updated" : "Updated")
                    .font(.system(size: 11))
                    .foregroundStyle(WidgetTheme.muted(colorScheme))
                + Text(" ") + Text(updated, style: .relative)
                    .font(.system(size: 11))
                    .foregroundStyle(WidgetTheme.muted(colorScheme))
            } else {
                Text(entry.profile == nil ? "Connect to load status" : "No recent update")
                    .font(.system(size: 11))
                    .foregroundStyle(WidgetTheme.muted(colorScheme))
            }
        }
        .padding(14)
        .containerBackground(WidgetTheme.background(colorScheme), for: .widget)
        .widgetURL(URL(string: "https://pikoringo.github.io/MaSideProject/"))
    }
}

private struct MaBestiePartnerWidget: Widget {
    let character: MyCharacter

    init() { character = .julius }
    init(character: MyCharacter) { self.character = character }

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "MaBestiePartnerStatus-\(character.rawValue)",
                            provider: PartnerProvider(character: character)) { entry in
            PartnerWidgetView(entry: entry)
        }
        .configurationDisplayName("\(character.partner) status")
        .description("For \(character.rawValue): see \(character.partner)'s latest pet and status.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

@main
struct MaBestieWidgetBundle: WidgetBundle {
    var body: some Widget {
        MaBestiePartnerWidget(character: .rin)
        MaBestiePartnerWidget(character: .julius)
    }
}
