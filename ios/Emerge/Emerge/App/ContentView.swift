import SwiftUI

struct ContentView: View {
    @State private var controller = VoiceLoopController()
    @State private var previewPhrase = "I feel overwhelmed"
    @State private var showsPreview = false

    var body: some View {
        ZStack {
            EmergeTheme.background.ignoresSafeArea()

            RadialGradient(
                colors: [EmergeTheme.terracotta.opacity(0.22), .clear],
                center: .center,
                startRadius: 10,
                endRadius: 260
            )
            .ignoresSafeArea()

            VStack(spacing: 0) {
                header
                Spacer()
                practiceState
                Spacer()
                controls
            }
            .padding(.horizontal, 28)
            .padding(.vertical, 24)
        }
        .preferredColorScheme(.dark)
    }

    private var header: some View {
        HStack {
            VStack(alignment: .leading, spacing: 2) {
                Text("EMERGE")
                    .font(.system(size: 12, weight: .semibold, design: .rounded))
                    .tracking(3.2)
                    .foregroundStyle(EmergeTheme.gold)
                Text("Let it out")
                    .font(.system(size: 15, weight: .regular, design: .serif))
                    .foregroundStyle(EmergeTheme.mutedText)
            }
            Spacer()

            Button {
                showsPreview.toggle()
            } label: {
                Image(systemName: "wrench.and.screwdriver")
                    .font(.system(size: 15, weight: .medium))
                    .foregroundStyle(EmergeTheme.mutedText)
                    .frame(width: 40, height: 40)
                    .background(EmergeTheme.surface.opacity(0.9), in: Circle())
            }
            .accessibilityLabel("Open voice preview")
        }
        .sheet(isPresented: $showsPreview) {
            previewSheet
        }
    }

    private var practiceState: some View {
        VStack(spacing: 28) {
            ZStack {
                Circle()
                    .fill(EmergeTheme.terracotta.opacity(0.12))
                    .frame(width: 190, height: 190)

                Circle()
                    .stroke(EmergeTheme.gold.opacity(0.32), lineWidth: 1)
                    .frame(width: 145, height: 145)

                Image(systemName: stateSymbol)
                    .font(.system(size: 38, weight: .light))
                    .foregroundStyle(EmergeTheme.gold)
                    .symbolEffect(.pulse, isActive: controller.phase == .listening)
            }

            VStack(spacing: 10) {
                Text(controller.phase.title)
                    .font(.system(size: 30, weight: .medium, design: .serif))
                    .foregroundStyle(EmergeTheme.text)

                if !controller.detailText.isEmpty {
                    Text(controller.detailText)
                        .font(.system(size: 16))
                        .multilineTextAlignment(.center)
                        .foregroundStyle(EmergeTheme.mutedText)
                        .lineSpacing(4)
                        .frame(maxWidth: 320)
                }

                if controller.turnCount > 0 {
                    Text("\(controller.turnCount) reflection\(controller.turnCount == 1 ? "" : "s")")
                        .font(.system(size: 13, weight: .medium, design: .rounded))
                        .foregroundStyle(EmergeTheme.gold.opacity(0.74))
                        .padding(.top, 6)
                }
            }
        }
        .animation(.easeInOut(duration: 0.3), value: controller.phase)
    }

    private var controls: some View {
        VStack(spacing: 14) {
            Button {
                controller.toggleSession()
            } label: {
                Text(controller.isSessionActive ? "End session" : "Begin")
                    .font(.system(size: 17, weight: .semibold))
                    .foregroundStyle(EmergeTheme.background)
                    .frame(maxWidth: .infinity)
                    .frame(height: 58)
                    .background(EmergeTheme.gold, in: Capsule())
            }

            Text("No recording is stored. Speech recognition runs on this device.")
                .font(.system(size: 12))
                .multilineTextAlignment(.center)
                .foregroundStyle(EmergeTheme.mutedText.opacity(0.7))
        }
    }

    private var previewSheet: some View {
        NavigationStack {
            Form {
                Section("iPhone voice preview") {
                    TextField("Phrase", text: $previewPhrase, axis: .vertical)
                    Button("Reflect this phrase") {
                        controller.repeatPreview(previewPhrase)
                    }
                }

                Section {
                    Text("This technical control lets us judge the selected iPhone voice before microphone testing. It will not appear in the beta experience.")
                }
            }
            .navigationTitle("Voice test")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Done") { showsPreview = false }
                }
            }
        }
        .presentationDetents([.medium])
    }

    private var stateSymbol: String {
        switch controller.phase {
        case .idle, .stopped:
            "waveform"
        case .preparing, .processing:
            "ellipsis"
        case .listening:
            "mic"
        case .speaking:
            "speaker.wave.2"
        case .failed:
            "exclamationmark"
        }
    }
}

#Preview {
    ContentView()
}
