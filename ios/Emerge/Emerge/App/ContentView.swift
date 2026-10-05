import SwiftUI
import UIKit

struct ContentView: View {
    private enum Screen: Hashable {
        case home
        case firstLaunch
        case setup
        case opening
        case live
        case guide
        case closing
        case afterSession
        case grounding
        case support
        case breathing
        case reflection
        case notesHome
        case notesList
        case faq
        case end
    }

    @State private var controller = VoiceLoopController()
    @State private var audioPlayer = GuidanceAudioPlayer()
    @State private var breathingTonePlayer = BreathingTonePlayer()
    @State private var reflectionStore = ReflectionStore()
    @State private var screen: Screen = .home
    @State private var customMinutes = "20"
    @State private var showsVoiceSettings = false
    @State private var voiceStartTask: Task<Void, Never>?
    @State private var sessionTimerTask: Task<Void, Never>?
    @State private var breathingTask: Task<Void, Never>?
    @State private var pendingSessionSeconds: TimeInterval?
    @State private var sessionDeadline: Date?
    @State private var pausedSessionSeconds: TimeInterval?
    @State private var openingTrack: GuidanceTrack = .firstSession
    @State private var guidanceRecordingMissing = false
    @State private var guideReturnsToPractice = false
    @State private var closingComplete = false
    @State private var groundingComplete = false
    @State private var reflectionText = ""
    @State private var reflectionFromSession = false
    @State private var noteSaved = false
    @State private var expandedFAQID: UUID?
    @State private var breathingIn = true
    @State private var breathingExpanded = false
    @State private var breathingSecondsRemaining = 300
    @State private var guideIsFirstLaunch = false
    @AppStorage("emerge.guide-read.v1") private var hasReadGuide = false
    @AppStorage("emerge.first-session-complete.v1") private var hasCompletedFirstSession = false

