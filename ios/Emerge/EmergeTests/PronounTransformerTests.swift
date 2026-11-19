import XCTest
@testable import Emerge

final class PronounTransformerTests: XCTestCase {
    func testFirstPersonPresent() {
        XCTAssertEqual(PronounTransformer.transform("I am angry"), "You are angry")
        XCTAssertEqual(PronounTransformer.transform("I'm overwhelmed"), "You're overwhelmed")
    }

    func testSecondPersonPresent() {
        XCTAssertEqual(PronounTransformer.transform("You are angry"), "I am angry")
        XCTAssertEqual(PronounTransformer.transform("You're overwhelmed"), "I'm overwhelmed")
    }

    func testPastAndConditionalForms() {
        XCTAssertEqual(PronounTransformer.transform("I was scared"), "You were scared")
        XCTAssertEqual(PronounTransformer.transform("You would leave"), "I would leave")
        XCTAssertEqual(PronounTransformer.transform("I could scream"), "You could scream")
    }

    func testPossessivesAndReflexives() {
        XCTAssertEqual(PronounTransformer.transform("This is my fault"), "This is your fault")
        XCTAssertEqual(PronounTransformer.transform("I hate myself"), "You hate yourself")
        XCTAssertEqual(PronounTransformer.transform("Your anger is yours"), "My anger is mine")
    }

    func testNegativeContractions() {
        XCTAssertEqual(PronounTransformer.transform("I don't feel safe"), "You don't feel safe")
        XCTAssertEqual(PronounTransformer.transform("You can't stay"), "I can't stay")
        XCTAssertEqual(PronounTransformer.transform("I won't do it"), "You won't do it")
    }

    func testWhitespaceAndCurlyApostropheNormalization() {
        XCTAssertEqual(
            PronounTransformer.transform("  I’m   so tired.  "),
            "You're so tired."
        )
    }

    // Same phrases as tests/pronouns.test.mjs (web).
    func testYouBecomesMeWhenItIsAnObject() {
        XCTAssertEqual(PronounTransformer.transform("I love you"), "You love me")
        XCTAssertEqual(PronounTransformer.transform("I am angry at you"), "You are angry at me")
        XCTAssertEqual(PronounTransformer.transform("I want you to stay"), "You want me to stay")
        XCTAssertEqual(PronounTransformer.transform("I made you cry"), "You made me cry")
        XCTAssertEqual(PronounTransformer.transform("I miss you Paul"), "You miss me Paul")
    }

    func testYouStaysSubjectWhenItIsTheSubject() {
        XCTAssertEqual(PronounTransformer.transform("I love you and you know it."), "You love me and I know it.")
        XCTAssertEqual(PronounTransformer.transform("I know you love me"), "You know I love you")
        XCTAssertEqual(PronounTransformer.transform("Why did you leave me?"), "Why did I leave you?")
        XCTAssertEqual(PronounTransformer.transform("The way you look at me"), "The way I look at you")
        XCTAssertEqual(PronounTransformer.transform("After you left, I broke."), "After I left, you broke.")
    }

    func testQuestionsAndFixedExpressions() {
        XCTAssertEqual(PronounTransformer.transform("Are you there?"), "Am I there?")
        XCTAssertEqual(PronounTransformer.transform("Am I crazy?"), "Are you crazy?")
        XCTAssertEqual(PronounTransformer.transform("If I were you"), "If you were me")
        XCTAssertEqual(PronounTransformer.transform("Thank you"), "Thank you")
    }

    func testHesitationsAreRemovedOrIgnored() {
        XCTAssertEqual(PronounTransformer.transform("Um, I feel lost, uh"), "You feel lost")
        XCTAssertFalse(VoiceLoopController.isMeaningfulTranscript("um"))
        XCTAssertFalse(VoiceLoopController.isMeaningfulTranscript("hmm hmm"))
        XCTAssertTrue(VoiceLoopController.isMeaningfulTranscript("Humble me"))
    }

    func testTextWithoutTargetPronounsIsNotRewritten() {
        XCTAssertEqual(PronounTransformer.transform("This feels heavy"), "This feels heavy")
    }

    func testEmptyAndPunctuationOnlyTranscriptsAreIgnored() {
        XCTAssertFalse(VoiceLoopController.isMeaningfulTranscript(""))
        XCTAssertFalse(VoiceLoopController.isMeaningfulTranscript("..."))
        XCTAssertFalse(VoiceLoopController.isMeaningfulTranscript("?!"))
    }

    func testSpokenPunctuationCommandsAreIgnored() {
        XCTAssertFalse(VoiceLoopController.isMeaningfulTranscript("full stop"))
        XCTAssertFalse(VoiceLoopController.isMeaningfulTranscript("Period."))
        XCTAssertFalse(VoiceLoopController.isMeaningfulTranscript("question mark"))
    }

    func testRealSpeechContainingPunctuationWordsIsKept() {
        XCTAssertTrue(VoiceLoopController.isMeaningfulTranscript("I have reached a full stop"))
        XCTAssertTrue(VoiceLoopController.isMeaningfulTranscript("I am angry."))
    }

    func testGuidanceTrackFilenamesMatchRecordingHandoff() {
        XCTAssertEqual(GuidanceTrack.firstSession.rawValue, "01-first-session")
        XCTAssertEqual(GuidanceTrack.returningSession.rawValue, "02-returning-session")
        XCTAssertEqual(GuidanceTrack.closing.rawValue, "03-closing")
        XCTAssertEqual(GuidanceTrack.grounding.rawValue, "04-grounding")
    }

    @MainActor
    func testReflectionNotePersistsAndUpdatesOncePerDay() {
        let suiteName = "ReflectionStoreTests.\(UUID().uuidString)"
        guard let defaults = UserDefaults(suiteName: suiteName) else {
            XCTFail("Could not create isolated user defaults")
            return
        }
        defer { defaults.removePersistentDomain(forName: suiteName) }

        let store = ReflectionStore(defaults: defaults)
        store.saveToday("I felt something shift.")
        store.saveToday("I feel calmer now.")

        XCTAssertEqual(store.notes.count, 1)
        XCTAssertEqual(store.todayNote?.body, "I feel calmer now.")

        let restoredStore = ReflectionStore(defaults: defaults)
        XCTAssertEqual(restoredStore.notes, store.notes)
    }
}
