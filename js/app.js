"use strict";

const dom = {
  langButtons: document.querySelectorAll(".lang-btn"),
  settingsToggle: document.getElementById("settings-toggle"),
  settingsPanel: document.getElementById("settings-panel"),
  title: document.getElementById("title"),
  hint: document.getElementById("hint-text"),
  status: document.getElementById("status"),
  transcript: document.getElementById("transcript-area"),
  micButton: document.getElementById("mic-btn"),
  stopHint: document.getElementById("stop-hint"),
  apiKey: document.getElementById("api-key"),
  voiceSelect: document.getElementById("voice-select"),
  ttsMode: document.getElementById("tts-mode"),
};

const state = {
  lang: "fr",
  isActive: false,
  isSpeaking: false,
  recognition: null,
};

const i18n = {
  fr: {
    title: "Exprime-toi librement",
    hint: "Dis ce que tu ressens. La voix te le répétera.",
    press: "Appuie sur le micro pour commencer",
    listening: "🎙️ Je t'écoute...",
    speaking: "🔊 ...",
    stopped: "Session terminée. Appuie pour recommencer.",
    noMic: "⚠️ Autorise l'accès au micro.",
    noChrome: "⚠️ Utilise Chrome pour la reconnaissance vocale.",
    you: "Toi",
    voice: "Voix",
    stopHint: "Appuie à nouveau pour arrêter",
  },
  en: {
    title: "Express yourself freely",
    hint: "Say what you feel. The voice will repeat it back.",
    press: "Press the mic to start",
    listening: "🎙️ Listening...",
    speaking: "🔊 ...",
    stopped: "Session ended. Press to restart.",
    noMic: "⚠️ Allow microphone access.",
    noChrome: "⚠️ Use Chrome for speech recognition.",
    you: "You",
    voice: "Voice",
    stopHint: "Press again to stop",
  },
};

const storageKeys = {
  apiKey: "elevenlabs_key",
  voice: "elevenlabs_voice",
};

function t(key) {
  return i18n[state.lang][key] || key;
}

function setStatus(message) {
  dom.status.textContent = message;
}

function updateButton() {
  dom.micButton.classList.remove("active", "speaking");
  if (state.isSpeaking) dom.micButton.classList.add("speaking");
  else if (state.isActive) dom.micButton.classList.add("active");
}

function setLang(lang) {
  state.lang = lang;
  dom.langButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.lang === lang);
  });

  dom.title.textContent = t("title");
  dom.hint.textContent = t("hint");
  dom.stopHint.textContent = t("stopHint");
  if (!state.isActive) setStatus(t("press"));

  if (state.recognition) {
    state.recognition.lang = lang === "fr" ? "fr-FR" : "en-US";
  }
}

function addBubble(type, text) {
  const bubble = document.createElement("div");
  bubble.className = `bubble ${type === "user" ? "user-bubble" : "voice-bubble"}`;

  const label = document.createElement("div");
  label.className = "label";
  label.textContent = type === "user" ? t("you") : t("voice");

  const content = document.createElement("div");
  content.textContent = text;

  bubble.appendChild(label);
  bubble.appendChild(content);
  dom.transcript.appendChild(bubble);

  while (dom.transcript.children.length > 20) {
    dom.transcript.removeChild(dom.transcript.firstChild);
  }
  dom.transcript.scrollTop = dom.transcript.scrollHeight;
}

function getApiKey() {
  return dom.apiKey.value.trim();
}

function getVoiceId() {
  return dom.voiceSelect.value;
}

function convertPronounsFR(text) {
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

function convertPronounsEN(text) {
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

function convertPronouns(text) {
  return state.lang === "fr" ? convertPronounsFR(text) : convertPronounsEN(text);
}

async function speakElevenLabs(text) {
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${getVoiceId()}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "xi-api-key": getApiKey(),
    },
    body: JSON.stringify({
      text,
      model_id: "eleven_turbo_v2_5",
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.3,
        use_speaker_boost: true,
      },
    }),
  });

  if (!response.ok) throw new Error(`ElevenLabs error: ${response.status}`);

  const audioBlob = await response.blob();
  const audioUrl = URL.createObjectURL(audioBlob);
  const audio = new Audio(audioUrl);

  return new Promise((resolve, reject) => {
    audio.onended = () => {
      URL.revokeObjectURL(audioUrl);
      resolve();
    };
    audio.onerror = () => {
      URL.revokeObjectURL(audioUrl);
      reject();
    };
    audio.play();
  });
}