    var body: some View {
        ZStack {
            switch screen {
            case .home:
                homeScreen
            case .firstLaunch:
                firstLaunchScreen
            case .setup:
                setupScreen
            case .opening:
                openingScreen
            case .live:
                liveScreen
            case .guide:
                guideScreen
            case .closing:
                closingScreen
            case .afterSession:
                afterSessionScreen
            case .grounding:
                groundingScreen
            case .support:
                supportScreen
            case .breathing:
                breathingScreen
            case .reflection:
                reflectionScreen
            case .notesHome:
                notesHomeScreen
            case .notesList:
                notesListScreen
            case .faq:
                faqScreen
            case .end:
                endScreen
            }
        }
        .animation(.easeInOut(duration: 0.32), value: screen)
        .preferredColorScheme(.dark)
        .sheet(isPresented: $showsVoiceSettings) {
            VoiceSettingsView(controller: controller)
        }
        .onDisappear {
            stopAllActivity()
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
                        .font(.system(size: 34, weight: .light))
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
                        screen = hasReadGuide ? .setup : .firstLaunch
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

    private var firstLaunchScreen: some View {
        practiceBackground {
            VStack(spacing: 22) {
                Spacer()

                BundledImage(name: "logo")
                    .scaledToFit()
                    .frame(width: 104, height: 112)
                    .opacity(0.52)

                Text("Welcome to Emerge.")
                    .font(.system(size: 28, weight: .light, design: .serif))
                    .foregroundStyle(EmergeTheme.gold)

                Text("Before your first session, it is important that you read the guide!")
                    .font(.system(size: 16))
                    .foregroundStyle(EmergeTheme.text.opacity(0.82))
                    .multilineTextAlignment(.center)
                    .lineSpacing(5)
                    .padding(.horizontal, 18)

                Spacer()

                PrimaryButton(title: "Guide") {
                    guideIsFirstLaunch = true
                    guideReturnsToPractice = false
                    screen = .guide
                }
            }
            .padding(.horizontal, 38)
            .padding(.vertical, 42)
        }
    }

    private var setupScreen: some View {
        practiceBackground {
            VStack(spacing: 0) {
                appHeader
                    .padding(.horizontal, 14)
                    .padding(.top, 12)

                Spacer()

                VStack(alignment: .leading, spacing: 0) {
                    Text("Let's begin.")
                        .font(.system(size: 19, weight: .light))
                        .tracking(0.6)
                        .foregroundStyle(EmergeTheme.text.opacity(0.86))

                    HStack(spacing: 8) {
                        DurationChoice(value: "15 min", label: "Recommended", isSelected: true) {
                            prepareSession(seconds: 15 * 60)
                        }

                        customDurationChoice
                    }
                    .padding(.top, 72)
                }
                .padding(.horizontal, 28)

                Spacer()
                Spacer()
            }
        }
    }

    private var appHeader: some View {
        HStack(spacing: 6) {
            NavPill(title: "EMERGE", selected: screen == .setup) {
                navigateTo(.setup)
            }
            NavPill(title: "GUIDE", selected: screen == .guide) {
                guideIsFirstLaunch = false
                guideReturnsToPractice = false
                navigateTo(.guide)
            }
            NavPill(title: "FAQ", selected: screen == .faq) {
                navigateTo(.faq)
            }
            NavPill(title: "MY NOTES", selected: screen == .notesHome || screen == .notesList || screen == .reflection) {
                navigateTo(.notesHome)
            }

            Spacer(minLength: 0)

            Button {
                showsVoiceSettings = true
            } label: {
                Image(systemName: "gearshape.fill")
                    .font(.system(size: 13, weight: .medium))
                    .foregroundStyle(EmergeTheme.gold.opacity(0.76))
                    .frame(width: 31, height: 31)
                    .background(Color.black.opacity(0.32), in: Circle())
                    .overlay { Circle().stroke(EmergeTheme.gold.opacity(0.24), lineWidth: 1) }
            }
            .buttonStyle(.plain)
            .accessibilityLabel("Repetition voice settings")
        }
    }

    private var customDurationChoice: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("Custom")
                .font(.system(size: 16))
                .foregroundStyle(EmergeTheme.text)

            HStack(spacing: 4) {
                TextField("12–60", text: $customMinutes)
                    .keyboardType(.numberPad)
                    .multilineTextAlignment(.center)
                    .font(.system(size: 13))
                    .foregroundStyle(EmergeTheme.text)
                    .frame(width: 45, height: 32)
                    .background(Color.black.opacity(0.22), in: RoundedRectangle(cornerRadius: 5))
                    .overlay { RoundedRectangle(cornerRadius: 5).stroke(EmergeTheme.gold.opacity(0.2), lineWidth: 1) }

                Text("MIN")
                    .font(.system(size: 10, weight: .bold))
                    .tracking(1.2)
                    .foregroundStyle(EmergeTheme.gold.opacity(0.7))
            }
        }
        .frame(maxWidth: .infinity, minHeight: 88, alignment: .leading)
        .padding(.horizontal, 10)
        .contentShape(Rectangle())
        .background(Color(red: 0.10, green: 0.065, blue: 0.045).opacity(0.55), in: RoundedRectangle(cornerRadius: 8))
        .overlay { RoundedRectangle(cornerRadius: 8).stroke(EmergeTheme.gold.opacity(0.18), lineWidth: 1) }
        .onTapGesture {
            guard let minutes = Int(customMinutes), (12...60).contains(minutes) else { return }
            prepareSession(seconds: TimeInterval(minutes * 60))
        }
        .accessibilityHint("Enter 12 to 60 minutes, then tap the card to begin")
    }

