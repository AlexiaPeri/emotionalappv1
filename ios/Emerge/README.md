# Emerge for iPhone

This is the native English-only Emerge prototype for iPhone. It targets iOS 26 and uses Apple frameworks throughout the first implementation.

## What works now

- Native SwiftUI home, duration, and live-practice screens based on the approved Home 1 web design.
- Apple SpeechAnalyzer and SpeechTranscriber for on-device English transcription.
- Explicit listening → reflecting → speaking → listening loop.
- Local deterministic English pronoun transformation.
- AVSpeechSynthesizer repetition with a listener-controlled choice of the English voices installed on the iPhone.
- A 0.7-second end-of-speech threshold and normal-speed spoken-audio playback.
- Silence, punctuation-only results, and standalone punctuation commands are ignored.
- The microphone is stopped before repetition, so the app does not transcribe its own voice.
- Ten unit tests cover the initial pronoun rules and false punctuation triggers.
- A voice and pace preview is available from the gear button on the duration screen.

The four prerecorded guidance tracks are intentionally not present yet. They will be added only after Alexia records and sends the original files.

## Open and run

1. Open `Emerge.xcodeproj` in Xcode.
2. Select the `Emerge` scheme.
3. Select a connected iPhone running iOS 26 or later.
4. In the Emerge target's Signing & Capabilities tab, select Alexia's Apple development team.
5. Press Run.

The simulator can validate the UI and pronoun tests, but the complete microphone → transcription → iPhone voice loop must be judged on a physical iPhone.

## Verification commands

```bash
xcodebuild \
  -project ios/Emerge/Emerge.xcodeproj \
  -scheme Emerge \
  -sdk iphonesimulator \
  -configuration Debug \
  -derivedDataPath /tmp/EmergeDerivedData \
  CODE_SIGNING_ALLOWED=NO \
  build

xcodebuild test \
  -project ios/Emerge/Emerge.xcodeproj \
  -scheme Emerge \
  -destination 'platform=iOS Simulator,name=iPhone 18 Pro,OS=27.0' \
  -derivedDataPath /tmp/EmergeDerivedData \
  -only-testing:EmergeTests
```

## Next validation

On a physical iPhone, check the English model download, transcription accuracy, pause threshold, repetition latency, and preferred installed voice. The current end-of-turn delay is 0.7 seconds and is deliberately isolated in `VoiceLoopController` so it can be tuned during real-device sessions. Punctuation-only recognition results are ignored so silence cannot trigger a spoken “full stop.”
