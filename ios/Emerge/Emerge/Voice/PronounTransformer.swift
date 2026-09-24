import Foundation

enum PronounTransformer {
    private struct Rule {
        let pattern: String
        let placeholder: String
        let replacement: String
    }

    private static let rules: [Rule] = [
        Rule(pattern: #"\bi am\b"#, placeholder: "⟦IAM⟧", replacement: "you are"),
        Rule(pattern: #"\byou are\b"#, placeholder: "⟦YOUARE⟧", replacement: "I am"),
        Rule(pattern: #"\bi was\b"#, placeholder: "⟦IWAS⟧", replacement: "you were"),
        Rule(pattern: #"\byou were\b"#, placeholder: "⟦YOUWERE⟧", replacement: "I was"),
        Rule(pattern: #"\bi have\b"#, placeholder: "⟦IHAVE⟧", replacement: "you have"),
        Rule(pattern: #"\byou have\b"#, placeholder: "⟦YOUHAVE⟧", replacement: "I have"),
        Rule(pattern: #"\bi had\b"#, placeholder: "⟦IHAD⟧", replacement: "you had"),
        Rule(pattern: #"\byou had\b"#, placeholder: "⟦YOUHAD⟧", replacement: "I had"),
        Rule(pattern: #"\bi will\b"#, placeholder: "⟦IWILL⟧", replacement: "you will"),
        Rule(pattern: #"\byou will\b"#, placeholder: "⟦YOUWILL⟧", replacement: "I will"),
        Rule(pattern: #"\bi would\b"#, placeholder: "⟦IWOULD⟧", replacement: "you would"),
        Rule(pattern: #"\byou would\b"#, placeholder: "⟦YOUWOULD⟧", replacement: "I would"),
        Rule(pattern: #"\bi can\b"#, placeholder: "⟦ICAN⟧", replacement: "you can"),
        Rule(pattern: #"\byou can\b"#, placeholder: "⟦YOUCAN⟧", replacement: "I can"),
        Rule(pattern: #"\bi could\b"#, placeholder: "⟦ICOULD⟧", replacement: "you could"),
        Rule(pattern: #"\byou could\b"#, placeholder: "⟦YOUCOULD⟧", replacement: "I could"),
        Rule(pattern: #"\bi don't\b"#, placeholder: "⟦IDONT⟧", replacement: "you don't"),
        Rule(pattern: #"\byou don't\b"#, placeholder: "⟦YOUDONT⟧", replacement: "I don't"),
        Rule(pattern: #"\bi didn't\b"#, placeholder: "⟦IDIDNT⟧", replacement: "you didn't"),
        Rule(pattern: #"\byou didn't\b"#, placeholder: "⟦YOUDIDNT⟧", replacement: "I didn't"),
        Rule(pattern: #"\bi can't\b"#, placeholder: "⟦ICANT⟧", replacement: "you can't"),
        Rule(pattern: #"\byou can't\b"#, placeholder: "⟦YOUCANT⟧", replacement: "I can't"),
        Rule(pattern: #"\bi won't\b"#, placeholder: "⟦IWONT⟧", replacement: "you won't"),
        Rule(pattern: #"\byou won't\b"#, placeholder: "⟦YOUWONT⟧", replacement: "I won't"),
        Rule(pattern: #"\bi'm\b"#, placeholder: "⟦IM⟧", replacement: "you're"),
        Rule(pattern: #"\byou're\b"#, placeholder: "⟦YOURE⟧", replacement: "I'm"),
        Rule(pattern: #"\bi've\b"#, placeholder: "⟦IVE⟧", replacement: "you've"),
        Rule(pattern: #"\byou've\b"#, placeholder: "⟦YOUVE⟧", replacement: "I've"),
        Rule(pattern: #"\bi'll\b"#, placeholder: "⟦ILL⟧", replacement: "you'll"),
        Rule(pattern: #"\byou'll\b"#, placeholder: "⟦YOULL⟧", replacement: "I'll"),
        Rule(pattern: #"\bi'd\b"#, placeholder: "⟦ID⟧", replacement: "you'd"),
        Rule(pattern: #"\byou'd\b"#, placeholder: "⟦YOUD⟧", replacement: "I'd"),
        Rule(pattern: #"\bmyself\b"#, placeholder: "⟦MYSELF⟧", replacement: "yourself"),
        Rule(pattern: #"\byourself\b"#, placeholder: "⟦YOURSELF⟧", replacement: "myself"),
        Rule(pattern: #"\bmine\b"#, placeholder: "⟦MINE⟧", replacement: "yours"),
        Rule(pattern: #"\byours\b"#, placeholder: "⟦YOURS⟧", replacement: "mine"),
        Rule(pattern: #"\bmy\b"#, placeholder: "⟦MY⟧", replacement: "your"),
        Rule(pattern: #"\byour\b"#, placeholder: "⟦YOUR⟧", replacement: "my"),
        Rule(pattern: #"\bme\b"#, placeholder: "⟦ME⟧", replacement: "you"),
        Rule(pattern: #"\bi\b"#, placeholder: "⟦I⟧", replacement: "you"),
        Rule(pattern: #"\byou\b"#, placeholder: "⟦YOU⟧", replacement: "I")
    ]

    static func transform(_ text: String) -> String {
        var result = normalize(text).lowercased()

        for rule in rules {
            result = result.replacingOccurrences(
                of: rule.pattern,
                with: rule.placeholder,
                options: .regularExpression
            )
        }

        for rule in rules {
            result = result.replacingOccurrences(of: rule.placeholder, with: rule.replacement)
        }

        guard let first = result.first else { return result }
        return first.uppercased() + result.dropFirst()
    }

    static func normalize(_ text: String) -> String {
        text
            .replacingOccurrences(of: "’", with: "'")
            .replacingOccurrences(of: "“", with: "\"")
            .replacingOccurrences(of: "”", with: "\"")
            .split(whereSeparator: \Character.isWhitespace)
            .joined(separator: " ")
    }
}