function speakBrowser(text) {
  return new Promise((resolve) => {
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = state.lang === "fr" ? "fr-FR" : "en-US";
    utterance.rate = 0.93;
    utterance.pitch = 0.95;

    const langPrefix = state.lang === "fr" ? "fr" : "en";
    const voices = speechSynthesis.getVoices();
    const preferredVoice = voices.find((voice) => (
      voice.lang.startsWith(langPrefix) && !voice.localService
    )) || voices.find((voice) => voice.lang.startsWith(langPrefix));
    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.onend = resolve;
    utterance.onerror = resolve;
    speechSynthesis.speak(utterance);
  });
}

async function speakText(text) {
  state.isSpeaking = true;
  updateButton();
  setStatus(t("speaking"));

  try {
    if (getApiKey()) await speakElevenLabs(text);
    else await speakBrowser(text);
  } catch (error) {
    console.error("TTS error:", error);
    try {
      await speakBrowser(text);
    } catch (fallbackError) {
      console.error("Fallback TTS error:", fallbackError);
    }
  } finally {
    state.isSpeaking = false;
    updateButton();
    if (state.isActive) {
      setStatus(t("listening"));
      restartRecognition();
    }
  }
}

function restartRecognition() {
  if (!state.isActive || !state.recognition) return;
  setTimeout(() => {
    if (!state.isActive || state.isSpeaking || !state.recognition) return;
    try {
      state.recognition.start();
      setStatus(t("listening"));
    } catch {
      // start() can fail if called too quickly after stop()
    }
  }, 200);
}

function toggleSession() {
  if (state.isActive) {
    state.isActive = false;
    if (state.recognition) {
      try {
        state.recognition.stop();
      } catch {
        // no-op
      }
    }
    speechSynthesis.cancel();
    state.isSpeaking = false;
    updateButton();
    setStatus(t("stopped"));
    return;
  }

  state.isActive = true;
  updateButton();
  setStatus(t("listening"));
  if (state.recognition) {
    try {
      state.recognition.start();
    } catch {
      // no-op
    }
  }
}

function updateTtsStatus() {
  if (getApiKey()) {
    dom.ttsMode.innerHTML = '<span class="tts-status ok">✓ ElevenLabs actif</span>';
    dom.settingsToggle.classList.add("has-key");
  } else {
    dom.ttsMode.innerHTML = '<span class="tts-status fallback">Voix navigateur (basique)</span>';
    dom.settingsToggle.classList.remove("has-key");
  }
}

function initSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    setStatus(t("noChrome"));
    dom.micButton.disabled = true;
    return;
  }

  state.recognition = new SpeechRecognition();
  state.recognition.lang = "fr-FR";
  state.recognition.continuous = true;
  state.recognition.interimResults = false;
  state.recognition.maxAlternatives = 1;

  state.recognition.onresult = (event) => {
    const lastIndex = event.results.length - 1;
    const result = event.results[lastIndex];
    if (!result.isFinal) return;

    const userText = result[0].transcript.trim();
    if (!userText) return;

    addBubble("user", userText);
    const converted = convertPronouns(userText);
    addBubble("voice", converted);

    try {
      state.recognition.stop();
    } catch {
      // no-op
    }
    speakText(converted);
  };

  state.recognition.onerror = (event) => {
    if (event.error === "not-allowed") {
      setStatus(t("noMic"));
      state.isActive = false;
      updateButton();
      return;
    }
    if (state.isActive && event.error !== "aborted") {
      restartRecognition();
    }
  };

  state.recognition.onend = () => {
    if (state.isActive && !state.isSpeaking) restartRecognition();
  };
}

function initSettings() {
  const savedKey = localStorage.getItem(storageKeys.apiKey);
  if (savedKey) dom.apiKey.value = savedKey;

  const savedVoice = localStorage.getItem(storageKeys.voice) || "j9jfwdrw7BRfcR43Qohk";
  dom.voiceSelect.value = savedVoice;

  dom.settingsToggle.addEventListener("click", (event) => {
    event.stopPropagation();
    dom.settingsPanel.classList.toggle("open");
  });

  dom.settingsPanel.addEventListener("click", (event) => {
    event.stopPropagation();
  });

  dom.apiKey.addEventListener("change", (event) => {
    localStorage.setItem(storageKeys.apiKey, event.target.value.trim());
    updateTtsStatus();
  });

  dom.voiceSelect.addEventListener("change", (event) => {
    localStorage.setItem(storageKeys.voice, event.target.value);
  });

  document.addEventListener("click", () => {
    dom.settingsPanel.classList.remove("open");
  });

  updateTtsStatus();
}

function initUi() {
  dom.langButtons.forEach((button) => {
    button.addEventListener("click", () => setLang(button.dataset.lang));
  });
  dom.micButton.addEventListener("click", toggleSession);
}

function initVoices() {
  speechSynthesis.onvoiceschanged = () => {
    speechSynthesis.getVoices();
  };
  speechSynthesis.getVoices();
}

function init() {
  initSettings();
  initUi();
  initSpeechRecognition();
  initVoices();
  setLang(state.lang);
}

init();