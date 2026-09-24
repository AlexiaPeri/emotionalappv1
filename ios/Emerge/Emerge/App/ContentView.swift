import SwiftUI
import UIKit

struct ContentView: View {
    private enum Screen {
        case home
        case setup
        case live
    }

    @State private var controller = VoiceLoopController()
    @State private var screen: Screen = .home
    @State private var customMinutes = "20"
    @State private var showsVoiceSettings = false
    @State private var showsGuide = false
    @State private var showsSafetySupport = false
    @State private var sessionTimerTask: Task<Void, Never>?

    var body: some View {
        ZStack {
            switch screen {
            case .home:
                homeScreen
                    .transition(.opacity)
            case .setup:
                setupScreen
                    .transition(.opacity)
            case .live:
                liveScreen
                    .transition(.opacity)
            }
        }
        .animation(.easeInOut(duration: 0.35), value: screen)
        .preferredColorScheme(.dark)
        .sheet(isPresented: $showsVoiceSettings) {
            VoiceSettingsView(controller: controller)
        }
        .sheet(isPresented: $showsGuide) {
            PracticeGuideView {
                showsGuide = false
                beginSession(minutes: nil)
            }
        }
        .sheet(isPresented: $showsSafetySupport) {
            SafetySupportView {
                showsSafetySupport = false
                screen = .setup
            }
        }
        .onDisappear {
            sessionTimerTask?.cancel()
            controller.stopSession()
        }
    }

