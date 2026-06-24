export function normalizeSpokenText(text) {
  return text
    .replace(/\s+/g, " ")
    .replace(/[“”]/g, '"')
    .trim();
}

export function normalizeForMatch(text) {
  return normalizeSpokenText(text)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s']/gu, "")
    .replace(/\s+/g, " ");
}

export function convertPronounsFR(text) {
  let result = text.toLowerCase();

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

export function convertPronounsEN(text) {
  let result = text.toLowerCase();

  const phaseOne = [
    [/\bi am\b/g, "⟦IAM⟧"], [/\byou are\b/g, "⟦YOUARE⟧"],
    [/\bi was\b/g, "⟦IWAS⟧"], [/\byou were\b/g, "⟦YOUWERE⟧"],
    [/\bi have\b/g, "⟦IHAVE⟧"], [/\byou have\b/g, "⟦YOUHAVE⟧"],
    [/\bi had\b/g, "⟦IHAD⟧"], [/\byou had\b/g, "⟦YOUHAD⟧"],
    [/\bi will\b/g, "⟦IWILL⟧"], [/\byou will\b/g, "⟦YOUWILL⟧"],
    [/\bi would\b/g, "⟦IWOULD⟧"], [/\byou would\b/g, "⟦YOUWOULD⟧"],
    [/\bi can\b/g, "⟦ICAN⟧"], [/\byou can\b/g, "⟦YOUCAN⟧"],
    [/\bi could\b/g, "⟦ICOULD⟧"], [/\byou could\b/g, "⟦YOUCOULD⟧"],
    [/\bi don't\b/g, "⟦IDONT⟧"], [/\byou don't\b/g, "⟦YOUDONT⟧"],
    [/\bi didn't\b/g, "⟦IDIDNT⟧"], [/\byou didn't\b/g, "⟦YOUDIDNT⟧"],
    [/\bi can't\b/g, "⟦ICANT⟧"], [/\byou can't\b/g, "⟦YOUCANT⟧"],
    [/\bi won't\b/g, "⟦IWONT⟧"], [/\byou won't\b/g, "⟦YOUWONT⟧"],
    [/\bi'm\b/g, "⟦IM⟧"], [/\byou're\b/g, "⟦YOURE⟧"],
    [/\bi've\b/g, "⟦IVE⟧"], [/\byou've\b/g, "⟦YOUVE⟧"],
    [/\bi'll\b/g, "⟦ILL⟧"], [/\byou'll\b/g, "⟦YOULL⟧"],
    [/\bi'd\b/g, "⟦ID⟧"], [/\byou'd\b/g, "⟦YOUD⟧"],
    [/\bi\b/g, "⟦I⟧"], [/\byou\b/g, "⟦YOU⟧"],
    [/\bme\b/g, "⟦ME⟧"],
    [/\bmy\b/g, "⟦MY⟧"], [/\byour\b/g, "⟦YOUR⟧"],
    [/\bmine\b/g, "⟦MINE⟧"], [/\byours\b/g, "⟦YOURS⟧"],
    [/\bmyself\b/g, "⟦MYSELF⟧"], [/\byourself\b/g, "⟦YOURSELF⟧"],
  ];

  for (const [pattern, placeholder] of phaseOne) {
    result = result.replace(pattern, placeholder);
  }

  const resolve = {
    "⟦IAM⟧": "you are", "⟦YOUARE⟧": "I am",
    "⟦IWAS⟧": "you were", "⟦YOUWERE⟧": "I was",
    "⟦IHAVE⟧": "you have", "⟦YOUHAVE⟧": "I have",
    "⟦IHAD⟧": "you had", "⟦YOUHAD⟧": "I had",
    "⟦IWILL⟧": "you will", "⟦YOUWILL⟧": "I will",
    "⟦IWOULD⟧": "you would", "⟦YOUWOULD⟧": "I would",
    "⟦ICAN⟧": "you can", "⟦YOUCAN⟧": "I can",
    "⟦ICOULD⟧": "you could", "⟦YOUCOULD⟧": "I could",
    "⟦IDONT⟧": "you don't", "⟦YOUDONT⟧": "I don't",
    "⟦IDIDNT⟧": "you didn't", "⟦YOUDIDNT⟧": "I didn't",
    "⟦ICANT⟧": "you can't", "⟦YOUCANT⟧": "I can't",
    "⟦IWONT⟧": "you won't", "⟦YOUWONT⟧": "I won't",
    "⟦IM⟧": "you're", "⟦YOURE⟧": "I'm",
    "⟦IVE⟧": "you've", "⟦YOUVE⟧": "I've",
    "⟦ILL⟧": "you'll", "⟦YOULL⟧": "I'll",
    "⟦ID⟧": "you'd", "⟦YOUD⟧": "I'd",
    "⟦I⟧": "you", "⟦YOU⟧": "I",
    "⟦ME⟧": "you",
    "⟦MY⟧": "your", "⟦YOUR⟧": "my",
    "⟦MINE⟧": "yours", "⟦YOURS⟧": "mine",
    "⟦MYSELF⟧": "yourself", "⟦YOURSELF⟧": "myself",
  };

  for (const [placeholder, value] of Object.entries(resolve)) {
    result = result.split(placeholder).join(value);
  }
  return result.charAt(0).toUpperCase() + result.slice(1);
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
