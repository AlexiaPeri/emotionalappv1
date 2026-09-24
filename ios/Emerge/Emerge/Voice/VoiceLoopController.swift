import AVFAudio
import Foundation
import Observation
import Speech

@MainActor
@Observable
final class VoiceLoopController {
    enum Phase: Equatable {
        case idle
        case preparing
        case listening
        case processing
        case speaking
        case stopped
        case failed(String)

        var title: String {
            switch self {
            case .idle: "Ready"
            case .preparing: "Preparing"
            case .listening: "Listening"
            case .processing: "Reflecting"
            case .speaking: "Repeating"
            case .stopped: "Session ended"
            case .failed: "Something went wrong"
            }
        }
    }

    private(set) var phase: Phase = .idle
    private(set) var isSessionActive = false
    private(set) var turnCount = 0
    private(set) var lastRepeatedPhrase = ""
    private(set) var selectedVoiceIdentifier: String
    private(set) var speechRate: Float
    private(set) var voiceOptions: [SpeechVoiceOption] = []

    var detailText: String {
        switch phase {
        case .idle:
            "When you begin, say one short sentence about how you feel."
        case .preparing:
            "Preparing private, on-device speech recognition."
        case .listening:
            "Say what you feel. Pause when the sentence is complete."
        case .processing:
            ""
        case .speaking:
            ""
        case .stopped:
            "You can begin again whenever you are ready."
        case let .failed(message):
            message
        }
    }

    private let audioEngine = AVAudioEngine()
    private let speaker: SpeechSpeaker
    private var analyzer: SpeechAnalyzer?
    private var inputContinuation: AsyncStream<AnalyzerInput>.Continuation?
    private var resultTask: Task<Void, Never>?
    private var endpointTask: Task<Void, Never>?
    private var finalizedText = ""
    private var volatileText = ""
    private var didPrepareSpeechModel = false
    private let endpointDelay: Duration = .milliseconds(700)

    init() {
        let speaker = SpeechSpeaker()
        self.speaker = speaker
        selectedVoiceIdentifier = speaker.selectedVoiceIdentifier
        speechRate = speaker.speechRate
    }

    func toggleSession() {
        if isSessionActive {
            stopSession()
        } else {
            Task { await startSession() }
        }
    }

    func startSession() async {
        guard !isSessionActive else { return }

        phase = .preparing
        turnCount = 0
        lastRepeatedPhrase = ""

        guard await requestMicrophonePermission() else {
            phase = .failed("Microphone access is required. Enable it in Settings, then try again.")
            return
        }

        do {
            try configureRecordingAudioSession()
            isSessionActive = true
            try await startListening()
        } catch {
            await fail(error)
        }
    }

    func stopSession() {
        guard isSessionActive || phase != .idle else { return }
        isSessionActive = false
        endpointTask?.cancel()
        endpointTask = nil
        speaker.stop()
        stopAudioCapture()
        resultTask?.cancel()
        resultTask = nil

        if let analyzer {
            Task { await analyzer.cancelAndFinishNow() }
        }
        analyzer = nil
        phase = .stopped

        try? AVAudioSession.sharedInstance().setActive(
            false,
            options: .notifyOthersOnDeactivation
        )
    }

    func repeatPreview(_ phrase: String) {
        let reflected = PronounTransformer.transform(phrase)
        guard !reflected.isEmpty else { return }

        Task {
            try? configureSpeechPlaybackAudioSession()
            lastRepeatedPhrase = reflected
            phase = .speaking
            await speaker.speak(reflected)
            if !isSessionActive {
                phase = .idle
                try? AVAudioSession.sharedInstance().setActive(
                    false,
                    options: .notifyOthersOnDeactivation
                )
            }
        }
    }

    func selectVoice(_ identifier: String) {
        speaker.selectVoice(identifier: identifier)
        selectedVoiceIdentifier = speaker.selectedVoiceIdentifier
    }

    func loadVoiceOptions() {
        guard voiceOptions.isEmpty else { return }
        voiceOptions = speaker.loadAvailableEnglishVoices()
        selectedVoiceIdentifier = speaker.selectedVoiceIdentifier
    }

    func setSpeechRate(_ rate: Float) {
        speaker.setSpeechRate(rate)
        speechRate = speaker.speechRate
    }