    private var openingScreen: some View {
        practiceBackground {
            VStack(spacing: 24) {
                Spacer(minLength: 32)

                BundledImage(name: "logo")
                    .scaledToFit()
                    .frame(width: 105, height: 114)
                    .opacity(0.5)

                Text(openingTrack == .firstSession ? "Your first session" : "Take a moment")
                    .font(.system(size: 24, weight: .light, design: .serif))
                    .foregroundStyle(EmergeTheme.gold)

                if guidanceRecordingMissing {
                    MissingRecordingPanel(track: openingTrack)
                } else {
                    GuidancePulse(label: "Preparing to begin…")
                }

                Spacer()

                if guidanceRecordingMissing {
                    PrimaryButton(title: "Begin practice") {
                        completeOpeningGuidance()
                    }
                } else {
                    QuietButton(title: "Skip guidance") {
                        audioPlayer.stop()
                        completeOpeningGuidance()
                    }
                }
            }
            .padding(.horizontal, 32)
            .padding(.vertical, 34)
        }
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
                    .font(.system(size: 15))
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
                        beginClosing()
                    }
                    .padding(.top, 7)

                    SupportButton(
                        title: "I need support 🛟",
                        colors: [Color(red: 0.20, green: 0.165, blue: 0.125), Color(red: 0.075, green: 0.063, blue: 0.055)]
                    ) {
                        beginGrounding()
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

    private var guideScreen: some View {
        practiceBackground {
            VStack(spacing: 0) {
                if guideReturnsToPractice {
                    HStack {
                        Button("Back to practice") { resumeFromGuide() }
                            .foregroundStyle(EmergeTheme.gold)
                        Spacer()
                    }
                    .padding(.horizontal, 22)
                    .padding(.top, 16)
                } else {
                    appHeader
                        .padding(.horizontal, 14)
                        .padding(.top, 12)
                }

                ScrollView {
                    VStack(alignment: .leading, spacing: 15) {
                        Text("How the practice works")
                            .font(.system(size: 28, weight: .light, design: .serif))
                            .foregroundStyle(EmergeTheme.gold)
                            .padding(.bottom, 12)

                        ForEach(Array(EmergeContent.guideParagraphs.enumerated()), id: \.offset) { _, paragraph in
                            Text(paragraph)
                                .font(.system(size: 15))
                                .foregroundStyle(EmergeTheme.text.opacity(0.82))
                                .lineSpacing(5)
                        }

                        if guideReturnsToPractice {
                            PrimaryButton(title: "Go back to the practice") {
                                resumeFromGuide()
                            }
                            .padding(.top, 18)
                        } else if guideIsFirstLaunch {
                            PrimaryButton(title: "Continue") {
                                hasReadGuide = true
                                guideIsFirstLaunch = false
                                screen = .setup
                            }
                            .padding(.top, 18)
                        }
                    }
                    .padding(.horizontal, 27)
                    .padding(.top, 42)
                    .padding(.bottom, 44)
                }
            }
        }
    }

    private var closingScreen: some View {
        practiceBackground {
            VStack(spacing: 25) {
                Spacer()

                BundledImage(name: "logo")
                    .scaledToFit()
                    .frame(width: 105, height: 114)
                    .opacity(0.38)

                Text("integration")
                    .font(.system(size: 25, weight: .light, design: .serif))
                    .tracking(4)
                    .foregroundStyle(EmergeTheme.gold.opacity(0.85))

                if guidanceRecordingMissing {
                    MissingRecordingPanel(track: .closing)
                } else if !closingComplete {
                    GuidancePulse(label: "Closing guidance")
                }

                Spacer()

                QuietButton(title: "Continue the session") {
                    continueOpenEndedSession()
                }

                PrimaryButton(title: "Finish the session") {
                    audioPlayer.stop()
                    finishClosing()
                }
            }
            .padding(.horizontal, 32)
            .padding(.vertical, 36)
        }
    }

    private var afterSessionScreen: some View {
        practiceBackground {
            VStack(spacing: 0) {
                Spacer()

                Text("Take all the time you need.")
                    .font(.system(size: 19, weight: .light, design: .serif))
                    .foregroundStyle(EmergeTheme.gold.opacity(0.86))

                Spacer()

                VStack(spacing: 74) {
                    PrimaryButton(title: "REFLECT  ✍️") {
                        openReflection(fromSession: true)
                    }

                    QuietButton(title: "END") {
                        screen = .end
                    }
                }
                .padding(.horizontal, 48)

                Spacer()
                Spacer()
            }
        }
    }

    private var groundingScreen: some View {
        atmosphericBackground(name: "ground-bg-soft") {
            VStack(spacing: 22) {
                Spacer()

                if groundingComplete {
                    VStack(spacing: 16) {
                        PrimaryButton(title: "I feel a little better") {
                            screen = .afterSession
                        }
                        QuietButton(title: "I still need support") {
                            screen = .support
                        }
                    }
                    .padding(22)
                    .background(Color(red: 0.35, green: 0.09, blue: 0.19).opacity(0.58), in: RoundedRectangle(cornerRadius: 26))
                } else {
                    if guidanceRecordingMissing {
                        MissingRecordingPanel(track: .grounding)
                    } else {
                        GuidancePulse(label: "Calming down…")
                    }

                    Spacer()

                    QuietButton(title: "End the guidance") {
                        audioPlayer.stop()
                        groundingComplete = true
                    }
                }
            }
            .padding(.horizontal, 30)
            .padding(.vertical, 42)
        }
    }

    private var supportScreen: some View {
        atmosphericBackground(name: "ground-bg-soft") {
            VStack(spacing: 0) {
                Spacer()

                VStack(alignment: .leading, spacing: 17) {
                    Text("Here are a few things that often help:")
                        .font(.system(size: 18, weight: .semibold, design: .serif))
                        .foregroundStyle(Color(red: 0.25, green: 0.05, blue: 0.15))
                        .padding(.bottom, 5)

                    ForEach(Array(EmergeContent.supportTips.enumerated()), id: \.offset) { index, tip in
                        if index == 0 {
                            Button {
                                startBreathing()
                            } label: {
                                HStack {
                                    Text(tip)
                                    Spacer()
                                    Image(systemName: "chevron.right")
                                }
                                .foregroundStyle(Color(red: 0.30, green: 0.06, blue: 0.17))
                                .padding(11)
                                .background(Color.white.opacity(0.22), in: RoundedRectangle(cornerRadius: 12))
                            }
                            .buttonStyle(.plain)
                        } else {
                            Text(tip)
                                .font(.system(size: 15))
                                .foregroundStyle(Color(red: 0.30, green: 0.06, blue: 0.17))
                        }
                    }
                }
                .padding(24)
                .background(Color(red: 1.0, green: 0.68, blue: 0.77).opacity(0.60), in: RoundedRectangle(cornerRadius: 25))

                Spacer()

                PrimaryButton(title: "Continue") {
                    screen = .afterSession
                }
            }
            .padding(.horizontal, 27)
            .padding(.vertical, 38)
        }
    }

    private var breathingScreen: some View {
        atmosphericBackground(name: "ground-bg-soft") {
            VStack(spacing: 24) {
                Spacer()

                ZStack {
                    Circle()
                        .stroke(Color.white.opacity(0.35), lineWidth: 2)
                        .frame(width: 158, height: 158)
                        .scaleEffect(breathingExpanded ? 1.24 : 0.78)
                        .shadow(color: Color.white.opacity(0.2), radius: 22)

                    VStack(spacing: 8) {
                        Text(breathingIn ? "Breathe in" : "Breathe out")
                            .font(.system(size: 21, weight: .light, design: .serif))
                            .foregroundStyle(.white)
                        Text(timeString(breathingSecondsRemaining))
                            .font(.system(size: 12, design: .monospaced))
                            .foregroundStyle(.white.opacity(0.65))
                    }
                }

                Spacer()

                QuietButton(title: "End breathing") {
                    breathingTask?.cancel()
                    breathingTask = nil
                    breathingTonePlayer.stop()
                    screen = .support
                }
            }
            .padding(.horizontal, 34)
            .padding(.vertical, 42)
        }
    }

    private var reflectionScreen: some View {
        practiceBackground {
            VStack(spacing: 0) {
                appHeader
                    .padding(.horizontal, 14)
                    .padding(.top, 12)

                VStack(alignment: .leading, spacing: 18) {
                    Text("What emerged?")
                        .font(.system(size: 29, weight: .light, design: .serif))
                        .foregroundStyle(EmergeTheme.gold)

                    TextEditor(text: $reflectionText)
                        .scrollContentBackground(.hidden)
                        .font(.system(size: 16))
                        .foregroundStyle(EmergeTheme.text)
                        .padding(12)
                        .frame(minHeight: 230)
                        .background(Color.white.opacity(0.055), in: RoundedRectangle(cornerRadius: 16))
                        .overlay { RoundedRectangle(cornerRadius: 16).stroke(EmergeTheme.gold.opacity(0.18), lineWidth: 1) }

                    Text("Your notes stay on this iPhone.")
                        .font(.system(size: 12))
                        .foregroundStyle(EmergeTheme.mutedText)

                    PrimaryButton(title: noteSaved ? "Saved" : "Save note") {
                        saveReflection()
                    }
                    .disabled(reflectionText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                    .opacity(reflectionText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty ? 0.45 : 1)
                }
                .padding(.horizontal, 28)
                .padding(.top, 45)

                Spacer()
            }
        }
    }

    private var notesHomeScreen: some View {
        practiceBackground {
            VStack(spacing: 0) {
                appHeader
                    .padding(.horizontal, 14)
                    .padding(.top, 12)

                Spacer()

                VStack(spacing: 28) {
                    Text("My Notes")
                        .font(.system(size: 29, weight: .light, design: .serif))
                        .foregroundStyle(EmergeTheme.gold)

                    PrimaryButton(title: "Add notes for today") {
                        openReflection(fromSession: false)
                    }

                    QuietButton(title: "Read my notes") {
                        screen = .notesList
                    }

                    Text("Your notes stay on this iPhone.")
                        .font(.system(size: 12))
                        .foregroundStyle(EmergeTheme.mutedText)
                }
                .padding(.horizontal, 42)

                Spacer()
                Spacer()
            }
        }
    }

    private var notesListScreen: some View {
        practiceBackground {
            VStack(spacing: 0) {
                appHeader
                    .padding(.horizontal, 14)
                    .padding(.top, 12)

                ScrollView {
                    VStack(alignment: .leading, spacing: 16) {
                        Text("My Notes")
                            .font(.system(size: 29, weight: .light, design: .serif))
                            .foregroundStyle(EmergeTheme.gold)
                            .padding(.bottom, 10)

                        if reflectionStore.notes.isEmpty {
                            Text("No notes yet.")
                                .foregroundStyle(EmergeTheme.mutedText)
                                .padding(.top, 30)
                        } else {
                            ForEach(reflectionStore.notes) { note in
                                VStack(alignment: .leading, spacing: 10) {
                                    Text(note.updatedAt.formatted(date: .abbreviated, time: .shortened))
                                        .font(.system(size: 11, weight: .bold))
                                        .tracking(0.8)
                                        .foregroundStyle(EmergeTheme.gold.opacity(0.75))
                                    Text(note.body)
                                        .font(.system(size: 15))
                                        .foregroundStyle(EmergeTheme.text.opacity(0.85))
                                        .lineSpacing(4)
                                }
                                .frame(maxWidth: .infinity, alignment: .leading)
                                .padding(18)
                                .background(Color.white.opacity(0.045), in: RoundedRectangle(cornerRadius: 15))
                                .overlay { RoundedRectangle(cornerRadius: 15).stroke(EmergeTheme.gold.opacity(0.14), lineWidth: 1) }
                            }
                        }
                    }
                    .padding(.horizontal, 27)
                    .padding(.top, 42)
                    .padding(.bottom, 50)
                }
            }
        }
    }

    private var faqScreen: some View {
        practiceBackground {
            VStack(spacing: 0) {
                appHeader
                    .padding(.horizontal, 14)
                    .padding(.top, 12)

                ScrollView {
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Frequently asked questions")
                            .font(.system(size: 28, weight: .light, design: .serif))
                            .foregroundStyle(EmergeTheme.gold)
                            .padding(.bottom, 4)

                        Text("Keep exploring how to use Emerge")
                            .font(.system(size: 14))
                            .foregroundStyle(EmergeTheme.mutedText)
                            .padding(.bottom, 18)

                        ForEach(EmergeContent.faqItems) { item in
                            DisclosureGroup(
                                isExpanded: Binding(
                                    get: { expandedFAQID == item.id },
                                    set: { expandedFAQID = $0 ? item.id : nil }
                                )
                            ) {
                                Text(item.answer)
                                    .font(.system(size: 14))
                                    .foregroundStyle(EmergeTheme.text.opacity(0.72))
                                    .lineSpacing(4)
                                    .padding(.top, 12)
                            } label: {
                                Text(item.question)
                                    .font(.system(size: 15, weight: .medium))
                                    .foregroundStyle(EmergeTheme.text)
                            }
                            .tint(EmergeTheme.gold)
                            .padding(17)
                            .background(Color.white.opacity(0.04), in: RoundedRectangle(cornerRadius: 14))
                            .overlay { RoundedRectangle(cornerRadius: 14).stroke(EmergeTheme.gold.opacity(0.12), lineWidth: 1) }
                        }
                    }
                    .padding(.horizontal, 24)
                    .padding(.top, 40)
                    .padding(.bottom, 55)
                }
            }
        }
    }

    private var endScreen: some View {
        atmosphericBackground(name: "end-bg-thank-you-v1") {
            VStack {
                Spacer()
                HStack(spacing: 12) {
                    QuietButton(title: "FAQ") { screen = .faq }
                    PrimaryButton(title: "Back to Emerge") { screen = .setup }
                }
                .padding(.horizontal, 24)
                .padding(.bottom, 32)
            }
        }
    }

    private func practiceBackground<Content: View>(@ViewBuilder content: () -> Content) -> some View {
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

    private func atmosphericBackground<Content: View>(name: String, @ViewBuilder content: @escaping () -> Content) -> some View {
        GeometryReader { proxy in
            ZStack {
                BundledImage(name: name)
                    .scaledToFill()
                    .frame(width: proxy.size.width, height: proxy.size.height)
                    .clipped()
                Color.black.opacity(0.08)
                content()
            }
            .ignoresSafeArea()
        }
    }

    private func prepareSession(seconds: TimeInterval?) {
        stopAllActivity()
        pendingSessionSeconds = seconds

        openingTrack = hasCompletedFirstSession ? .returningSession : .firstSession
        guidanceRecordingMissing = false
        screen = .opening
        let didStart = audioPlayer.play(openingTrack) {
            completeOpeningGuidance()
        }
        guidanceRecordingMissing = !didStart
    }

    private func completeOpeningGuidance() {
        audioPlayer.stop()
        hasCompletedFirstSession = true
        startPractice(seconds: pendingSessionSeconds)
    }

    private func startPractice(seconds: TimeInterval?) {
        audioPlayer.stop()
        guidanceRecordingMissing = false
        screen = .live
        scheduleSessionEnd(after: seconds)
        voiceStartTask?.cancel()
        voiceStartTask = Task { await controller.startSession() }
    }

    private func scheduleSessionEnd(after seconds: TimeInterval?) {
        sessionTimerTask?.cancel()
        sessionTimerTask = nil
        sessionDeadline = nil

        guard let seconds else { return }
        sessionDeadline = Date().addingTimeInterval(seconds)
        sessionTimerTask = Task {
            do {
                try await Task.sleep(for: .seconds(seconds))
                guard !Task.isCancelled else { return }
                await MainActor.run { beginClosing() }
            } catch {
                return
            }
        }
    }

    private func pauseForGuide() {
        if let sessionDeadline {
            pausedSessionSeconds = max(0.25, sessionDeadline.timeIntervalSinceNow)
        } else {
            pausedSessionSeconds = nil
        }
        sessionTimerTask?.cancel()
        sessionTimerTask = nil
        voiceStartTask?.cancel()
        voiceStartTask = nil
        controller.stopSession()
        guideReturnsToPractice = true
        screen = .guide
    }

    private func resumeFromGuide() {
        guideReturnsToPractice = false
        startPractice(seconds: pausedSessionSeconds)
        pausedSessionSeconds = nil
    }

    private func beginClosing() {
        sessionTimerTask?.cancel()
        sessionTimerTask = nil
        sessionDeadline = nil
        voiceStartTask?.cancel()
        voiceStartTask = nil
        controller.stopSession()
        UIImpactFeedbackGenerator(style: .soft).impactOccurred()
        closingComplete = false
        guidanceRecordingMissing = false
        screen = .closing
        let didStart = audioPlayer.play(.closing) {
            finishClosing()
        }
        guidanceRecordingMissing = !didStart
    }

    private func finishClosing() {
        audioPlayer.stop()
        closingComplete = true
        screen = .afterSession
    }

    private func continueOpenEndedSession() {
        audioPlayer.stop()
        startPractice(seconds: nil)
    }

    private func beginGrounding() {
        sessionTimerTask?.cancel()
        sessionTimerTask = nil
        sessionDeadline = nil
        voiceStartTask?.cancel()
        voiceStartTask = nil
        controller.stopSession()
        groundingComplete = false
        guidanceRecordingMissing = false
        screen = .grounding
        let didStart = audioPlayer.play(.grounding) {
            groundingComplete = true
        }
        guidanceRecordingMissing = !didStart
    }

    private func startBreathing() {
        breathingTask?.cancel()
        breathingSecondsRemaining = 300
        breathingIn = true
        breathingExpanded = false
        screen = .breathing

        breathingTask = Task {
            for step in 0..<60 {
                guard !Task.isCancelled else { return }
                await MainActor.run {
                    breathingIn = step.isMultiple(of: 2)
                    breathingTonePlayer.play(isInhale: breathingIn)
                    withAnimation(.easeInOut(duration: 5)) {
                        breathingExpanded = breathingIn
                    }
                }

                do {
                    try await Task.sleep(for: .seconds(5))
                } catch {
                    return
                }

                await MainActor.run {
                    breathingSecondsRemaining = max(0, 300 - ((step + 1) * 5))
                }
            }

            guard !Task.isCancelled else { return }
            await MainActor.run {
                breathingTonePlayer.stop()
                breathingTask = nil
                screen = .support
            }
        }
    }

    private func openReflection(fromSession: Bool) {
        reflectionFromSession = fromSession
        reflectionText = reflectionStore.todayNote?.body ?? ""
        noteSaved = false
        screen = .reflection
    }

    private func saveReflection() {
        reflectionStore.saveToday(reflectionText)
        noteSaved = true
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.6) {
            screen = reflectionFromSession ? .end : .notesHome
        }
    }

    private func navigateTo(_ destination: Screen) {
        audioPlayer.stop()
        if destination != .guide {
            guideReturnsToPractice = false
            guideIsFirstLaunch = false
        }
        screen = destination
    }

    private func stopAllActivity() {
        sessionTimerTask?.cancel()
        sessionTimerTask = nil
        breathingTask?.cancel()
        breathingTask = nil
        breathingTonePlayer.stop()
        voiceStartTask?.cancel()
        voiceStartTask = nil
        controller.stopSession()
        audioPlayer.stop()
    }

    private func timeString(_ seconds: Int) -> String {
        String(format: "%d:%02d", seconds / 60, seconds % 60)
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

private struct NavPill: View {
    let title: String
    let selected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.system(size: 8, weight: .bold, design: .serif))
                .tracking(0.45)
                .foregroundStyle(EmergeTheme.text.opacity(selected ? 0.95 : 0.68))
                .padding(.horizontal, title == "MY NOTES" ? 9 : 10)
                .frame(height: 31)
                .background(
                    selected
                        ? Color(red: 0.53, green: 0.24, blue: 0.15).opacity(0.9)
                        : Color.black.opacity(0.25),
                    in: Capsule()
                )
                .overlay { Capsule().stroke(EmergeTheme.gold.opacity(selected ? 0.42 : 0.18), lineWidth: 1) }
        }
        .buttonStyle(.plain)
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
                    .font(.system(size: 16))
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
            .overlay { RoundedRectangle(cornerRadius: 8).stroke(EmergeTheme.gold.opacity(isSelected ? 0.42 : 0.18), lineWidth: 1) }
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
                .background(LinearGradient(colors: colors, startPoint: .top, endPoint: .bottom), in: Capsule())
                .overlay { Capsule().stroke(EmergeTheme.gold.opacity(0.2), lineWidth: 1) }
                .shadow(color: .black.opacity(0.22), radius: 12, y: 8)
        }
        .buttonStyle(.plain)
    }
}

