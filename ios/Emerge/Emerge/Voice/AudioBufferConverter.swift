import AVFAudio

final class AudioBufferConverter: @unchecked Sendable {
    private let converter: AVAudioConverter?
    private let outputFormat: AVAudioFormat

    init?(from inputFormat: AVAudioFormat, to outputFormat: AVAudioFormat) {
        self.outputFormat = outputFormat
        if inputFormat == outputFormat {
            converter = nil
        } else {
            guard let converter = AVAudioConverter(from: inputFormat, to: outputFormat) else {
                return nil
            }
            self.converter = converter
        }
    }

    func convert(_ input: AVAudioPCMBuffer) -> AVAudioPCMBuffer? {
        guard let converter else { return input }

        let ratio = outputFormat.sampleRate / input.format.sampleRate
        let capacity = AVAudioFrameCount((Double(input.frameLength) * ratio).rounded(.up)) + 32
        guard let output = AVAudioPCMBuffer(pcmFormat: outputFormat, frameCapacity: capacity) else {
            return nil
        }

        var suppliedInput = false
        var conversionError: NSError?
        let status = converter.convert(to: output, error: &conversionError) { _, status in
            guard !suppliedInput else {
                status.pointee = .noDataNow
                return nil
            }
            suppliedInput = true
            status.pointee = .haveData
            return input
        }

        guard status != .error, conversionError == nil else { return nil }
        return output
    }
}