    func previewVoice(_ identifier: String, phrase: String) {
        selectVoice(identifier)
        repeatPreview(phrase)
    }

    private func startListening() async throws {
        guard isSessionActive else { return }

        phase = .preparing
        try configureRecordingAudioSession()
        let transcriber = try await makeEnglishTranscriber()
        let modules: [any SpeechModule] = [transcriber]

        if !didPrepareSpeechModel {
            try await ensureModelIsInstalled(for: modules, locale: transcriber.selectedLocales[0])
            didPrepareSpeechModel = true
        }

        let inputNode = audioEngine.inputNode
        let naturalFormat = inputNode.outputFormat(forBus: 0)
        guard naturalFormat.sampleRate > 0,
              let analysisFormat = await SpeechAnalyzer.bestAvailableAudioFormat(
                compatibleWith: modules,
                considering: naturalFormat
              ),
              let converter = AudioBufferConverter(from: naturalFormat, to: analysisFormat) else {
            throw VoiceLoopError.audioFormatUnavailable
        }

        finalizedText = ""
        volatileText = ""

        let analyzer = SpeechAnalyzer(modules: modules)
        self.analyzer = analyzer
        try await analyzer.prepareToAnalyze(in: analysisFormat)

        let (inputStream, continuation) = AsyncStream.makeStream(of: AnalyzerInput.self)
        inputContinuation = continuation

        resultTask = Task { [weak self, transcriber] in
            do {
                for try await result in transcriber.results {
                    guard !Task.isCancelled else { return }
                    self?.receive(result)
                }
            } catch is CancellationError {
                return
            } catch {
                guard let self, self.isSessionActive else { return }
                await self.fail(error)
            }
        }

        try await analyzer.start(inputSequence: inputStream)

        inputNode.removeTap(onBus: 0)
        inputNode.installTap(
            onBus: 0,
            bufferSize: 1_024,
            format: naturalFormat
        ) { [continuation] buffer, _ in
            guard let converted = converter.convert(buffer) else { return }
            continuation.yield(AnalyzerInput(buffer: converted))
        }

        audioEngine.prepare()
        try audioEngine.start()
        phase = .listening
    }

    private func receive(_ result: SpeechTranscriber.Result) {
        let text = String(result.text.characters)
        guard Self.isMeaningfulTranscript(text) else { return }

        if result.isFinal {
            finalizedText = [finalizedText, text]
                .filter { !$0.isEmpty }
                .joined(separator: " ")
            volatileText = ""
        } else {
            volatileText = text
        }

        guard phase == .listening else { return }
        endpointTask?.cancel()
        endpointTask = Task { [weak self] in
            do {
                try await Task.sleep(for: self?.endpointDelay ?? .milliseconds(700))
                guard !Task.isCancelled else { return }
                await self?.completeTurn()
            } catch {
                return
            }
        }
    }

    private func completeTurn() async {
        guard isSessionActive, phase == .listening else { return }

        let firstDraft = currentTranscript
        guard Self.isMeaningfulTranscript(firstDraft) else { return }

        phase = .processing
        endpointTask = nil
        stopAudioCapture()

        if let analyzer {
            try? await analyzer.finalizeAndFinishThroughEndOfInput()
        }
        await resultTask?.value
        resultTask = nil

        let finalPhrase = currentTranscript.isEmpty ? firstDraft : currentTranscript
        guard Self.isMeaningfulTranscript(finalPhrase) else {
            do {
                try await startListening()
            } catch {
                await fail(error)
            }
            return
        }
        let reflected = PronounTransformer.transform(finalPhrase)
        guard !reflected.isEmpty else {
            do {
                try await startListening()
            } catch {
                await fail(error)
            }
            return
        }

        lastRepeatedPhrase = reflected
        turnCount += 1
        phase = .speaking
        try? configureSpeechPlaybackAudioSession()
        await speaker.speak(reflected)

        guard isSessionActive else { return }
        do {
            try await startListening()
        } catch {
            await fail(error)
        }
    }

    private var currentTranscript: String {
        PronounTransformer.normalize(
            [finalizedText, volatileText]
                .filter { !$0.isEmpty }
                .joined(separator: " ")
        )
    }

