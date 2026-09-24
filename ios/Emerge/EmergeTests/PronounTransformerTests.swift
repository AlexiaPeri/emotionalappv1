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

    func testTextWithoutTargetPronounsIsNotRewritten() {
        XCTAssertEqual(PronounTransformer.transform("This feels heavy"), "This feels heavy")
    }
}
