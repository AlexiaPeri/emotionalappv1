// Pronoun reflection for the Meisner-style repetition loop.
// The iOS port lives in ios/Emerge/Emerge/Voice/PronounTransformer.swift and
// must stay behaviourally identical (same rules, same test phrases).

const FILLER_WORDS = ["um+", "uh+", "uhm+", "hm+", "hmm+", "mm+", "mhm", "er", "erm", "euh+", "heu+", "hum+"];
const FILLER_PATTERN = FILLER_WORDS.join("|");
const LEADING_FILLERS = new RegExp(`^(?:(?:${FILLER_PATTERN})(?![\\p{L}'])[\\s,.…!?-]*)+`, "iu");
const TRAILING_FILLERS = new RegExp(`(?:[\\s,.…-]*(?<![\\p{L}'])(?:${FILLER_PATTERN}))+[\\s,.…!?-]*$`, "iu");
const SPOKEN_PUNCTUATION = new Set([
  "full stop", "period", "comma", "question mark", "exclamation mark", "exclamation point", "ellipsis",
  "point", "virgule", "point d'interrogation", "point d'exclamation", "points de suspension",
]);

export function normalizeSpokenText(text) {
  return String(text ?? "")
    .replace(/[‘’ʼ`´]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeForMatch(text) {
  return normalizeSpokenText(text)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s']/gu, "")
    .replace(/\s+/g, " ");
}

// Removes hesitation sounds ("um", "uh", "euh") at the edges of a transcript.
export function cleanTranscript(text) {
  let cleaned = normalizeSpokenText(text);
  let previous;
  do {
    previous = cleaned;
    cleaned = cleaned.replace(LEADING_FILLERS, "").replace(TRAILING_FILLERS, "").trim();
  } while (cleaned !== previous);
  return cleaned;
}

// True when a transcript contains real words worth repeating
// (not silence, punctuation, a lone "um", or a dictated punctuation command).
export function isMeaningfulTranscript(text) {
  const cleaned = cleanTranscript(text);
  if (!/[\p{L}\p{N}]/u.test(cleaned)) return false;
  return !SPOKEN_PUNCTUATION.has(normalizeForMatch(cleaned).trim());
}

export function convertPronounsFR(text) {
  let result = cleanTranscript(text).toLowerCase();

  const phaseOne = [
    [/\bmoi-même\b/g, "⟦MOIMEME⟧"], [/\btoi-même\b/g, "⟦TOIMEME⟧"],
    [/\bje me\b/g, "⟦JEME⟧"], [/\btu te\b/g, "⟦TUTE⟧"],
    [/\bje m['’]/g, "⟦JEM⟧"], [/\btu t['’]/g, "⟦TUT⟧"],
    [/\bj['’]\s*en\s+ai\b/g, "⟦JENAI⟧"], [/\btu\s+en\s+as\b/g, "⟦TUENAS⟧"],
    [/\bj['’]\s*y\s+ai\b/g, "⟦JYAI⟧"], [/\btu\s+y\s+as\b/g, "⟦TUYAS⟧"],
    [/\bj['’]\s*en\s+avais\b/g, "⟦JENAVAIS⟧"], [/\btu\s+en\s+avais\b/g, "⟦TUENAVAIS⟧"],
    [/\bj['’]\s*en\s+ai\s+marre\b/g, "⟦JENAIMARRE⟧"], [/\btu\s+en\s+as\s+marre\b/g, "⟦TUENASMARRE⟧"],
    [/\bj['’]\s*ai\b/g, "⟦JAI⟧"], [/\btu\s+as\b/g, "⟦TUAS⟧"],
    [/\bj['’]\s*avais\b/g, "⟦JAVAIS⟧"], [/\btu\s+avais\b/g, "⟦TUAVAIS⟧"],
    [/\bj['’]\s*aurais\b/g, "⟦JAURAIS⟧"], [/\btu\s+aurais\b/g, "⟦TUAURAIS⟧"],
    [/\bj['’]\s*aurai\b/g, "⟦JAURAI⟧"], [/\btu\s+auras\b/g, "⟦TUAURAS⟧"],
    [/\bj['’]\s*étais\b/g, "⟦JETAIS⟧"], [/\btu\s+étais\b/g, "⟦TUETAIS⟧"],
    [/\bje\s+suis\b/g, "⟦JESUIS⟧"], [/\btu\s+es\b/g, "⟦TUES⟧"],
    [/\bje\s+serai\b/g, "⟦JESERAI⟧"], [/\btu\s+seras\b/g, "⟦TUSERAS⟧"],
    [/\bje\s+serais\b/g, "⟦JESERAIS⟧"], [/\btu\s+serais\b/g, "⟦TUSERAIS⟧"],
    [/\bje\s+vais\b/g, "⟦JEVAIS⟧"], [/\btu\s+vas\b/g, "⟦TUVAS⟧"],
    [/\bje\s+fais\b/g, "⟦JEFAIS⟧"], [/\btu\s+fais\b/g, "⟦TUFAIS⟧"],
    [/\bje\s+peux\b/g, "⟦JEPEUX⟧"], [/\btu\s+peux\b/g, "⟦TUPEUX⟧"],
    [/\bje\s+veux\b/g, "⟦JEVEUX⟧"], [/\btu\s+veux\b/g, "⟦TUVEUX⟧"],
    [/\bje\s+dois\b/g, "⟦JEDOIS⟧"], [/\btu\s+dois\b/g, "⟦TUDOIS⟧"],
    [/\bje\s+sais\b/g, "⟦JESAIS⟧"], [/\btu\s+sais\b/g, "⟦TUSAIS⟧"],
    [/\bje\s+ne\b/g, "⟦JENE⟧"], [/\btu\s+ne\b/g, "⟦TUNE⟧"],
    [/\bje\s+n['’]/g, "⟦JEN⟧"], [/\btu\s+n['’]/g, "⟦TUN⟧"],
    [/\bj['’]\s*en\b/g, "⟦JEN2⟧"], [/\btu\s+en\b/g, "⟦TUEN2⟧"],
    [/\bj['’]/g, "⟦J⟧"],
    [/\bje\b/g, "⟦JE⟧"], [/\btu\b/g, "⟦TU⟧"],
    [/\bme\b/g, "⟦ME⟧"], [/\bte\b/g, "⟦TE⟧"],
    [/\bm['’]/g, "⟦MP⟧"], [/\bt['’]/g, "⟦TP⟧"],
    [/\bmon\b/g, "⟦MON⟧"], [/\bton\b/g, "⟦TON⟧"],
    [/\bma\b/g, "⟦MA⟧"], [/\bta\b/g, "⟦TA⟧"],
    [/\bmes\b/g, "⟦MES⟧"], [/\btes\b/g, "⟦TES⟧"],
    [/\bmoi\b/g, "⟦MOI⟧"], [/\btoi\b/g, "⟦TOI⟧"],
  ];

  for (const [pattern, placeholder] of phaseOne) {
    result = result.replace(pattern, placeholder);
  }

  const resolve = {
    "⟦MOIMEME⟧": "toi-même", "⟦TOIMEME⟧": "moi-même",
    "⟦JEME⟧": "tu te", "⟦TUTE⟧": "je me",
    "⟦JEM⟧": "tu t'", "⟦TUT⟧": "je m'",
    "⟦JENAIMARRE⟧": "tu en as marre", "⟦TUENASMARRE⟧": "j'en ai marre",
    "⟦JENAI⟧": "tu en as", "⟦TUENAS⟧": "j'en ai",
    "⟦JYAI⟧": "tu y as", "⟦TUYAS⟧": "j'y ai",
    "⟦JENAVAIS⟧": "tu en avais", "⟦TUENAVAIS⟧": "j'en avais",
    "⟦JAI⟧": "tu as", "⟦TUAS⟧": "j'ai",
    "⟦JAVAIS⟧": "tu avais", "⟦TUAVAIS⟧": "j'avais",
    "⟦JAURAIS⟧": "tu aurais", "⟦TUAURAIS⟧": "j'aurais",
    "⟦JAURAI⟧": "tu auras", "⟦TUAURAS⟧": "j'aurai",
    "⟦JETAIS⟧": "tu étais", "⟦TUETAIS⟧": "j'étais",
    "⟦JESUIS⟧": "tu es", "⟦TUES⟧": "je suis",
    "⟦JESERAI⟧": "tu seras", "⟦TUSERAS⟧": "je serai",
    "⟦JESERAIS⟧": "tu serais", "⟦TUSERAIS⟧": "je serais",
    "⟦JEVAIS⟧": "tu vas", "⟦TUVAS⟧": "je vais",
    "⟦JEFAIS⟧": "tu fais", "⟦TUFAIS⟧": "je fais",
    "⟦JEPEUX⟧": "tu peux", "⟦TUPEUX⟧": "je peux",
    "⟦JEVEUX⟧": "tu veux", "⟦TUVEUX⟧": "je veux",
    "⟦JEDOIS⟧": "tu dois", "⟦TUDOIS⟧": "je dois",
    "⟦JESAIS⟧": "tu sais", "⟦TUSAIS⟧": "je sais",
    "⟦JENE⟧": "tu ne", "⟦TUNE⟧": "je ne",
    "⟦JEN⟧": "tu n'", "⟦TUN⟧": "je n'",
    "⟦JEN2⟧": "tu en", "⟦TUEN2⟧": "j'en",
    "⟦J⟧": "tu ",
    "⟦JE⟧": "tu", "⟦TU⟧": "je",
    "⟦ME⟧": "te", "⟦TE⟧": "me",
    "⟦MP⟧": "t'", "⟦TP⟧": "m'",
    "⟦MON⟧": "ton", "⟦TON⟧": "mon",
    "⟦MA⟧": "ta", "⟦TA⟧": "ma",
    "⟦MES⟧": "tes", "⟦TES⟧": "mes",
    "⟦MOI⟧": "toi", "⟦TOI⟧": "moi",
  };

  for (const [placeholder, value] of Object.entries(resolve)) {
    result = result.split(placeholder).join(value);
  }
  return result.charAt(0).toUpperCase() + result.slice(1);
}

// ---------------------------------------------------------------------------
// English: word-by-word reflection. "I/me/my" become "you/your" and back.
// The hard part is "you", which becomes "I" when it is a subject
// ("you never listen" -> "I never listen") and "me" when it is an object
// ("I love you" -> "you love me"). The rules below decide from the
// neighbouring words, in a fixed priority order.
// ---------------------------------------------------------------------------

const toSet = (words) => new Set(words.split(" "));

const EN_SIMPLE = new Map([
  ["me", "you"], ["my", "your"], ["mine", "yours"], ["myself", "yourself"],
  ["you're", "I'm"], ["you've", "I've"], ["you'll", "I'll"], ["you'd", "I'd"],
  ["your", "my"], ["yours", "mine"], ["yourself", "myself"],
]);
// First-person forms become second person ("i" -> "you", "i'm" -> "you're").
const EN_FIRST_PERSON = new Map([
  ["i", "you"], ["i'm", "you're"], ["i've", "you've"], ["i'll", "you'll"], ["i'd", "you'd"],
]);

// Verb agreement that changes with the pronoun. Keys are lowercase word sequences.
const EN_PHRASES = new Map([
  ["i were you", ["you", "were", "me"]],
  ["i am", ["you", "are"]], ["you are", ["I", "am"]],
  ["i was", ["you", "were"]], ["you were", ["I", "was"]],
  ["i wasn't", ["you", "weren't"]], ["you weren't", ["I", "wasn't"]],
  ["i were", ["you", "were"]],
  ["am i", ["are", "you"]], ["are you", ["am", "I"]],
  ["aren't you", ["aren't", "I"]], ["am i not", ["are", "you", "not"]],
  ["was i", ["were", "you"]], ["were you", ["was", "I"]],
  ["wasn't i", ["weren't", "you"]], ["weren't you", ["wasn't", "I"]],
]);
const EN_PHRASE_LENGTHS = [3, 2];

const EN_AUXILIARIES = toSet("do does did don't doesn't didn't can can't cannot could couldn't will won't would wouldn't shall should shouldn't may might must have has had haven't hasn't hadn't is isn't");
const EN_PREPOSITIONS = toSet("to at for with about from of without on in into onto by around behind near against toward towards over under through beside besides between among upon within beyond except unlike despite via inside outside across along beneath");
// Words that are a preposition or a conjunction: "after you" vs "after you left".
const EN_AMBIGUOUS_LINKS = toSet("before after until till since than like as");
const EN_CLAUSE_STARTERS = toSet("and but or so because cause if when whenever that why how what whatever where wherever who whom while though although unless whether then once nor yet even");
const EN_THINKING_WORDS = toSet("think thought know knew feel felt guess believe believed hope hoped wish wished bet swear swore say said says mean meant realize realized realise realised remember remembered forget forgot suppose pretend pretended promise promised sure glad sorry afraid scared worried happy sad proud upset angry mad jealous grateful thankful surprised hurt relieved ashamed embarrassed disappointed");
const EN_RELATIVE_NOUNS = toSet("time times way day days moment thing things everything nothing something anything all one reason person place minute second night year years people words life");
const EN_OBJECT_FOLLOWERS = toSet("to too so very more most less again anymore now today tonight tomorrow yesterday here there back away up down out off in on at for with about from of into and or but because cause when if all both alone either enough much well badly forever anyway already like as than either");
const EN_FOLLOWING_DETERMINERS = toSet("i i'm i'd i'll i've me my he she it it's we they him her them us a an the this that these those something everything nothing anything someone everyone nobody anyone somebody everybody some any no your his their our what how why where who");
const EN_SUBJECT_FOLLOWERS = toSet("can could will would should must might may do did don't didn't can't won't wouldn't couldn't shouldn't have had never always just really still also only ever even actually probably clearly obviously simply left said went made took gave got came knew thought felt told broke lied cried");
const EN_TRANSITIVE_VERBS = toSet("love loved hate hated miss missed need needed want wanted trust trusted blame blamed forgive forgave hit tell told ask asked call called leave help helped see saw hear heard like liked kiss kissed hug hugged hold held choose chose keep kept lose lost let make made give gave show showed owe owed understand understood follow followed protect protected fear feared envy adore adored respect respected remind reminded warn warned watch watched betray betrayed abandon abandoned use used deserve deserved get got push pushed hurt");
// "Thank you" / "fuck you" keep their "you": "thank me" would change the meaning.
const EN_FROZEN_BEFORE_YOU = toSet("thank thanks fuck screw bless damn");

const EN_WORD = /[A-Za-z]+(?:'[A-Za-z]+)*/g;
const CLAUSE_BREAK = /[.,!?;:…—–]|\s-\s|"/;
const SENTENCE_BREAK = /[.!?…]/;

function tokenizeEnglish(text) {
  const words = [];
  let lastEnd = 0;
  for (const match of text.matchAll(EN_WORD)) {
    const before = text.slice(lastEnd, match.index);
    words.push({
      text: match[0],
      lower: match[0].toLowerCase(),
      before,
      breakBefore: words.length === 0 || CLAUSE_BREAK.test(before),
      sentenceStart: words.length === 0 || SENTENCE_BREAK.test(before),
    });
    lastEnd = match.index + match[0].length;
  }
  return { words, tail: text.slice(lastEnd) };
}

function isYouSubject(words, index) {
  const word = words[index];
  const previous = word.breakBefore ? null : words[index - 1];
  const beforePrevious = previous && !previous.breakBefore ? words[index - 2] : null;
  const next = words[index + 1] && !words[index + 1].breakBefore ? words[index + 1] : null;
  const prev = previous?.lower;
  const nxt = next?.lower;
  const auxOpensClause = prev && EN_AUXILIARIES.has(prev)
    && (!beforePrevious || EN_CLAUSE_STARTERS.has(beforePrevious.lower));

  if (prev && EN_PREPOSITIONS.has(prev)) return false;
  if (prev && EN_AMBIGUOUS_LINKS.has(prev)) return Boolean(next) && !EN_OBJECT_FOLLOWERS.has(nxt);
  if (!next) return !prev || auxOpensClause;
  if (EN_OBJECT_FOLLOWERS.has(nxt) || EN_FOLLOWING_DETERMINERS.has(nxt)) return false;
  if (nxt.endsWith("ing") || nxt.endsWith("ly")) return false;
  if (/^[A-Z]/.test(next.text)) return false; // a name: "I love you Paul"
  if (!prev || auxOpensClause) return true;
  if (EN_CLAUSE_STARTERS.has(prev) || EN_THINKING_WORDS.has(prev) || EN_RELATIVE_NOUNS.has(prev)) return true;
  if (EN_SUBJECT_FOLLOWERS.has(nxt) || (nxt.endsWith("ed") && nxt.length > 4)) return true;
  if (EN_TRANSITIVE_VERBS.has(prev)) return false;
  return true;
}

// Keeps a capital where the speaker had one (except the always-capital "I").
function matchCase(original, replacement) {
  if (/^I(?:$|')/.test(replacement)) return replacement;
  if (/^[A-Z]/.test(original) && !/^i(?:$|')/i.test(original)) {
    return replacement.charAt(0).toUpperCase() + replacement.slice(1);
  }
  return replacement;
}

export function convertPronounsEN(text) {
  const cleaned = cleanTranscript(text);
  const { words, tail } = tokenizeEnglish(cleaned);
  const output = words.map((word) => word.text);

  for (let index = 0; index < words.length; index += 1) {
    let phrase = null;
    for (const length of EN_PHRASE_LENGTHS) {
      const slice = words.slice(index, index + length);
      if (slice.length < length || slice.slice(1).some((word) => word.breakBefore)) continue;
      const key = slice.map((word) => word.lower).join(" ");
      if (EN_PHRASES.has(key)) {
        phrase = EN_PHRASES.get(key);
        break;
      }
    }
    if (phrase) {
      phrase.forEach((replacement, offset) => {
        output[index + offset] = matchCase(words[index + offset].text, replacement);
      });
      index += phrase.length - 1;
      continue;
    }

    const word = words[index];
    if (word.lower === "you") {
      const previous = word.breakBefore ? null : words[index - 1];
      if (previous && EN_FROZEN_BEFORE_YOU.has(previous.lower)) continue;
      output[index] = isYouSubject(words, index) ? "I" : matchCase(word.text, "me");
      continue;
    }
    const replacement = EN_FIRST_PERSON.get(word.lower) || EN_SIMPLE.get(word.lower);
    if (replacement) output[index] = matchCase(word.text, replacement);
  }

  let result = "";
  words.forEach((word, index) => {
    let piece = output[index];
    if (word.sentenceStart && piece) piece = piece.charAt(0).toUpperCase() + piece.slice(1);
    result += word.before + piece;
  });
  return result + tail;
}

export function convertPronouns(text, lang) {
  return lang === "fr" ? convertPronounsFR(text) : convertPronounsEN(text);
}

export function isLikelyEcho(userText, lastSpokenText) {
  if (!lastSpokenText) return false;

  const spoken = normalizeForMatch(lastSpokenText);
  const heard = normalizeForMatch(userText);
  if (!spoken || !heard) return false;
  if (heard === spoken || heard.includes(spoken) || spoken.includes(heard)) return true;

  const spokenWords = spoken.split(" ");
  const heardWords = heard.split(" ");
  const overlap = heardWords.filter((word) => spokenWords.includes(word)).length;
  return overlap >= Math.max(2, Math.ceil(heardWords.length * 0.7));
}
