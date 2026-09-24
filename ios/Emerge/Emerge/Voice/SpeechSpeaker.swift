import AVFAudio

@MainActor
final class SpeechSpeaker: NSObject, AVSpeechSynthesizerDelegate {
    private let synthesizer = AVSpeechSynthesizer()
    private var continuation: CheckedContinuation<Void, Never>?

    override init() {
        super.init()
        synthesizer.delegate = self
    }

    func speak(_ text: String) async {
        guard !text.isEmpty else { return }

        if synthesizer.isSpeaking {
            synthesizer.stopSpeaking(at: .immediate)
        }

        let utterance = AVSpeechUtterance(string: text)
        utterance.voice = preferredEnglishVoice()
        utterance.rate = 0.43
        utterance.pitchMultiplier = 0.96
        utterance.preUtteranceDelay = 0.05

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
        let englishVoices = AVSpeechSynthesisVoice.speechVoices().filter {
            $0.language.hasPrefix("en")
        }

        return englishVoices.max { lhs, rhs in
            voiceScore(lhs) < voiceScore(rhs)
        } ?? AVSpeechSynthesisVoice(language: "en-US")
    }

    private func voiceScore(_ voice: AVSpeechSynthesisVoice) -> Int {
        let languageBonus = voice.language == "en-US" ? 10 : 0
        let qualityScore: Int
        switch voice.quality {
        case .premium:
            qualityScore = 30
        case .enhanced:
            qualityScore = 20
        default:
            qualityScore = 0
        }
        return languageBonus + qualityScore
    }
}
