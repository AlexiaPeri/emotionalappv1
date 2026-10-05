import Foundation
import Observation

struct ReflectionNote: Codable, Identifiable, Equatable {
    let id: UUID
    var body: String
    let createdAt: Date
    var updatedAt: Date
}

@MainActor
@Observable
final class ReflectionStore {
    private(set) var notes: [ReflectionNote] = []

    private let defaults: UserDefaults
    private let storageKey = "emerge.reflection-notes.v1"
    private let calendar: Calendar

    init(defaults: UserDefaults = .standard, calendar: Calendar = .current) {
        self.defaults = defaults
        self.calendar = calendar
        load()
    }

    var todayNote: ReflectionNote? {
        notes.first { calendar.isDateInToday($0.createdAt) }
    }

    func saveToday(_ rawBody: String) {
        let body = rawBody.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !body.isEmpty else { return }

        let now = Date()
        if let index = notes.firstIndex(where: { calendar.isDateInToday($0.createdAt) }) {
            notes[index].body = body
            notes[index].updatedAt = now
        } else {
            notes.append(
                ReflectionNote(
                    id: UUID(),
                    body: body,
                    createdAt: now,
                    updatedAt: now
                )
            )
        }

        notes.sort { $0.updatedAt > $1.updatedAt }
        persist()
    }

    private func load() {
        guard let data = defaults.data(forKey: storageKey),
              let decoded = try? JSONDecoder().decode([ReflectionNote].self, from: data) else {
            return
        }
        notes = decoded.sorted { $0.updatedAt > $1.updatedAt }
    }

    private func persist() {
        guard let data = try? JSONEncoder().encode(notes) else { return }
        defaults.set(data, forKey: storageKey)
    }
}