    private var homeScreen: some View {
        GeometryReader { proxy in
            ZStack {
                BundledImage(name: "home1-bg")
                    .scaledToFill()
                    .frame(width: proxy.size.width, height: proxy.size.height)
                    .clipped()

                LinearGradient(
                    colors: [.black.opacity(0.1), .clear, .black.opacity(0.22)],
                    startPoint: .top,
                    endPoint: .bottom
                )

                VStack(spacing: 0) {
                    Color.clear
                        .frame(height: max(158, proxy.size.height * 0.18))

                    BundledImage(name: "logo")
                        .scaledToFit()
                        .frame(width: 126, height: 136)
                        .shadow(color: .black.opacity(0.5), radius: 14, y: 12)

                    Text("EMERGE")
                        .font(.system(size: 34, weight: .light, design: .default))
                        .tracking(10)
                        .foregroundStyle(
                            LinearGradient(
                                colors: [Color(red: 0.95, green: 0.84, blue: 0.61), EmergeTheme.gold, Color(red: 0.66, green: 0.42, blue: 0.19)],
                                startPoint: .top,
                                endPoint: .bottom
                            )
                        )
                        .padding(.leading, 10)

                    Text("LET IT OUT")
                        .font(.system(size: 11, weight: .regular))
                        .tracking(7)
                        .foregroundStyle(EmergeTheme.gold.opacity(0.88))
                        .padding(.top, 13)
                        .padding(.leading, 7)

                    LinearGradient(
                        colors: [.clear, EmergeTheme.gold.opacity(0.9), .clear],
                        startPoint: .leading,
                        endPoint: .trailing
                    )
                    .frame(width: 50, height: 1)
                    .padding(.top, 27)

                    Text("This is your space\nto release")
                        .font(.system(size: 17, weight: .regular, design: .serif))
                        .tracking(0.7)
                        .multilineTextAlignment(.center)
                        .lineSpacing(10)
                        .foregroundStyle(EmergeTheme.text.opacity(0.94))
                        .padding(.top, 40)

                    Button {
                        screen = .setup
                    } label: {
                        Text("ENTER")
                            .font(.system(size: 13, weight: .bold))
                            .tracking(4)
                            .padding(.leading, 4)
                            .foregroundStyle(Color(red: 1, green: 0.97, blue: 0.94))
                            .frame(width: 230, height: 48)
                            .background(
                                LinearGradient(
                                    colors: [Color(red: 0.70, green: 0.32, blue: 0.19), Color(red: 0.49, green: 0.19, blue: 0.11)],
                                    startPoint: .top,
                                    endPoint: .bottom
                                ),
                                in: Capsule()
                            )
                            .overlay {
                                Capsule()
                                    .stroke(Color(red: 0.89, green: 0.63, blue: 0.41).opacity(0.5), lineWidth: 1)
                            }
                            .shadow(color: .black.opacity(0.44), radius: 18, y: 12)
                    }
                    .buttonStyle(.plain)
                    .padding(.top, 52)

                    Spacer(minLength: max(86, proxy.size.height * 0.14))
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
            }
            .ignoresSafeArea()
        }
    }

    private var setupScreen: some View {
        practiceBackground {
            VStack(spacing: 0) {
                setupHeader
                    .padding(.horizontal, 21)
                    .padding(.top, 12)

                Spacer()

                VStack(alignment: .leading, spacing: 0) {
                    Text("Let's begin.")
                        .font(.system(size: 19, weight: .light))
                        .tracking(0.6)
                        .foregroundStyle(EmergeTheme.text.opacity(0.86))

                    HStack(spacing: 8) {
                        DurationChoice(
                            value: "15 min",
                            label: "Recommended",
                            isSelected: true
                        ) {
                            beginSession(minutes: 15)
                        }

                        DurationChoice(
                            value: "10 sec",
                            label: "Test",
                            widthScale: 0.78
                        ) {
                            beginSession(seconds: 10)
                        }

                        customDurationChoice
                    }
                    .padding(.top, 72)
                }
                .padding(.horizontal, 32)

                Spacer()
                Spacer()
            }
        }
    }

    private var setupHeader: some View {
        HStack {
            Button {
                screen = .home
            } label: {
                Text("EMERGE")
                    .font(.system(size: 11, weight: .semibold, design: .serif))
                    .tracking(0.8)
                    .foregroundStyle(EmergeTheme.text.opacity(0.88))
                    .frame(width: 86, height: 32)
                    .background(Color(red: 0.53, green: 0.24, blue: 0.15).opacity(0.9), in: Capsule())
                    .overlay {
                        Capsule().stroke(EmergeTheme.gold.opacity(0.42), lineWidth: 1)
                    }
            }
            .buttonStyle(.plain)

            Spacer()

            Button {
                showsVoiceSettings = true
            } label: {
                Image(systemName: "gearshape.fill")
                    .font(.system(size: 16, weight: .medium))
                    .foregroundStyle(EmergeTheme.gold.opacity(0.7))
                    .frame(width: 36, height: 36)
                    .background(Color.black.opacity(0.34), in: Circle())
                    .overlay {
                        Circle().stroke(EmergeTheme.gold.opacity(0.28), lineWidth: 1)
                    }
            }
            .buttonStyle(.plain)
            .accessibilityLabel("Voice settings")
        }
    }

    private var customDurationChoice: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("Custom")
                .font(.system(size: 16, weight: .regular))
                .foregroundStyle(EmergeTheme.text)

            HStack(spacing: 4) {
                TextField("12–60", text: $customMinutes)
                    .keyboardType(.numberPad)
                    .multilineTextAlignment(.center)
                    .font(.system(size: 13))
                    .foregroundStyle(EmergeTheme.text)
                    .frame(width: 48, height: 32)
                    .background(Color.black.opacity(0.22), in: RoundedRectangle(cornerRadius: 5))
                    .overlay {
                        RoundedRectangle(cornerRadius: 5)
                            .stroke(EmergeTheme.gold.opacity(0.2), lineWidth: 1)
                    }

                Text("MIN")
                    .font(.system(size: 11, weight: .bold))
                    .tracking(1.5)
                    .foregroundStyle(EmergeTheme.gold.opacity(0.7))
            }
        }
        .frame(maxWidth: .infinity, minHeight: 88, alignment: .leading)
        .padding(.horizontal, 11)
        .contentShape(Rectangle())
        .background(Color(red: 0.10, green: 0.065, blue: 0.045).opacity(0.55), in: RoundedRectangle(cornerRadius: 8))
        .overlay {
            RoundedRectangle(cornerRadius: 8)
                .stroke(EmergeTheme.gold.opacity(0.18), lineWidth: 1)
        }
        .onTapGesture {
            guard let minutes = Int(customMinutes), (12...60).contains(minutes) else { return }
            beginSession(minutes: minutes)
        }
        .accessibilityHint("Enter 12 to 60 minutes, then tap the card to begin")
    }

    private var liveScreen: some View {
        practiceBackground {
            VStack(spacing: 0) {
                Spacer()

                BundledImage(name: "logo")
                    .scaledToFit()
                    .frame(width: 150, height: 162)
                    .opacity(0.34)
                    .shadow(color: .black.opacity(0.4), radius: 18, y: 14)

                Text("Everything you feel is welcome")
                    .font(.system(size: 15, weight: .regular))
                    .tracking(1.8)
                    .foregroundStyle(EmergeTheme.gold.opacity(0.72))
                    .padding(.top, 27)

                if case let .failed(message) = controller.phase {
                    Text(message)
                        .font(.system(size: 12))
                        .multilineTextAlignment(.center)
                        .foregroundStyle(Color(red: 0.91, green: 0.59, blue: 0.43))
                        .padding(.horizontal, 32)
                        .padding(.top, 18)
                }

                Spacer()

                VStack(spacing: 13) {
                    SupportButton(
                        title: "Review instructions 🤓",
                        colors: [Color(red: 0.165, green: 0.114, blue: 0.078), Color(red: 0.094, green: 0.063, blue: 0.047)]
                    ) {
                        pauseForGuide()
                    }

                    SupportButton(
                        title: "End session 😌",
                        colors: [Color(red: 0.36, green: 0.165, blue: 0.114), Color(red: 0.18, green: 0.086, blue: 0.067)]
                    ) {
                        finishSession()
                    }
                    .padding(.top, 7)

                    SupportButton(
                        title: "I need support 🛟",
                        colors: [Color(red: 0.20, green: 0.165, blue: 0.125), Color(red: 0.075, green: 0.063, blue: 0.055)]
                    ) {
                        openSafetySupport()
                    }
                    .padding(.top, 24)
                }
                .padding(.horizontal, 45)
                .padding(.bottom, 38)
            }
            .overlay(alignment: .topLeading) {
                Text(controller.phase.title)
                    .font(.caption2)
                    .foregroundStyle(.clear)
                    .accessibilityLabel(controller.phase.title)
                    .accessibilityAddTraits(.updatesFrequently)
            }
        }
    }

    private func practiceBackground<Content: View>(
        @ViewBuilder content: () -> Content
    ) -> some View {
        ZStack {
            Color(red: 0.027, green: 0.023, blue: 0.020)
                .ignoresSafeArea()

            RadialGradient(
                colors: [Color(red: 0.31, green: 0.13, blue: 0.07).opacity(0.34), .clear],
                center: .topLeading,
                startRadius: 5,
                endRadius: 320
            )
            .ignoresSafeArea()

            RadialGradient(
                colors: [EmergeTheme.gold.opacity(0.055), .clear],
                center: .bottomTrailing,
                startRadius: 1,
                endRadius: 300
            )
            .ignoresSafeArea()

            content()
        }
    }

    private func beginSession(minutes: Int?) {
        if let minutes {
            beginSession(seconds: minutes * 60)
        } else {
            beginSession(seconds: nil)
        }
    }

    private func beginSession(seconds: Int?) {
        sessionTimerTask?.cancel()
        screen = .live

        Task {
            await controller.startSession()
        }

        guard let seconds else { return }
        sessionTimerTask = Task {
            do {
                try await Task.sleep(for: .seconds(seconds))
                guard !Task.isCancelled else { return }
                await MainActor.run {
                    finishSession()
                }
            } catch {
                return
            }
        }
    }

    private func pauseForGuide() {
        sessionTimerTask?.cancel()
        controller.stopSession()
        showsGuide = true
    }

    private func openSafetySupport() {
        sessionTimerTask?.cancel()
        controller.stopSession()
        showsSafetySupport = true
    }

    private func finishSession() {
        sessionTimerTask?.cancel()
        sessionTimerTask = nil
        controller.stopSession()
        screen = .setup
    }
}

