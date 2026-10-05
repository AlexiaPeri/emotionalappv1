import Foundation

enum EmergeContent {
    static let guideParagraphs = [
        "Express what you feel without explaining or analysing it, so the feeling has space to move.",
        "How to do it:",
        "1. Bring your attention to your body.",
        "2. Say a simple sentence that names what you feel, without explaining why.",
        "3. The app changes “I” to “you” where needed and repeats the sentence back. Then say it again.",
        "For example: you say, “I’m sad.” The app says, “You’re sad.” You say, “I’m sad.” The app says, “You’re sad,” and so on.",
        "4. Stay with the sentence. Let your body move in whatever way feels natural.",
        "5. If your feeling changes and another sentence arises by itself, follow it. There is no need to force a change.",
        "6. Repeat or change sentences as many times as you need. The words do not have to be perfect; they only need to help you stay with what you feel.",
        "You can keep your eyes open or closed, move or remain still, and stop at any time.",
        "If the practice becomes too intense, tap “I need support” to stop the repetition and begin a grounding guidance."
    ]

    static let safetyShort = "Emerge is a wellness practice for emotional expression. It is not medical care, psychotherapy, or a crisis service. You are always in control: pause or stop at any time. If you feel unsafe or are in immediate danger, stop using the app and contact local emergency services or a trusted person nearby."

    static let safetyFull = "Emerge invites you to focus on feelings and body sensations, which can sometimes feel intense. Use it only when you are in a physically safe place and are not driving or doing anything that requires your full attention. You can keep your eyes open, remain still, change position, pause, or stop at any time. If you feel overwhelmed, use the support button or end the session. Emerge does not diagnose or treat any medical or mental health condition, and it is not a substitute for care from a qualified professional. If distress is intense or persistent, contact a qualified healthcare professional. If you feel unsafe or are in immediate danger, contact local emergency services or a trusted person nearby. The first beta is intended for adults aged 18 or over."

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
            question: "What is Emerge?",
            answer: "A voice-based emotional expression practice. You say what is true in the moment, hear it returned, and repeat it so the feeling has space to move."
        ),
        FAQItem(
            question: "How does a session work?",
            answer: "Bring attention into your body, say one short sentence, listen to it coming back, then repeat. Continue until something naturally shifts."
        ),
        FAQItem(
            question: "Why stay with the same sentence?",
            answer: "Repeating means you no longer have to decide what to say. It can help you leave analysis, stay with one feeling, and experience it more fully."
        ),
        FAQItem(
            question: "When should I change sentences?",
            answer: "When another sentence arises by itself and feels more truthful in your body. There is no need to change for the sake of it."
        ),
        FAQItem(
            question: "What if my sentence no longer matches how I feel, but no new sentence has appeared?",
            answer: "It is fine to keep saying it. Something may already have shifted, even if the sentence no longer fits exactly. The aim is not to describe your experience perfectly."
        ),
        FAQItem(
            question: "What if I don't know how I feel?",
            answer: "Describe a body sensation instead: “I feel warmth in my hands,” “I feel tingling in my belly,” or simply, “I feel something in my chest.”"
        ),
        FAQItem(
            question: "What if I feel several things at once?",
            answer: "Start with whatever feels most present. The choice does not have to be perfect, and you can return to the other feelings later."
        ),
        FAQItem(
            question: "Should I move?",
            answer: "You can invite the feeling to move through your body in whatever way feels natural. You can also stay in a resting position. There is no need to force movement."
        ),
        FAQItem(
            question: "What are the most common mistakes?",
            answer: "Explaining the feeling instead of naming it; trying to force the feeling to change; or holding your body still when it wants to move. Notice these tendencies without judging yourself, then return to what you feel now."
        ),
        FAQItem(
            question: "What if it becomes too intense?",
            answer: "Tap “I need support” to stop the repetition and begin the grounding guidance. You can end the session at any time. If you feel unsafe or are in immediate danger, contact local emergency services or a trusted person nearby."
        ),
        FAQItem(
            question: "Why do this practice?",
            answer: "You may find it useful when you want to make space for what you feel instead of distracting yourself or getting caught in analysis."
        ),
        FAQItem(
            question: "Is this therapy?",
            answer: "No. Emerge is a guided wellness practice for emotional expression. It is not medical care, psychotherapy, or a crisis service."
        )
    ]
}