private struct PrimaryButton: View {
    let title: String
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.system(size: 13, weight: .bold))
                .tracking(0.7)
                .foregroundStyle(EmergeTheme.text)
                .frame(maxWidth: .infinity, minHeight: 49)
                .background(
                    LinearGradient(
                        colors: [Color(red: 0.60, green: 0.25, blue: 0.15), Color(red: 0.35, green: 0.12, blue: 0.09)],
                        startPoint: .top,
                        endPoint: .bottom
                    ),
                    in: Capsule()
                )
                .overlay { Capsule().stroke(EmergeTheme.gold.opacity(0.34), lineWidth: 1) }
                .shadow(color: .black.opacity(0.24), radius: 14, y: 8)
        }
        .buttonStyle(.plain)
    }
}

private struct QuietButton: View {
    let title: String
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.system(size: 13, weight: .semibold))
                .tracking(0.5)
                .foregroundStyle(EmergeTheme.text.opacity(0.86))
                .frame(maxWidth: .infinity, minHeight: 47)
                .background(Color.black.opacity(0.35), in: Capsule())
                .overlay { Capsule().stroke(EmergeTheme.gold.opacity(0.25), lineWidth: 1) }
        }
        .buttonStyle(.plain)
    }
}

private struct GuidancePulse: View {
    let label: String

