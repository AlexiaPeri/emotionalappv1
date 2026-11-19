import Foundation

/// Pronoun reflection for the Meisner-style repetition loop.
/// Port of `js/pronouns.js` (English): keep both files behaviourally identical.
enum PronounTransformer {
    // MARK: - Cleaning

    private static let fillerPattern = [
        "um+", "uh+", "uhm+", "hm+", "hmm+", "mm+", "mhm", "er", "erm", "euh+", "heu+", "hum+"
    ].joined(separator: "|")

    private static let leadingFillers = try! NSRegularExpression(
        pattern: "^(?:(?:\(fillerPattern))(?![\\p{L}'])[\\s,.…!?-]*)+",
        options: [.caseInsensitive]
    )

    private static let trailingFillers = try! NSRegularExpression(
        pattern: "(?:[\\s,.…-]*(?<![\\p{L}'])(?:\(fillerPattern)))+[\\s,.…!?-]*$",
        options: [.caseInsensitive]
    )

    private static let spokenPunctuation: Set<String> = [
        "full stop", "period", "comma", "question mark", "exclamation mark",
        "exclamation point", "ellipsis"
    ]

    static func normalize(_ text: String) -> String {
        var result = text
        for apostrophe in ["‘", "’", "ʼ", "`", "´"] {
            result = result.replacingOccurrences(of: apostrophe, with: "'")
        }
        result = result
            .replacingOccurrences(of: "“", with: "\"")
            .replacingOccurrences(of: "”", with: "\"")
        return result
            .split(whereSeparator: \Character.isWhitespace)
            .joined(separator: " ")
    }

    /// Removes hesitation sounds ("um", "uh") at the edges of a transcript.
    static func clean(_ text: String) -> String {
        var cleaned = normalize(text)
        var previous: String
        repeat {
            previous = cleaned
            cleaned = replace(leadingFillers, in: cleaned)
            cleaned = replace(trailingFillers, in: cleaned)
            cleaned = cleaned.trimmingCharacters(in: .whitespaces)
        } while cleaned != previous
        return cleaned
    }

    /// True when a transcript contains real words worth repeating
    /// (not silence, punctuation, a lone "um", or a dictated punctuation command).
    static func isMeaningful(_ text: String) -> Bool {
        let cleaned = clean(text)
        guard cleaned.unicodeScalars.contains(where: CharacterSet.alphanumerics.contains) else {
            return false
        }
        let words = cleaned
            .lowercased()
            .components(separatedBy: CharacterSet.alphanumerics.inverted)
            .filter { !$0.isEmpty }
            .joined(separator: " ")
        return !spokenPunctuation.contains(words)
    }

    private static func replace(_ regex: NSRegularExpression, in text: String) -> String {
        let range = NSRange(text.startIndex..., in: text)
        return regex.stringByReplacingMatches(in: text, range: range, withTemplate: "")
    }

    // MARK: - English reflection

    private static func words(_ list: String) -> Set<String> {
        Set(list.split(separator: " ").map(String.init))
    }

    private static let simple: [String: String] = [
        "me": "you", "my": "your", "mine": "yours", "myself": "yourself",
        "you're": "I'm", "you've": "I've", "you'll": "I'll", "you'd": "I'd",
        "your": "my", "yours": "mine", "yourself": "myself"
    ]

    private static let firstPerson: [String: String] = [
        "i": "you", "i'm": "you're", "i've": "you've", "i'll": "you'll", "i'd": "you'd"
    ]

    private static let phrases: [String: [String]] = [
        "i were you": ["you", "were", "me"],
        "i am": ["you", "are"], "you are": ["I", "am"],
        "i was": ["you", "were"], "you were": ["I", "was"],
        "i wasn't": ["you", "weren't"], "you weren't": ["I", "wasn't"],
        "i were": ["you", "were"],
        "am i": ["are", "you"], "are you": ["am", "I"],
        "aren't you": ["aren't", "I"], "am i not": ["are", "you", "not"],
        "was i": ["were", "you"], "were you": ["was", "I"],
        "wasn't i": ["weren't", "you"], "weren't you": ["wasn't", "I"]
    ]

    private static let auxiliaries = words("do does did don't doesn't didn't can can't cannot could couldn't will won't would wouldn't shall should shouldn't may might must have has had haven't hasn't hadn't is isn't")
    private static let prepositions = words("to at for with about from of without on in into onto by around behind near against toward towards over under through beside besides between among upon within beyond except unlike despite via inside outside across along beneath")
    private static let ambiguousLinks = words("before after until till since than like as")
    private static let clauseStarters = words("and but or so because cause if when whenever that why how what whatever where wherever who whom while though although unless whether then once nor yet even")
    private static let thinkingWords = words("think thought know knew feel felt guess believe believed hope hoped wish wished bet swear swore say said says mean meant realize realized realise realised remember remembered forget forgot suppose pretend pretended promise promised sure glad sorry afraid scared worried happy sad proud upset angry mad jealous grateful thankful surprised hurt relieved ashamed embarrassed disappointed")
    private static let relativeNouns = words("time times way day days moment thing things everything nothing something anything all one reason person place minute second night year years people words life")
    private static let objectFollowers = words("to too so very more most less again anymore now today tonight tomorrow yesterday here there back away up down out off in on at for with about from of into and or but because cause when if all both alone either enough much well badly forever anyway already like as than")
    private static let followingDeterminers = words("i i'm i'd i'll i've me my he she it it's we they him her them us a an the this that these those something everything nothing anything someone everyone nobody anyone somebody everybody some any no your his their our what how why where who")
    private static let subjectFollowers = words("can could will would should must might may do did don't didn't can't won't wouldn't couldn't shouldn't have had never always just really still also only ever even actually probably clearly obviously simply left said went made took gave got came knew thought felt told broke lied cried")
    private static let transitiveVerbs = words("love loved hate hated miss missed need needed want wanted trust trusted blame blamed forgive forgave hit tell told ask asked call called leave help helped see saw hear heard like liked kiss kissed hug hugged hold held choose chose keep kept lose lost let make made give gave show showed owe owed understand understood follow followed protect protected fear feared envy adore adored respect respected remind reminded warn warned watch watched betray betrayed abandon abandoned use used deserve deserved get got push pushed hurt")
    /// "Thank you" / "fuck you" keep their "you": "thank me" would change the meaning.
    private static let frozenBeforeYou = words("thank thanks fuck screw bless damn")

