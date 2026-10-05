import AVFAudio
import Foundation

@MainActor
final class BreathingTonePlayer {
    private let engine = AVAudioEngine()
    private let playerNode = AVAudioPlayerNode()
    private var isAttached = false

    func play(isInhale: Bool) {
        do {
            let session = AVAudioSession.sharedInstance()
            try session.setCategory(.playback, mode: .default)
            try session.setActive(true)

            if !isAttached {
                engine.attach(playerNode)
                engine.connect(playerNode, to: engine.mainMixerNode, format: nil)
                isAttached = true
            }

            if !engine.isRunning {
                engine.prepare()
                try engine.start()
            }

            playerNode.stop()
            playerNode.scheduleBuffer(makeBuffer(isInhale: isInhale), at: nil, options: .interrupts)
            playerNode.play()
        } catch {
            stop()
        }
    }

    func stop() {
        playerNode.stop()
        if engine.isRunning {
            engine.stop()
        }
        try? AVAudioSession.sharedInstance().setActive(false, options: .notifyOthersOnDeactivation)
    }

    private func makeBuffer(isInhale: Bool) -> AVAudioPCMBuffer {
        let sampleRate = 48_000.0
        let duration = 3.85
        let frameCount = AVAudioFrameCount(sampleRate * duration)
        let format = AVAudioFormat(
            commonFormat: .pcmFormatFloat32,
            sampleRate: sampleRate,
            channels: 1,
            interleaved: false
        )!
        let buffer = AVAudioPCMBuffer(pcmFormat: format, frameCapacity: frameCount)!
        buffer.frameLength = frameCount

        let frequencies = isInhale
            ? [261.63, 329.63, 392.0]
            : [196.0, 246.94, 293.66]
        let voiceLevels = [0.56, 0.28, 0.16]
        let samples = buffer.floatChannelData![0]

        for frame in 0..<Int(frameCount) {
            let time = Double(frame) / sampleRate
            let envelope: Double
            if time < 0.45 {
                envelope = 0.22 * (time / 0.45)
            } else if time < 1.55 {
                envelope = 0.22 - (0.09 * ((time - 0.45) / 1.10))
            } else {
                envelope = 0.13 * max(0, 1 - ((time - 1.55) / (duration - 1.55)))
            }

            let chord = zip(frequencies, voiceLevels).reduce(0.0) { partial, voice in
                partial + sin(2 * Double.pi * voice.0 * time) * voice.1
            }
            samples[frame] = Float(chord * envelope)
        }

        return buffer
    }
}
