import AVFAudio
import Foundation
import Observation

enum GuidanceTrack: String, CaseIterable {
    case firstSession = "01-first-session"
    case returningSession = "02-returning-session"
    case guidedRelease = "05-guided-release"
    case closing = "03-closing"
    case grounding = "04-grounding"

    var fallbackText: String {
        switch self {
        case .firstSession:
            """
            Welcome to your first session of Emerge.

            The most important thing is to let yourself be as you are. Do not try to change or push what you feel. If you become bored, self-conscious, or uncomfortable, notice that too. There is no need to judge yourself or perform. Keep bringing your attention back to what you feel.

            Let your body take part. As you express yourself with your voice, allow yourself to move in whatever way feels natural.

            The practice is simple. Say a short sentence about how you feel. The app changes “I” to “you” where needed and repeats the sentence back to you. Then say it again. Stay with the sentence until another one arises naturally as your feelings change.

            If it becomes too intense, tap “I need support.” You can stop at any time.

            Now, let’s begin. Close your eyes if that feels comfortable. Take a slow breath in, then breathe out through your mouth. Bring your attention inward. What do you feel?
            """
        case .returningSession:
            "Close your eyes if that feels comfortable. Take a slow breath in, then breathe out through your mouth. Bring your attention inward. What do you feel?"
        case .guidedRelease:
            "The guided release recording has not been added yet."
        case .closing:
            """
            The practice is ending now. Keep your eyes closed if that feels comfortable. Let your body be supported by the position you are in. Notice your breathing without changing it. Feel your feet. Feel your hands. Notice where your body meets the floor, the chair, or the bed.

            Let your body integrate what it has just experienced. There is nothing to understand or solve right now. Begin to notice the sounds in the room. Invite a small movement into your fingers and toes. When you are ready, open your eyes. Take all the time you need. You can reflect on what emerged, or simply end the session.
            """
        case .grounding:
            """
            Pause. The practice has stopped. Find the most comfortable position you can. Feel the support beneath your body. If it feels comfortable, place a hand on your chest or anywhere that feels steady. Notice your breathing without needing to change it. Let your exhale become a little longer.

            Look around and notice three things you can see. Feel your feet or your hands. Invite a small movement into your fingers or toes. You are here, and you can take all the time you need. When you are ready, choose whether you feel a little better or still need support.
            """
        }
    }
}

@MainActor
@Observable
final class GuidanceAudioPlayer {
    private(set) var currentTrack: GuidanceTrack?
    private(set) var isPlaying = false

    private var player: AVAudioPlayer?
    private var completionTask: Task<Void, Never>?

    @discardableResult
    func play(_ track: GuidanceTrack, completion: @escaping @MainActor () -> Void) -> Bool {
        stop()

        guard let url = resourceURL(for: track) else { return false }

        do {
            let session = AVAudioSession.sharedInstance()
            try session.setCategory(.playback, mode: .spokenAudio, options: [.duckOthers])
            try session.setActive(true)

            let player = try AVAudioPlayer(contentsOf: url)
            player.prepareToPlay()
            guard player.play() else {
                stop()
                return false
            }

            self.player = player
            currentTrack = track
            isPlaying = true

            completionTask = Task { [weak self] in
                do {
                    try await Task.sleep(for: .seconds(player.duration + 0.15))
                    guard !Task.isCancelled else { return }
                    self?.finishPlayback()
                    completion()
                } catch {
                    return
                }
            }
            return true
        } catch {
            stop()
            return false
        }
    }

    func stop() {
        completionTask?.cancel()
        completionTask = nil
        player?.stop()
        player = nil
        currentTrack = nil
        isPlaying = false
        try? AVAudioSession.sharedInstance().setActive(false, options: .notifyOthersOnDeactivation)
    }

    func contains(_ track: GuidanceTrack) -> Bool {
        resourceURL(for: track) != nil
    }

    private func resourceURL(for track: GuidanceTrack) -> URL? {
        for fileExtension in ["wav", "m4a", "mp3"] {
            if let url = Bundle.main.url(forResource: track.rawValue, withExtension: fileExtension) {
                return url
            }
        }
        return nil
    }

    private func finishPlayback() {
        player = nil
        completionTask = nil
        currentTrack = nil
        isPlaying = false
        try? AVAudioSession.sharedInstance().setActive(false, options: .notifyOthersOnDeactivation)
    }
}