    var body: some View {
        HStack(spacing: 13) {
            Image(systemName: "waveform")
                .symbolEffect(.variableColor.iterative)
                .foregroundStyle(EmergeTheme.gold)
            Text(label)
                .font(.system(size: 15, weight: .medium))
                .foregroundStyle(EmergeTheme.text.opacity(0.82))
        }
        .padding(.horizontal, 22)
        .frame(minHeight: 54)
        .background(Color(red: 0.34, green: 0.09, blue: 0.18).opacity(0.56), in: Capsule())
        .overlay { Capsule().stroke(EmergeTheme.gold.opacity(0.2), lineWidth: 1) }
    }
}

private struct MissingRecordingPanel: View {
    let track: GuidanceTrack

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 12) {
                Label("Voice recording to be added", systemImage: "waveform.badge.exclamationmark")
                    .font(.system(size: 12, weight: .bold))
                    .foregroundStyle(EmergeTheme.gold)

                Text(track.fallbackText)
                    .font(.system(size: 14))
                    .foregroundStyle(EmergeTheme.text.opacity(0.78))
                    .lineSpacing(5)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(18)
        }
        .frame(maxHeight: 330)
        .background(Color.white.opacity(0.045), in: RoundedRectangle(cornerRadius: 16))
        .overlay { RoundedRectangle(cornerRadius: 16).stroke(EmergeTheme.gold.opacity(0.15), lineWidth: 1) }
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
                                            .stroke(EmergeTheme.gold.opacity(controller.selectedVoiceIdentifier == voice.id ? 0.42 : 0.12), lineWidth: 1)
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
        .task { controller.loadVoiceOptions() }
    }
}

#Preview {
    ContentView()
}