    private static let wordRegex = try! NSRegularExpression(pattern: "[A-Za-z]+(?:'[A-Za-z]+)*")
    private static let clauseBreak = try! NSRegularExpression(pattern: "[.,!?;:…—–]|\\s-\\s|\"")
    private static let sentenceBreak = try! NSRegularExpression(pattern: "[.!?…]")

    private struct Word {
        let text: String
        let lower: String
        let before: String
        let breakBefore: Bool
        let sentenceStart: Bool
    }

    private static func contains(_ regex: NSRegularExpression, _ text: String) -> Bool {
        regex.firstMatch(in: text, range: NSRange(text.startIndex..., in: text)) != nil
    }

    private static func tokenize(_ text: String) -> (words: [Word], tail: String) {
        let nsText = text as NSString
        var result: [Word] = []
        var lastEnd = 0
        for match in wordRegex.matches(in: text, range: NSRange(location: 0, length: nsText.length)) {
            let before = nsText.substring(with: NSRange(location: lastEnd, length: match.range.location - lastEnd))
            let word = nsText.substring(with: match.range)
            let isFirst = result.isEmpty
            result.append(Word(
                text: word,
                lower: word.lowercased(),
                before: before,
                breakBefore: isFirst || contains(clauseBreak, before),
                sentenceStart: isFirst || contains(sentenceBreak, before)
            ))
            lastEnd = match.range.location + match.range.length
        }
        return (result, nsText.substring(from: lastEnd))
    }

    private static func isYouSubject(_ words: [Word], at index: Int) -> Bool {
        let word = words[index]
        let previous: Word? = word.breakBefore ? nil : words[index - 1]
        let beforePrevious: Word? = {
            guard let previous, !previous.breakBefore, index >= 2 else { return nil }
            return words[index - 2]
        }()
        let next: Word? = index + 1 < words.count && !words[index + 1].breakBefore ? words[index + 1] : nil
        let prev = previous?.lower
        let nxt = next?.lower ?? ""
        let auxOpensClause = prev.map { auxiliaries.contains($0) } == true
            && (beforePrevious == nil || clauseStarters.contains(beforePrevious!.lower))

        if let prev, prepositions.contains(prev) { return false }
        if let prev, ambiguousLinks.contains(prev) { return next != nil && !objectFollowers.contains(nxt) }
        guard let next else { return prev == nil || auxOpensClause }
        if objectFollowers.contains(nxt) || followingDeterminers.contains(nxt) { return false }
        if nxt.hasSuffix("ing") || nxt.hasSuffix("ly") { return false }
        if next.text.first?.isUppercase == true { return false } // a name: "I love you Paul"
        guard let prev else { return true }
        if auxOpensClause { return true }
        if clauseStarters.contains(prev) || thinkingWords.contains(prev) || relativeNouns.contains(prev) {
            return true
        }
        if subjectFollowers.contains(nxt) || (nxt.hasSuffix("ed") && nxt.count > 4) { return true }
        if transitiveVerbs.contains(prev) { return false }
        return true
    }

    private static func isFirstPersonForm(_ text: String) -> Bool {
        let lower = text.lowercased()
        return lower == "i" || lower.hasPrefix("i'")
    }

    /// Keeps a capital where the speaker had one (except the always-capital "I").
    private static func matchCase(_ original: String, _ replacement: String) -> String {
        if replacement == "I" || replacement.hasPrefix("I'") { return replacement }
        if original.first?.isUppercase == true && !isFirstPersonForm(original) {
            return replacement.prefix(1).uppercased() + replacement.dropFirst()
        }
        return replacement
    }

    static func transform(_ text: String) -> String {
        let (words, tail) = tokenize(clean(text))
        var output = words.map(\.text)

        var index = 0
        while index < words.count {
            var phrase: [String]?
            for length in [3, 2] where index + length <= words.count {
                let slice = words[index..<(index + length)]
                if slice.dropFirst().contains(where: \.breakBefore) { continue }
                if let match = phrases[slice.map(\.lower).joined(separator: " ")] {
                    phrase = match
                    break
                }
            }
            if let phrase {
                for (offset, replacement) in phrase.enumerated() {
                    output[index + offset] = matchCase(words[index + offset].text, replacement)
                }
                index += phrase.count
                continue
            }

            let word = words[index]
            if word.lower == "you" {
                let previous: Word? = word.breakBefore ? nil : words[index - 1]
                if previous.map({ frozenBeforeYou.contains($0.lower) }) != true {
                    output[index] = isYouSubject(words, at: index) ? "I" : matchCase(word.text, "me")
                }
            } else if let replacement = firstPerson[word.lower] ?? simple[word.lower] {
                output[index] = matchCase(word.text, replacement)
            }
            index += 1
        }

        var result = ""
        for (index, word) in words.enumerated() {
            var piece = output[index]
            if word.sentenceStart, !piece.isEmpty {
                piece = piece.prefix(1).uppercased() + piece.dropFirst()
            }
            result += word.before + piece
        }
        return result + tail
    }
}
