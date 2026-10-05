# Emerge for iPhone

This is the native English-only Emerge app for iPhone. It targets iOS 26 and uses Apple frameworks throughout the first beta implementation.

## What works now

- The complete native journey: first-use safety, duration, first/returning opening, live practice, guide review, timed or early completion, closing, grounding, extra support, five-minute breathing, reflection, private notes, FAQ, and the final screen.
- Native SwiftUI visuals based on the approved Home 1 and support/end artwork.
- Apple SpeechAnalyzer and SpeechTranscriber for on-device English transcription.
- Explicit listening → reflecting → speaking → listening loop.
- Local deterministic English pronoun transformation.
- AVSpeechSynthesizer repetition with a listener-controlled choice of the English voices installed on the iPhone.
- A 0.7-second end-of-speech threshold and normal-speed spoken-audio playback.
- Silence, punctuation-only results, and standalone punctuation commands are ignored.
- The microphone is stopped before repetition, so the app does not transcribe its own voice.
- Ten unit tests cover the initial pronoun rules and false punctuation triggers.
- A voice and pace preview is available from the gear button on the duration screen.
- Reflection notes are stored only in local iPhone preferences.
- Guidance playback is wired for `01-first-session`, `02-returning-session`, `03-closing`, and `04-grounding` in WAV, M4A, or MP3 format.

The four prerecorded guidance tracks use Alexia's original mono 48 kHz M4A recordings. The text fallback remains available only as a development safeguard if a bundled track is ever missing. The app never synthesizes those static guidances.

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

## Guidance recordings

The app target's Copy Bundle Resources phase contains these exact files:

- `01-first-session.wav`
- `02-returning-session.wav`
- `03-closing.wav`
- `04-grounding.wav`

The player also accepts WAV or MP3 with the same base names. The canonical scripts and recording directions are in [`docs/english-v1-recording-scripts.md`](../../docs/english-v1-recording-scripts.md).

## Next validation

On a physical iPhone, check every branch of the journey, the English model download, transcription accuracy, pause threshold, repetition latency, and preferred installed voice. The current end-of-turn delay is 0.7 seconds and is deliberately isolated in `VoiceLoopController` so it can be tuned during real-device sessions. Punctuation-only recognition results are ignored so silence cannot trigger a spoken “full stop.”