private struct BundledImage: View {
    let name: String

    var body: some View {
        if let url = Bundle.main.url(forResource: name, withExtension: "png"),
           let image = UIImage(contentsOfFile: url.path) {
            Image(uiImage: image)
                .resizable()
        } else {
            Color.clear
        }
    }
}

private struct DurationChoice: View {
    let value: String
    let label: String
    var isSelected = false
    var widthScale = 1.0
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(alignment: .leading, spacing: 7) {
                Text(value)
                    .font(.system(size: 16, weight: .regular))
                    .foregroundStyle(EmergeTheme.text)

                Text(label.uppercased())
                    .font(.system(size: 9, weight: .bold))
                    .tracking(1.1)
                    .foregroundStyle(EmergeTheme.gold.opacity(0.72))
            }
            .frame(maxWidth: .infinity, minHeight: 88, alignment: .leading)
            .padding(.horizontal, 11)
            .background(
                isSelected
                    ? Color(red: 0.70, green: 0.32, blue: 0.19).opacity(0.13)
                    : Color(red: 0.10, green: 0.065, blue: 0.045).opacity(0.55),
                in: RoundedRectangle(cornerRadius: 8)
            )
            .overlay {
                RoundedRectangle(cornerRadius: 8)
                    .stroke(EmergeTheme.gold.opacity(isSelected ? 0.42 : 0.18), lineWidth: 1)
            }
        }
        .buttonStyle(.plain)
        .layoutPriority(widthScale)
    }
}