    private func stopAudioCapture() {
        if audioEngine.isRunning {
            audioEngine.stop()
        }
        audioEngine.inputNode.removeTap(onBus: 0)
        inputContinuation?.finish()
        inputContinuation = nil
    }

    private func makeEnglishTranscriber() async throws -> SpeechTranscriber {
        guard SpeechTranscriber.isAvailable else {
            throw VoiceLoopError.speechAnalyzerUnavailable
        }

        let requestedLocale = Locale(identifier: "en-US")
        guard let supportedLocale = await SpeechTranscriber.supportedLocale(
            equivalentTo: requestedLocale
        ) else {
            throw VoiceLoopError.englishUnavailable
        }

        return SpeechTranscriber(
            locale: supportedLocale,
            preset: .progressiveTranscription
        )
    }

    private func ensureModelIsInstalled(
        for modules: [any SpeechModule],
        locale: Locale
    ) async throws {
        let status = await AssetInventory.status(forModules: modules)

        switch status {
        case .installed:
            _ = try? await AssetInventory.reserve(locale: locale)
        case .supported:
            guard let request = try await AssetInventory.assetInstallationRequest(
                supporting: modules
            ) else {
                throw VoiceLoopError.modelInstallUnavailable
            }
            try await request.downloadAndInstall()
            _ = try? await AssetInventory.reserve(locale: locale)
        case .downloading:
            throw VoiceLoopError.modelAlreadyDownloading
        case .unsupported:
            throw VoiceLoopError.speechAnalyzerUnavailable
        @unknown default:
            throw VoiceLoopError.speechAnalyzerUnavailable
        }
    }

    private func requestMicrophonePermission() async -> Bool {
        await withCheckedContinuation { continuation in
            AVAudioApplication.requestRecordPermission { granted in
                continuation.resume(returning: granted)
            }
        }
    }

    private func configureRecordingAudioSession() throws {
        let session = AVAudioSession.sharedInstance()
        try session.setCategory(
            .playAndRecord,
            mode: .measurement,
            options: [.defaultToSpeaker, .allowBluetoothHFP]
        )
        try session.setActive(true)
    }

    private func configureSpeechPlaybackAudioSession() throws {
        let session = AVAudioSession.sharedInstance()
        try session.setCategory(.playback, mode: .spokenAudio)
        try session.setActive(true)
    }

    nonisolated static func isMeaningfulTranscript(_ text: String) -> Bool {
        let trimmed = text.trimmingCharacters(in: .whitespacesAndNewlines)
        guard trimmed.unicodeScalars.contains(where: CharacterSet.alphanumerics.contains) else {
            return false
        }

        let spokenPunctuationCommands: Set<String> = [
            "full stop",
            "period",
            "comma",
            "question mark",
            "exclamation mark",
            "exclamation point",
            "ellipsis"
        ]
        let normalizedWords = trimmed
            .lowercased()
            .components(separatedBy: CharacterSet.alphanumerics.inverted)
            .filter { !$0.isEmpty }
            .joined(separator: " ")
        return !spokenPunctuationCommands.contains(normalizedWords)
    }

    private func fail(_ error: Error) async {
        isSessionActive = false
        endpointTask?.cancel()
        stopAudioCapture()
        resultTask?.cancel()
        resultTask = nil
        if let analyzer {
            await analyzer.cancelAndFinishNow()
        }
        analyzer = nil
        phase = .failed((error as? LocalizedError)?.errorDescription ?? error.localizedDescription)
    }
}

private enum VoiceLoopError: LocalizedError {
    case speechAnalyzerUnavailable
    case englishUnavailable
    case audioFormatUnavailable
    case modelInstallUnavailable
    case modelAlreadyDownloading

    var errorDescription: String? {
        switch self {
        case .speechAnalyzerUnavailable:
            "On-device speech recognition is not available on this iPhone."
        case .englishUnavailable:
            "The English speech model is not available on this iPhone."
        case .audioFormatUnavailable:
            "The microphone audio format could not be prepared."
        case .modelInstallUnavailable:
            "The English speech model could not be downloaded. Check your connection and try again."
        case .modelAlreadyDownloading:
            "The English speech model is still downloading. Wait a moment, then try again."
        }
    }
}
