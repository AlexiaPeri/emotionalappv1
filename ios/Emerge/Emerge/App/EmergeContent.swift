import Foundation

enum EmergeContent {
    static let guideParagraphs = [
        "Express your emotions, without explaining, without analysing, so they can move!",
        "How to do it:",
        "1. Bring your attention to your body.",
        "2. Say a simple sentence that expresses your feeling, with no explanation.",
        "3. Listen to the voice repeating, then repeat it again.",
        "For example: you say, “I’m sad.” The app says, “You’re sad.” You say, “I’m sad.” The app says, “You’re sad,” and so on.",
        "4. Continue to repeat. Move your body. Let go.",
        "5. When your emotions change, you can change what you say to match your new state. Do not try to change; let change happen, if it happens. Be open to staying with the same feeling for a while.",
        "6. Repeat or change as many times as you want. Don’t try to do it perfectly. What matters is that what you say helps you let go, even if it doesn’t match exactly how you feel.",
        "During the whole practice, move. Do not hold anything back, express yourself fully, say what you want to say, focus, repeat, be courageous, face things, let go, be yourself!",
        "The practice invites you to feel all emotions, including difficult ones. If you stay with them long enough, they will probably move. But if you are overwhelmed and need to stop and ground, press the help button and you will be directed into a gentle comeback."
    ]

    static let supportTips = [
        "🌬  Slow breathing (5s in, 5s out)",
        "💧  Rinse your face with cold water",
        "🚶  Take a short walk outside",
        "✍️  Write down what you're feeling",
        "👤  Reach out to someone you trust",
        "🛏  Rest somewhere that feels comfortable"
    ]

    struct FAQItem: Identifiable {
        let id = UUID()
        let question: String
        let answer: String
    }

    static let faqItems = [
        FAQItem(
            question: "Why stay with the same sentence?",
            answer: "Repeating allows you to stop thinking about what to say, and to focus completely on the feeling. This focus makes you process the emotions."
        ),
        FAQItem(
            question: "When should I change sentences?",
            answer: "Only when another sentence arrives by itself and feels more truthful in the body."
        ),
        FAQItem(
            question: "What if my sentence doesn't match how I feel but no new sentence has appeared?",
            answer: "It is fine to say a sentence that doesn't match how you feel, because since the act of saying it has helped you let something out and shift, it might still be beneficial to stay with it. The purpose is to release, not to perfectly articulate how you feel."
        ),
        FAQItem(
            question: "What if I don't know how I feel?",
            answer: "In this case, describe a body sensation. For example, I feel warmth in my hands, or I feel a tingling in my belly, or I feel something in my chest."
        ),
        FAQItem(
            question: "What if I feel multiple things?",
            answer: "Just focus on what seems most prominent. You can always return to the other feelings later."
        ),
        FAQItem(
            question: "Should I move?",
            answer: "Yes, move your feelings through your body, express them with movement."
        ),
        FAQItem(
            question: "What are the most frequent mistakes?",
            answer: "Explaining one's emotions or giving them an object or a reason. We want pure emotions. Another mistake is being impatient and trying to push emotions to change: this doesn't work. One must only focus on what they feel, only what they feel, and not the change, nor the cause, nothing else. The third common mistake is to not move enough. One should really do the practice from the whole body."
        ),
        FAQItem(
            question: "What if it becomes too intense?",
            answer: "The practice can be intense and it can be a very efficient way to really go deep into your feelings. However, if it is too much, press the help button and you will be guided into calming down."
        ),
        FAQItem(
            question: "Why do this practice?",
            answer: "You do it for yourself and for the people around you. Processing your emotions can makes everyone's lives more truthful, connected, and present."
        ),
        FAQItem(
            question: "Is this therapy?",
            answer: "No. Emerge is a guided practice for emotional release. It is not medical care."
        )
    ]
}
