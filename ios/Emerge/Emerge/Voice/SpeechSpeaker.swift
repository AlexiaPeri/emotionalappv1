import AVFAudio

struct SpeechVoiceOption: Identifiable, Hashable {
    let id: String
    let name: String
    let language: String
    let quality: String
}

@MainActor
final class SpeechSpeaker: NSObject, AVSpeechSynthesizerDelegate {
    private enum DefaultsKey {
        static let voiceIdentifier = "emerge.selectedEnglishVoice"
        static let speechRate = "emerge.speechRate"
    }

    private let synthesizer = AVSpeechSynthesizer()
    private var continuation: CheckedContinuation<Void, Never>?
    private(set) var selectedVoiceIdentifier: String
    private(set) var speechRate: Float

    override init() {
        selectedVoiceIdentifier = UserDefaults.standard.string(
            forKey: DefaultsKey.voiceIdentifier
        ) ?? ""

        let storedRate = UserDefaults.standard.float(forKey: DefaultsKey.speechRate)
        speechRate = storedRate == 0 ? 0.52 : storedRate

        super.init()
        synthesizer.delegate = self
    }

    func loadAvailableEnglishVoices() -> [SpeechVoiceOption] {
        let voices = Self.englishVoices()
        if !voices.contains(where: { $0.identifier == selectedVoiceIdentifier }),
           let fallback = Self.preferredVoice(from: voices) {
            selectVoice(identifier: fallback.identifier)
        }

        return voices.map {
            SpeechVoiceOption(
                id: $0.identifier,
                name: $0.name,
                language: $0.language,
                quality: Self.qualityLabel(for: $0)
            )
        }
    }

    func selectVoice(identifier: String) {
        guard Self.englishVoices().contains(where: { $0.identifier == identifier }) else { return }
        selectedVoiceIdentifier = identifier
        UserDefaults.standard.set(identifier, forKey: DefaultsKey.voiceIdentifier)
    }

    func setSpeechRate(_ rate: Float) {
        speechRate = min(max(rate, 0.46), 0.58)
        UserDefaults.standard.set(speechRate, forKey: DefaultsKey.speechRate)
    }

    func speak(_ text: String) async {
        guard !text.isEmpty else { return }

        if synthesizer.isSpeaking {
            synthesizer.stopSpeaking(at: .immediate)
        }

        let utterance = AVSpeechUtterance(string: text)
        utterance.voice = preferredEnglishVoice()
        utterance.rate = speechRate
        utterance.pitchMultiplier = 1.0
        utterance.preUtteranceDelay = 0

        await withCheckedContinuation { continuation in
            self.continuation = continuation
            synthesizer.speak(utterance)
        }
    }

    func stop() {
        if synthesizer.isSpeaking {
            synthesizer.stopSpeaking(at: .immediate)
        }
        finishCurrentUtterance()
    }

    nonisolated func speechSynthesizer(
        _ synthesizer: AVSpeechSynthesizer,
        didFinish utterance: AVSpeechUtterance
    ) {
        Task { @MainActor in
            finishCurrentUtterance()
        }
    }

    nonisolated func speechSynthesizer(
        _ synthesizer: AVSpeechSynthesizer,
        didCancel utterance: AVSpeechUtterance
    ) {
        Task { @MainActor in
            finishCurrentUtterance()
        }
    }

    private func finishCurrentUtterance() {
        continuation?.resume()
        continuation = nil
    }

    private func preferredEnglishVoice() -> AVSpeechSynthesisVoice? {
        AVSpeechSynthesisVoice(identifier: selectedVoiceIdentifier)
            ?? Self.preferredVoice(from: Self.englishVoices())
            ?? AVSpeechSynthesisVoice(language: "en-US")
    }

    private static func englishVoices() -> [AVSpeechSynthesisVoice] {
        AVSpeechSynthesisVoice.speechVoices()
            .filter { $0.language.hasPrefix("en") }
            .sorted {
                let left = voiceScore($0)
                let right = voiceScore($1)
                if left == right {
                    if $0.language == $1.language {
                        return $0.name.localizedCaseInsensitiveCompare($1.name) == .orderedAscending
                    }
                    return $0.language.localizedCaseInsensitiveCompare($1.language) == .orderedAscending
                }
                return left > right
            }
    }

    private static func preferredVoice(
        from voices: [AVSpeechSynthesisVoice]
    ) -> AVSpeechSynthesisVoice? {
        voices.max { voiceScore($0) < voiceScore($1) }
    }

    private static func voiceScore(_ voice: AVSpeechSynthesisVoice) -> Int {
        let preferredNames = ["Ava", "Zoe", "Samantha", "Serena", "Daniel", "Moira"]
        let nameBonus = preferredNames.firstIndex {
            voice.name.localizedCaseInsensitiveContains($0)
        }.map { preferredNames.count - $0 } ?? 0
        let languageBonus = voice.language == "en-US" ? 20 : (voice.language == "en-GB" ? 10 : 0)
        let qualityScore: Int
        switch voice.quality {
        case .premium:
            qualityScore = 300
        case .enhanced:
            qualityScore = 200
        default:
            qualityScore = 0
        }
        return qualityScore + languageBonus + nameBonus
    }

    private static func qualityLabel(for voice: AVSpeechSynthesisVoice) -> String {
        switch voice.quality {
        case .premium:
            "Premium"
        case .enhanced:
            "Enhanced"
        default:
            "Standard"
        }
    }
}