private struct SupportButton: View {
    let title: String
    let colors: [Color]
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.system(size: 12, weight: .bold))
                .tracking(0.3)
                .foregroundStyle(EmergeTheme.text.opacity(0.8))
                .frame(maxWidth: .infinity, minHeight: 40)
                .background(
                    LinearGradient(colors: colors, startPoint: .top, endPoint: .bottom),
                    in: Capsule()
                )
                .overlay {
                    Capsule().stroke(EmergeTheme.gold.opacity(0.2), lineWidth: 1)
                }
                .shadow(color: .black.opacity(0.22), radius: 12, y: 8)
        }
        .buttonStyle(.plain)
    }
}

private struct VoiceSettingsView: View {
    @Bindable var controller: VoiceLoopController
    @Environment(\.dismiss) private var dismiss
    @State private var previewPhrase = "I feel overwhelmed"

    var body: some View {
        NavigationStack {
            ZStack {
                Color(red: 0.055, green: 0.035, blue: 0.025)
                    .ignoresSafeArea()

                ScrollView {
                    VStack(alignment: .leading, spacing: 22) {
                        VStack(alignment: .leading, spacing: 9) {
                            Text("Choose by listening")
                                .font(.system(size: 19, weight: .semibold))
                            Text("Tap a voice to hear it. Enhanced and Premium voices usually sound the most natural.")
                                .font(.system(size: 13))
                                .foregroundStyle(EmergeTheme.mutedText)
                                .lineSpacing(3)
                        }

                        TextField("Preview phrase", text: $previewPhrase, axis: .vertical)
                            .textFieldStyle(.roundedBorder)

                        VStack(alignment: .leading, spacing: 10) {
                            HStack {
                                Text("PACE")
                                    .font(.system(size: 11, weight: .bold))
                                    .tracking(1.5)
                                    .foregroundStyle(EmergeTheme.gold.opacity(0.76))
                                Spacer()
                                Text("\(Int(controller.speechRate * 100))")
                                    .font(.system(size: 12, design: .monospaced))
                                    .foregroundStyle(EmergeTheme.mutedText)
                            }

                            Slider(
                                value: Binding(
                                    get: { Double(controller.speechRate) },
                                    set: { controller.setSpeechRate(Float($0)) }
                                ),
                                in: 0.46...0.58
                            )
                            .tint(EmergeTheme.gold)
                        }

                        LazyVStack(spacing: 9) {
                            ForEach(controller.voiceOptions) { voice in
                                Button {
                                    controller.previewVoice(voice.id, phrase: previewPhrase)
                                } label: {
                                    HStack(spacing: 13) {
                                        Image(systemName: controller.selectedVoiceIdentifier == voice.id ? "checkmark.circle.fill" : "circle")
                                            .foregroundStyle(EmergeTheme.gold)

                                        VStack(alignment: .leading, spacing: 3) {
                                            Text(voice.name)
                                                .font(.system(size: 15, weight: .medium))
                                                .foregroundStyle(EmergeTheme.text)
                                            Text("\(voice.language) · \(voice.quality)")
                                                .font(.system(size: 12))
                                                .foregroundStyle(EmergeTheme.mutedText)
                                        }

                                        Spacer()

                                        Image(systemName: "speaker.wave.2.fill")
                                            .font(.system(size: 14))
                                            .foregroundStyle(EmergeTheme.gold.opacity(0.72))
                                    }
                                    .padding(.horizontal, 14)
                                    .frame(minHeight: 58)
                                    .background(Color.white.opacity(0.045), in: RoundedRectangle(cornerRadius: 12))
                                    .overlay {
                                        RoundedRectangle(cornerRadius: 12)
                                            .stroke(
                                                EmergeTheme.gold.opacity(controller.selectedVoiceIdentifier == voice.id ? 0.42 : 0.12),
                                                lineWidth: 1
                                            )
                                    }
                                }
                                .buttonStyle(.plain)
                            }
                        }
                    }
                    .padding(20)
                }
            }
            .navigationTitle("Repetition voice")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Done") { dismiss() }
                }
            }
        }
        .presentationDetents([.large])
        .presentationDragIndicator(.visible)
        .task {
            controller.loadVoiceOptions()
        }
    }
}

