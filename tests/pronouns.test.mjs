import test from "node:test";
import assert from "node:assert/strict";
import {
  cleanTranscript,
  convertPronounsEN,
  convertPronounsFR,
  isMeaningfulTranscript,
} from "../js/pronouns.js";

// Same phrases as ios/Emerge/EmergeTests/PronounTransformerTests.swift.
const ENGLISH_CASES = [
  ["I love you", "You love me"],
  ["I hate you so much", "You hate me so much"],
  ["I am angry at you", "You are angry at me"],
  ["I’m tired", "You're tired"],
  ["I want you to stay", "You want me to stay"],
  ["Are you there?", "Am I there?"],
  ["Why did you leave me?", "Why did I leave you?"],
  ["You never listen to me.", "I never listen to you."],
  ["I love you and you know it.", "You love me and I know it."],
  ["If I were you", "If you were me"],
  ["I know you love me", "You know I love you"],
  ["I told you I'm sorry", "You told me you're sorry"],
  ["I see you crying", "You see me crying"],
  ["The way you look at me", "The way I look at you"],
  ["I miss you Paul", "You miss me Paul"],
  ["Thank you", "Thank you"],
  ["Fuck you!", "Fuck you!"],
  ["I can't believe you did that", "You can't believe I did that"],
  ["Do you?", "Do I?"],
  ["After you left, I broke.", "After I left, you broke."],
  ["Um, I feel lost, uh", "You feel lost"],
  ["My mother never loved me", "Your mother never loved you"],
  ["I am angry", "You are angry"],
  ["I'm overwhelmed", "You're overwhelmed"],
  ["You are angry", "I am angry"],
  ["You're overwhelmed", "I'm overwhelmed"],
  ["I was scared", "You were scared"],
  ["You would leave", "I would leave"],
  ["This is my fault", "This is your fault"],
  ["I hate myself", "You hate yourself"],
  ["Your anger is yours", "My anger is mine"],
  ["I don't feel safe", "You don't feel safe"],
  ["You can't stay", "I can't stay"],
  ["I made you cry", "You made me cry"],
  ["What would you do without me", "What would I do without you"],
  ["Am I crazy?", "Are you crazy?"],
  ["Me too", "You too"],
  ["I'm so angry, you never listen", "You're so angry, I never listen"],
  ["You hurt me", "I hurt you"],
  ["I trust you completely", "You trust me completely"],
  ["I feel like you hate me", "You feel like I hate you"],
  ["  I’m   so tired.  ", "You're so tired."],
  ["This feels heavy", "This feels heavy"],
];

test("English reflection swaps pronouns with the right case", () => {
  for (const [input, expected] of ENGLISH_CASES) {
    assert.equal(convertPronounsEN(input), expected, `"${input}"`);
  }
});

test("French reflection handles curly apostrophes and core verbs", () => {
  assert.equal(convertPronounsFR("J’ai peur"), "Tu as peur");
  assert.equal(convertPronounsFR("je suis triste"), "Tu es triste");
  assert.equal(convertPronounsFR("je t’en veux"), "Tu m'en veux");
  assert.equal(convertPronounsFR("Euh, je suis perdue"), "Tu es perdue");
});

test("hesitations and dictated punctuation are not repeated", () => {
  for (const input of ["", "...", "um", "Uh.", "hmm hmm", "euh", "full stop", "Period."]) {
    assert.equal(isMeaningfulTranscript(input), false, `"${input}"`);
  }
  for (const input of ["I am angry.", "I have reached a full stop", "Ah!", "Humble me"]) {
    assert.equal(isMeaningfulTranscript(input), true, `"${input}"`);
  }
  assert.equal(cleanTranscript("um, I'm sad, uh"), "I'm sad");
});