private struct PracticeGuideView: View {
    let returnToPractice: () -> Void

    var body: some View {
        GuidanceSheet(
            title: "How the practice works",
            paragraphs: [
                "Say one short sentence about how you feel.",
                "The app changes “I” to “you” where needed and repeats the sentence back to you.",
                "Repeat it. Stay with the sentence until another one arises naturally."
            ],
            buttonTitle: "Return to the practice",
            action: returnToPractice
        )
    }
}

private struct SafetySupportView: View {
    let finish: () -> Void

    var body: some View {
        GuidanceSheet(
            title: "Pause",
            paragraphs: [
                "The repetition has stopped.",
                "Feel the support beneath your body. Notice your breathing without needing to change it.",
                "Look around and notice three things you can see. Take all the time you need."
            ],
            buttonTitle: "Finish",
            action: finish
        )
    }
}

private struct GuidanceSheet: View {
    let title: String
    let paragraphs: [String]
    let buttonTitle: String
    let action: () -> Void

    var body: some View {
        ZStack {
            Color(red: 0.055, green: 0.035, blue: 0.025)
                .ignoresSafeArea()

            VStack(alignment: .leading, spacing: 20) {
                Text(title)
                    .font(.system(size: 25, weight: .light, design: .serif))
                    .foregroundStyle(EmergeTheme.gold)

                ForEach(paragraphs, id: \.self) { paragraph in
                    Text(paragraph)
                        .font(.system(size: 16, weight: .regular))
                        .foregroundStyle(EmergeTheme.text.opacity(0.84))
                        .lineSpacing(5)
                }

                Spacer()

                Button(action: action) {
                    Text(buttonTitle)
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundStyle(EmergeTheme.text)
                        .frame(maxWidth: .infinity, minHeight: 50)
                        .background(Color(red: 0.49, green: 0.19, blue: 0.11), in: Capsule())
                }
                .buttonStyle(.plain)
            }
            .padding(30)
        }
        .presentationDetents([.medium, .large])
        .presentationDragIndicator(.visible)
    }
}

#Preview {
    ContentView()
}
