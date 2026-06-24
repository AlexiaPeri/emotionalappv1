"use strict";

import { I18N, STORAGE_KEYS, VOICE_PRESETS } from "./app-config.js";
import { convertPronouns, isLikelyEcho, normalizeForMatch, normalizeSpokenText } from "./pronouns.js";

const dom = {
  langButtons: document.querySelectorAll(".lang-btn"),
  pageButtons: document.querySelectorAll(".page-btn"),
  pages: document.querySelectorAll(".page"),
  settingsToggle: document.getElementById("settings-toggle"),
  settingsPanel: document.getElementById("settings-panel"),
  title: document.getElementById("title"),
  welcome: document.getElementById("welcome-copy"),
  homeStartBtn: document.getElementById("home-start-btn"),
  introTitle: document.getElementById("intro-title"),
  introLead: document.getElementById("intro-lead"),
  introWritten: document.getElementById("intro-written"),
  introContinueButton: document.getElementById("intro-continue-btn"),
  introNote: document.getElementById("intro-note"),
  practiceSetup: document.getElementById("practice-setup"),
  practiceLive: document.getElementById("practice-live"),
  durationPrompt: document.getElementById("duration-prompt"),
  durationRecommendedButton: document.getElementById("duration-recommended-btn"),
  durationRecommendedValue: document.getElementById("duration-recommended-value"),
  durationRecommendedLabel: document.getElementById("duration-recommended-label"),
  durationCustomInput: document.getElementById("duration-custom-input"),
  durationCustomChoice: document.querySelector(".duration-custom"),
  durationCustomLabel: document.getElementById("duration-custom-label"),
  durationError: document.getElementById("duration-error"),
  practiceFocus: document.getElementById("practice-focus"),
  practiceLiveCopy: document.getElementById("practice-live-copy"),
  closingPanel: document.getElementById("closing-panel"),
  closingCopy: document.getElementById("closing-copy"),
  postClosingActions: document.getElementById("post-closing-actions"),
  sessionWriteButton: document.getElementById("session-write-btn"),
  sessionEndButton: document.getElementById("session-end-btn"),
  sessionContinueButton: document.getElementById("session-continue-btn"),
  sessionCloseInline: document.getElementById("session-close-inline"),
  groundKicker: document.getElementById("ground-kicker"),
  groundTitle: document.getElementById("ground-title"),
  groundReturnButton: document.getElementById("ground-return-btn"),
  endMessage: document.getElementById("end-message"),
  status: document.getElementById("status"),
  transcript: document.getElementById("transcript-area"),
  practiceTitle: document.getElementById("practice-title"),
  practiceLead: document.getElementById("practice-lead"),
  practiceBody: document.getElementById("practice-body"),
  practiceKickoff: document.getElementById("practice-kicker"),
  groundButton: document.getElementById("ground-btn"),
  faqList: document.getElementById("faq-list"),
  contactTitle: document.getElementById("contact-title"),
  contactCta: document.getElementById("contact-cta"),
  howTitle: document.getElementById("how-title"),
  howText: document.getElementById("how-text"),
  apiKey: document.getElementById("api-key"),
  voiceSelectFr: document.getElementById("voice-select-fr"),
  voiceSelectEn: document.getElementById("voice-select-en"),
  ttsMode: document.getElementById("tts-mode"),
};

const state = {
  lang: "en",
  isActive: false,
  isSpeaking: false,
  recognition: null,
  speechAvailable: true,
  lastSpokenText: "",
  lastProcessedText: "",
  lastProcessedAt: 0,
  recognitionRestartTimer: null,
  recognitionPauseRequested: false,
  recognitionCycleId: 0,
  recognitionHandledCycleId: -1,
  currentAudio: null,
  introReadComplete: false,
  durationMode: "recommended",
  selectedDurationMinutes: 15,
  sessionPhase: "setup",
  sessionTimerId: null,
  sessionEndsAt: 0,
  audioContext: null,
  closingCancelled: false,
  viewBeforeGround: "practice",
  wasActiveBeforeGround: false,
  view: "home",
};

function t(key) {
  return I18N[state.lang][key] || key;
}

function setStatus(message) {
  dom.status.textContent = message;
}

function getVoiceSelect() {
  return state.lang === "fr" ? dom.voiceSelectFr : dom.voiceSelectEn;
}

function updateButton() {
  if (!dom.micButton) return;
  dom.micButton.classList.remove("active", "speaking");
  const label = document.getElementById("btn-label");
  if (state.isSpeaking) {
    dom.micButton.classList.add("speaking");
    if (label) label.textContent = "…";
  } else if (state.isActive) {
    dom.micButton.classList.add("active");
    if (label) label.textContent = t("sessionInProgress");
  } else {
    if (label) {
      label.textContent = state.view === "practice" ? t("practiceStart") : t("navStart");
    }
  }
}

function renderVoiceOptions(select, presets) {
  if (!select) return;
  select.innerHTML = "";
  presets.forEach((preset) => {
    const option = document.createElement("option");
    option.value = preset.value;
    option.textContent = preset.label;
    select.appendChild(option);
  });
}

function renderFaq() {
  if (!dom.faqList) return;

  dom.faqList.innerHTML = "";
  I18N[state.lang].faqItems.forEach((item, index) => {
    const entry = document.createElement("article");
    entry.className = "faq-item";

    const question = document.createElement("button");
    question.className = "faq-question";
    question.type = "button";
    question.textContent = item.q;
    question.setAttribute("aria-expanded", "false");
    const answerId = `faq-answer-${index}`;
    question.setAttribute("aria-controls", answerId);

    const answer = document.createElement("div");
    answer.className = "faq-answer";
    answer.id = answerId;
    answer.textContent = item.a;

    question.addEventListener("click", () => {
      const open = entry.classList.toggle("open");
      question.setAttribute("aria-expanded", String(open));
    });

    entry.appendChild(question);
    entry.appendChild(answer);
    dom.faqList.appendChild(entry);
  });
}

function renderIntro() {
  if (!dom.introWritten) return;
  dom.introWritten.innerHTML = "";
  t("introReadText").forEach((paragraph) => {
    const node = document.createElement("p");
    node.textContent = paragraph;
    dom.introWritten.appendChild(node);
  });
  requestAnimationFrame(() => {
    if (
      state.view === "intro" &&
      dom.introWritten.clientHeight > 0 &&
      dom.introWritten.scrollHeight <= dom.introWritten.clientHeight + 8
    ) {
      state.introReadComplete = true;
    }
    updateIntroCompletion();
  });
}

function canContinueIntro() {
  if (hasSeenIntro()) return true;
  return state.introReadComplete;
}

function getIntroProgressText() {
  if (hasSeenIntro()) return t("introReviewReady");
  if (canContinueIntro()) return t("introReady");
  return t("introRequirementRead");
}

function updateIntroCompletion() {
  if (dom.introContinueButton) {
    const unlocked = canContinueIntro();
    dom.introContinueButton.disabled = !unlocked;
    dom.introContinueButton.setAttribute("aria-disabled", String(!unlocked));
    dom.introContinueButton.classList.toggle("is-disabled", !unlocked);
  }
  if (dom.introNote) {
    dom.introNote.textContent = getIntroProgressText();
  }
  if (dom.introWritten) {
    dom.introWritten.classList.toggle("is-complete", state.introReadComplete);
  }
}

function updatePageCopy() {
  const navLabels = {
    practice: t("navStart"),
    intro: t("navGuide"),
    faq: t("navFaq"),
  };
  dom.pageButtons.forEach((button) => {
    if (navLabels[button.dataset.view]) {
      button.textContent = navLabels[button.dataset.view];
    }
  });
  if (dom.homeStartBtn) dom.homeStartBtn.textContent = t("homeCta");
  if (dom.introTitle) dom.introTitle.textContent = t("introTitle");
  if (dom.introLead) dom.introLead.textContent = t("introLead");
  if (dom.introContinueButton) dom.introContinueButton.textContent = hasSeenIntro() ? t("practiceStart") : t("introContinueCta");
  if (dom.introNote) dom.introNote.textContent = t("introNote");
  if (dom.durationPrompt) dom.durationPrompt.textContent = t("durationPrompt");
  if (dom.durationRecommendedValue) dom.durationRecommendedValue.textContent = t("durationRecommendedValue");
  if (dom.durationRecommendedLabel) dom.durationRecommendedLabel.textContent = t("durationRecommendedLabel");
  if (dom.durationCustomLabel) dom.durationCustomLabel.textContent = t("durationCustomLabel");
  if (dom.practiceLiveCopy) dom.practiceLiveCopy.textContent = t("practiceLiveCopy");
  if (dom.closingCopy) dom.closingCopy.textContent = t("closingCopy");
  if (dom.practiceKickoff) dom.practiceKickoff.textContent = t("practiceTitle");
  if (dom.practiceTitle) dom.practiceTitle.textContent = t("practiceTitle");
  if (dom.practiceLead) dom.practiceLead.textContent = t("practiceLead");
  if (dom.practiceBody) dom.practiceBody.textContent = t("practiceBody");
  if (dom.groundButton) dom.groundButton.textContent = t("groundCta");
  if (dom.sessionContinueButton) dom.sessionContinueButton.textContent = t("sessionContinuePracticeCta");
  if (dom.sessionCloseInline) dom.sessionCloseInline.textContent = t("sessionClosePracticeCta");
  if (dom.sessionWriteButton) dom.sessionWriteButton.textContent = t("sessionWriteCta");
  if (dom.sessionEndButton) dom.sessionEndButton.textContent = t("sessionEndCta");
  if (dom.groundKicker) dom.groundKicker.textContent = t("groundCta");
  if (dom.groundTitle) dom.groundTitle.textContent = t("groundTitle");
  if (dom.groundReturnButton) dom.groundReturnButton.textContent = t("groundReturnCta");
  if (dom.endMessage) dom.endMessage.textContent = t("endMessage");
  if (dom.contactTitle) dom.contactTitle.textContent = t("contactTitle");
  if (dom.contactCta) dom.contactCta.textContent = t("contactCta");
  if (dom.howTitle) dom.howTitle.textContent = t("howTitle");
  if (dom.howText) dom.howText.innerHTML = t("howText");
  updateDurationControls();
  renderIntro();
  renderFaq();
}

function setView(view) {
  state.view = view;
  document.body.dataset.view = view;
  dom.pageButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.view === view);
  });
  dom.pages.forEach((page) => {
    const active = page.dataset.view === view;
    page.hidden = !active;
    page.classList.toggle("is-active", active);
  });

  if (state.isActive && view !== "practice" && view !== "ground") {
    stopSession();
  }

  if (view === "practice") {
    setStatus(state.isActive ? t("listening") : t("press"));
  } else if (view === "intro") {
    renderIntro();
    updateIntroCompletion();
    setStatus(t("press"));
  } else if (!state.isActive) {
    setStatus(t("press"));
  }
}

function setLang(lang) {
  state.lang = lang;
  document.documentElement.lang = lang;
  dom.langButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.lang === lang);
  });

  dom.title.textContent = t("title");
  if (dom.welcome) {
    dom.welcome.innerHTML = t("welcome").replace(/\n/g, "<br>");
  }
  if (!state.isActive) setStatus(t("press"));
  updatePageCopy();

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

function hasSeenIntro() {
  return localStorage.getItem(STORAGE_KEYS.introSeen) === "true";
}

function markIntroSeen() {
  localStorage.setItem(STORAGE_KEYS.introSeen, "true");
}

function enterFromHome() {
  setView(hasSeenIntro() ? "practice" : "intro");
}

function getApiKey() {
  return dom.apiKey.value.trim();
}

function getVoiceId() {
  return getVoiceSelect().value;
}

function buildElevenLabsUrl() {
  const url = new URL(`https://api.elevenlabs.io/v1/text-to-speech/${getVoiceId()}`);
  url.searchParams.set("output_format", "mp3_22050_32");
  url.searchParams.set("optimize_streaming_latency", "4");
  return url.toString();
}

function buildVoiceSettings(text) {
  const density = Math.min(text.length / 240, 1);
  return {
    stability: 0.38 + density * 0.08,
    similarity_boost: 0.84,
    style: 0.22 + density * 0.18,
    use_speaker_boost: true,
  };
}

function formatSessionTime(ms) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function getSelectedDurationMinutes() {
  if (state.durationMode === "recommended") return 15;
  const value = Number(dom.durationCustomInput?.value);
  if (!Number.isFinite(value) || value < 12 || value > 60) return null;
  return value;
}

function updateDurationControls(showError = false) {
  const duration = getSelectedDurationMinutes();
  const isCustom = state.durationMode === "custom";
  const hasInvalidCustom = isCustom && duration === null;

  dom.durationRecommendedButton?.classList.toggle("is-selected", !isCustom);
  dom.durationCustomInput?.closest(".duration-choice")?.classList.toggle("is-selected", isCustom);

  if (dom.durationError) {
    dom.durationError.textContent = showError && hasInvalidCustom ? t("durationError") : "";
  }
}

function setDurationMode(mode) {
  state.durationMode = mode;
  updateDurationControls();
}

function updateSessionTimer() {
  if (!dom.sessionTimer) return;
  if (state.sessionPhase === "open") {
    dom.sessionTimer.textContent = t("sessionOpenTimer");
    return;
  }
  if (state.sessionPhase === "complete") {
    dom.sessionTimer.textContent = t("sessionCompleteTimer");
    return;
  }
  dom.sessionTimer.textContent = formatSessionTime(state.sessionEndsAt - Date.now());
}

function clearSessionTimer() {
  if (state.sessionTimerId) {
    clearInterval(state.sessionTimerId);
    state.sessionTimerId = null;
  }
  state.sessionEndsAt = 0;
}

function playSessionChime() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  if (!state.audioContext) state.audioContext = new AudioContext();
  const context = state.audioContext;
  context.resume?.();

  [660, 880].forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const start = context.currentTime + index * 0.16;
    oscillator.frequency.value = frequency;
    oscillator.type = "sine";
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.08, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.22);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(start);
    oscillator.stop(start + 0.24);
  });
}

function showPracticeSetup(message = "") {
  state.sessionPhase = "setup";
  clearSessionTimer();
  if (dom.practiceSetup) dom.practiceSetup.hidden = false;
  if (dom.practiceLive) dom.practiceLive.hidden = true;
  if (dom.closingPanel) dom.closingPanel.hidden = true;
  if (dom.postClosingActions) dom.postClosingActions.hidden = true;
  if (dom.sessionCloseInline) dom.sessionCloseInline.hidden = true;
  if (dom.practiceFocus) dom.practiceFocus.hidden = false;
  if (dom.groundButton) dom.groundButton.hidden = true;
  document.body.classList.remove("session-active", "session-complete", "session-open");
  updateDurationControls();
  if (dom.durationError) dom.durationError.textContent = message;
  updateButton();
}

function showPracticeLive() {
  if (dom.practiceSetup) dom.practiceSetup.hidden = true;
  if (dom.practiceLive) dom.practiceLive.hidden = false;
  if (dom.practiceFocus) dom.practiceFocus.hidden = false;
  if (dom.closingPanel) dom.closingPanel.hidden = true;
  if (dom.postClosingActions) dom.postClosingActions.hidden = true;
  if (dom.sessionCloseInline) dom.sessionCloseInline.hidden = true;
  if (dom.groundButton) dom.groundButton.hidden = false;
}

function stopSpeechPlayback() {
  speechSynthesis.cancel();
  if (state.currentAudio) {
    try {
      state.currentAudio.pause();
      state.currentAudio.currentTime = 0;
    } catch {
      // no-op
    }
    state.currentAudio = null;
  }
}

function getModelId() {
  return state.lang === "fr" ? "eleven_multilingual_v2" : "eleven_turbo_v2_5";
}

function scheduleRecognitionRestart(delay = 120) {
  if (!state.isActive || !state.recognition) return;
  if (state.recognitionRestartTimer) clearTimeout(state.recognitionRestartTimer);
  state.recognitionRestartTimer = setTimeout(() => {
    state.recognitionRestartTimer = null;
    state.recognitionPauseRequested = false;
    startRecognition();
  }, delay);
}

function startRecognition() {
  if (!state.isActive || state.isSpeaking || !state.recognition) return;
  if (state.recognitionRestartTimer) {
    clearTimeout(state.recognitionRestartTimer);
    state.recognitionRestartTimer = null;
  }
  try {
    state.recognitionCycleId += 1;
    state.recognition.start();
    setStatus(t("listening"));
  } catch {
    scheduleRecognitionRestart(220);
  }
}

function pauseRecognitionForTts() {
  if (!state.isActive || !state.recognition) return;
  state.recognitionPauseRequested = true;
  try {
    state.recognition.abort();
  } catch {
    // no-op
  }
}

function playStreamingAudio(response) {
  return new Promise((resolve, reject) => {
    const mediaSource = new MediaSource();
    const audioUrl = URL.createObjectURL(mediaSource);
    const audio = new Audio();
    state.currentAudio = audio;
    audio.preload = "auto";
    audio.src = audioUrl;

    let sourceBuffer = null;
    let reader = null;
    const pendingChunks = [];
    let streamFinished = false;
    let playbackStarted = false;
    let settled = false;

    const cleanup = () => {
      if (settled) return;
      settled = true;
      if (state.currentAudio === audio) state.currentAudio = null;
      URL.revokeObjectURL(audioUrl);
    };

    const fail = (error) => {
      cleanup();
      reject(error);
    };

    const flushQueue = () => {
      if (!sourceBuffer || sourceBuffer.updating) return;
      if (pendingChunks.length > 0) {
        try {
          sourceBuffer.appendBuffer(pendingChunks.shift());
          playbackStarted = true;
        } catch (error) {
          fail(error);
        }
        return;
      }

      if (streamFinished && mediaSource.readyState === "open") {
        try {
          mediaSource.endOfStream();
        } catch {
          // no-op
        }
      }
    };

    audio.onended = () => {
      cleanup();
      resolve();
    };
    audio.onerror = () => {
      fail(new Error("Streaming audio playback failed"));
    };

    mediaSource.addEventListener("sourceopen", () => {
      try {
        sourceBuffer = mediaSource.addSourceBuffer("audio/mpeg");
        sourceBuffer.mode = "sequence";
        sourceBuffer.addEventListener("updateend", flushQueue);
      } catch (error) {
        fail(error);
        return;
      }

      reader = response.body.getReader();

      const pump = () => reader.read().then(({ value, done }) => {
        if (done) {
          streamFinished = true;
          flushQueue();
          if (!playbackStarted && mediaSource.readyState === "open") {
            try {
              mediaSource.endOfStream();
            } catch {
              // no-op
            }
          }
          return;
        }

        if (value && value.byteLength) {
          pendingChunks.push(value);
          flushQueue();
        }

        return pump();
      }).catch(fail);

      pump();
    }, { once: true });

    audio.play().catch(() => {
      // Browsers may defer playback until data is ready.
    });
  });
}

async function speakElevenLabs(text) {
  const spokenText = normalizeSpokenText(text);
  const response = await fetch(
    buildElevenLabsUrl(),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": getApiKey(),
      },
      body: JSON.stringify({
        text: spokenText,
        model_id: getModelId(),
        language_code: state.lang === "fr" ? "fr" : "en",
        voice_settings: buildVoiceSettings(spokenText),
        previous_text: state.lastSpokenText || undefined,
      }),
    }
  );

  if (!response.ok) throw new Error(`ElevenLabs error: ${response.status}`);

  if (response.body && window.MediaSource && MediaSource.isTypeSupported("audio/mpeg")) {
    await playStreamingAudio(response);
    state.lastSpokenText = spokenText;
    return;
  }

  const audioBlob = await response.blob();
  const audioUrl = URL.createObjectURL(audioBlob);
  const audio = new Audio(audioUrl);
  audio.preload = "auto";
  state.currentAudio = audio;

  return new Promise((resolve, reject) => {
    audio.onended = () => {
      URL.revokeObjectURL(audioUrl);
      if (state.currentAudio === audio) state.currentAudio = null;
      state.lastSpokenText = spokenText;
      resolve();
    };
    audio.onerror = () => {
      URL.revokeObjectURL(audioUrl);
      if (state.currentAudio === audio) state.currentAudio = null;
      reject();
    };
    audio.play().catch(reject);
  });
}

function speakBrowser(text) {
  return new Promise((resolve) => {
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = state.lang === "fr" ? "fr-FR" : "en-US";
    utterance.rate = 0.98;
    utterance.pitch = 1.0;
    utterance.volume = 1;

    const langPrefix = state.lang === "fr" ? "fr" : "en";
    const preferredNames = state.lang === "en"
      ? ["alex", "daniel", "fred", "google uk english male", "microsoft david", "thomas"]
      : ["thomas", "alex", "antoine", "google français", "google french"];
    const voices = speechSynthesis.getVoices();
    const preferredVoice = voices.find((voice) => (
      preferredNames.some((name) => voice.name?.toLowerCase().includes(name))
    )) || voices.find((voice) => voice.lang.startsWith(langPrefix) && !voice.localService) || voices.find((voice) => voice.lang.startsWith(langPrefix));
    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.onend = () => {
      state.lastSpokenText = normalizeSpokenText(text);
      resolve();
    };
    utterance.onerror = resolve;
    speechSynthesis.speak(utterance);
  });
}

async function speakText(text, statusMessage = null) {
  stopSpeechPlayback();
  state.isSpeaking = true;
  updateButton();
  updatePageCopy();
  setStatus(statusMessage || t("speaking"));

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
    updatePageCopy();
    if (state.isActive) {
      scheduleRecognitionRestart(130);
    }
  }
}

function stopVoiceCapture() {
  state.isActive = false;
  if (state.recognition) {
    try {
      state.recognition.abort();
    } catch {
      // no-op
    }
  }
  stopSpeechPlayback();
  state.isSpeaking = false;
  document.body.classList.remove("session-active");
  state.lastSpokenText = "";
  state.recognitionPauseRequested = false;
  state.recognitionCycleId = 0;
  state.recognitionHandledCycleId = -1;
  if (state.recognitionRestartTimer) {
    clearTimeout(state.recognitionRestartTimer);
    state.recognitionRestartTimer = null;
  }
  updateButton();
}

function stopSession() {
  clearSessionTimer();
  stopVoiceCapture();
  showPracticeSetup();
}

function startVoiceCapture() {
  if (state.view !== "practice") {
    setView("practice");
  }
  state.isActive = true;
  document.body.classList.add("session-active");
  state.lastSpokenText = "";
  state.lastProcessedText = "";
  state.lastProcessedAt = 0;
  state.recognitionPauseRequested = false;
  state.recognitionCycleId = 0;
  state.recognitionHandledCycleId = -1;
  updateButton();
  setStatus(t("listening"));
  if (state.recognition) {
    startRecognition();
  }
}

function startTimedSession() {
  if (!state.speechAvailable) {
    setStatus(t("noChrome"));
    return;
  }
  if (state.isActive || state.sessionPhase === "timed" || state.sessionPhase === "open") return;

  const duration = getSelectedDurationMinutes();
  if (duration === null) {
    updateDurationControls(true);
    return;
  }

  state.selectedDurationMinutes = duration;
  state.sessionPhase = "timed";
  state.sessionEndsAt = Date.now() + duration * 60 * 1000;
  document.body.classList.add("session-active");
  document.body.classList.remove("session-complete", "session-open", "session-closing");
  showPracticeLive();
  if (dom.sessionCloseInline) dom.sessionCloseInline.hidden = true;
  if (dom.transcript) dom.transcript.innerHTML = "";
  startVoiceCapture();

  state.sessionTimerId = setInterval(() => {
    if (Date.now() >= state.sessionEndsAt) {
      finishTimedSession();
    }
  }, 1000);
}

function finishTimedSession() {
  if (state.sessionPhase !== "timed") return;
  clearSessionTimer();
  state.sessionPhase = "complete";
  document.body.classList.remove("session-active", "session-open");
  document.body.classList.add("session-complete");
  stopVoiceCapture();
  playSessionChime();
  beginClosingGuidance();
}

async function beginClosingGuidance() {
  if (state.view !== "practice") {
    state.wasActiveBeforeGround = false;
    state.viewBeforeGround = "practice";
    setView("practice");
  }
  state.sessionPhase = "closing";
  state.closingCancelled = false;
  document.body.classList.add("session-closing");
  if (dom.practiceFocus) dom.practiceFocus.hidden = true;
  if (dom.groundButton) dom.groundButton.hidden = true;
  if (dom.closingPanel) dom.closingPanel.hidden = false;
  if (dom.postClosingActions) dom.postClosingActions.hidden = true;
  if (dom.sessionCloseInline) dom.sessionCloseInline.hidden = true;
  setStatus(t("closingStatus"));
  await speakText(t("closingAudioText"), t("closingStatus"));
  if (state.closingCancelled || state.sessionPhase !== "closing") return;
  showPostClosingActions();
}

function showPostClosingActions() {
  state.sessionPhase = "postClosing";
  document.body.classList.remove("session-closing", "session-active", "session-open");
  if (dom.closingPanel) dom.closingPanel.hidden = true;
  if (dom.postClosingActions) dom.postClosingActions.hidden = false;
  if (dom.groundButton) dom.groundButton.hidden = true;
  setStatus(t("postClosingStatus"));
}

function continueSession() {
  if (state.sessionPhase !== "closing") return;
  state.closingCancelled = true;
  stopSpeechPlayback();
  state.isSpeaking = false;
  state.sessionPhase = "open";
  document.body.classList.remove("session-complete", "session-closing");
  document.body.classList.add("session-active", "session-open");
  if (dom.closingPanel) dom.closingPanel.hidden = true;
  if (dom.practiceFocus) dom.practiceFocus.hidden = false;
  if (dom.groundButton) dom.groundButton.hidden = false;
  if (dom.sessionCloseInline) dom.sessionCloseInline.hidden = false;
  startVoiceCapture();
}

function closeSession() {
  clearSessionTimer();
  stopVoiceCapture();
  beginClosingGuidance();
}

function endSession() {
  clearSessionTimer();
  stopVoiceCapture();
  setView("end");
}

function handleWritePlaceholder() {
  setStatus(t("writePlaceholderStatus"));
}

async function triggerGrounding() {
  state.viewBeforeGround = state.view;
  state.wasActiveBeforeGround = state.isActive;
  if (state.isActive) {
    pauseRecognitionForTts();
    state.isActive = false;
  }
  setView("ground");
  setStatus(t("groundStatus"));
  await speakText(t("groundText"), t("groundStatus"));
}

function returnFromGround() {
  setView(state.viewBeforeGround || "practice");
  if (state.wasActiveBeforeGround && (state.sessionPhase === "timed" || state.sessionPhase === "open")) {
    state.isActive = true;
    document.body.classList.add("session-active");
    scheduleRecognitionRestart(150);
    setStatus(t("listening"));
  }
  state.wasActiveBeforeGround = false;
}

function continueFromIntro() {
  if (!canContinueIntro()) {
    updateIntroCompletion();
    return;
  }
  stopSpeechPlayback();
  state.isSpeaking = false;
  markIntroSeen();
  setView("practice");
}

function handleIntroScroll() {
  if (!dom.introWritten) return;
  const atEnd = dom.introWritten.scrollTop + dom.introWritten.clientHeight >= dom.introWritten.scrollHeight - 8;
  if (atEnd) {
    state.introReadComplete = true;
    updateIntroCompletion();
  }
}

function updateTtsStatus() {
  const frVoice = dom.voiceSelectFr?.selectedOptions?.[0]?.textContent || "FR";
  const enVoice = dom.voiceSelectEn?.selectedOptions?.[0]?.textContent || "EN";
  const voiceSummary = `FR: ${frVoice} · EN: ${enVoice}`;
  const fallbackNote = '<div class="tts-status-voices">Browser voice active. Voice picks only apply with ElevenLabs.</div>';

  if (getApiKey()) {
    dom.ttsMode.innerHTML = `<span class="tts-status ok">✓ ElevenLabs actif</span><div class="tts-status-voices">${voiceSummary}</div>`;
    dom.settingsToggle.classList.add("has-key");
  } else {
    dom.ttsMode.innerHTML = `<span class="tts-status fallback">Voix navigateur (basique)</span><div class="tts-status-voices">${voiceSummary}</div>${fallbackNote}`;
    dom.settingsToggle.classList.remove("has-key");
  }
}

function initSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    state.speechAvailable = false;
    setStatus(t("noChrome"));
    return;
  }

  state.speechAvailable = true;

  state.recognition = new SpeechRecognition();
  state.recognition.lang = "fr-FR";
  state.recognition.continuous = false;
  state.recognition.interimResults = false;
  state.recognition.maxAlternatives = 3;

  state.recognition.onresult = (event) => {
    if (state.isSpeaking || state.recognitionPauseRequested) return;
    if (state.recognitionHandledCycleId === state.recognitionCycleId) return;

    const resultIndex = typeof event.resultIndex === "number" ? event.resultIndex : event.results.length - 1;
    let result = null;
    for (let index = resultIndex; index < event.results.length; index += 1) {
      if (event.results[index].isFinal) {
        result = event.results[index];
      }
    }
    if (!result) return;

    const alternatives = Array.from(result);
    const bestAlternative = alternatives.reduce((best, candidate) => (
      (candidate.confidence || 0) > (best.confidence || 0) ? candidate : best
    ), alternatives[0]);

    const userText = bestAlternative?.transcript?.trim() || result[0].transcript.trim();
    if (!userText) return;

    const normalizedUserText = normalizeForMatch(userText);
    const now = Date.now();
    if (
      normalizedUserText &&
      normalizedUserText === state.lastProcessedText &&
      now - state.lastProcessedAt < 1800
    ) {
      scheduleRecognitionRestart(140);
      return;
    }
    if (isLikelyEcho(userText)) {
      scheduleRecognitionRestart(180);
      return;
    }

    state.lastProcessedText = normalizedUserText;
    state.lastProcessedAt = now;
    state.recognitionHandledCycleId = state.recognitionCycleId;

    addBubble("user", userText);
    const converted = convertPronouns(userText, state.lang);
    addBubble("voice", converted);

    pauseRecognitionForTts();
    speakText(converted);
  };

  state.recognition.onerror = (event) => {
    if (event.error === "not-allowed") {
      setStatus(t("noMic"));
      state.isActive = false;
      document.body.classList.remove("session-active");
      updateButton();
      return;
    }
    if (state.isActive && event.error !== "aborted" && !state.recognitionPauseRequested) {
      scheduleRecognitionRestart(220);
    }
  };

  state.recognition.onend = () => {
    if (state.isActive && !state.isSpeaking) {
      if (state.recognitionPauseRequested) return;
      scheduleRecognitionRestart(120);
    }
  };
}

function initSettings() {
  const savedKey = localStorage.getItem(STORAGE_KEYS.apiKey);
  if (savedKey) dom.apiKey.value = savedKey;

  renderVoiceOptions(dom.voiceSelectFr, VOICE_PRESETS.fr);
  renderVoiceOptions(dom.voiceSelectEn, VOICE_PRESETS.en);

  const savedVoiceFr = localStorage.getItem(STORAGE_KEYS.voiceFr) || VOICE_PRESETS.fr[0].value;
  const savedVoiceEn = localStorage.getItem(STORAGE_KEYS.voiceEn) || VOICE_PRESETS.en[0].value;
  dom.voiceSelectFr.value = savedVoiceFr;
  dom.voiceSelectEn.value = savedVoiceEn;

  dom.settingsToggle.addEventListener("click", (event) => {
    event.stopPropagation();
    dom.settingsPanel.classList.toggle("open");
  });

  dom.settingsPanel.addEventListener("click", (event) => {
    event.stopPropagation();
  });

  dom.apiKey.addEventListener("change", (event) => {
    localStorage.setItem(STORAGE_KEYS.apiKey, event.target.value.trim());
    updateTtsStatus();
  });

  dom.voiceSelectFr.addEventListener("change", (event) => {
    localStorage.setItem(STORAGE_KEYS.voiceFr, event.target.value);
    updateTtsStatus();
  });

  dom.voiceSelectEn.addEventListener("change", (event) => {
    localStorage.setItem(STORAGE_KEYS.voiceEn, event.target.value);
    updateTtsStatus();
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
  dom.pageButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.view === "practice" && !hasSeenIntro()) {
        setView("intro");
        return;
      }
      setView(button.dataset.view);
    });
  });
  if (dom.homeStartBtn) {
    dom.homeStartBtn.addEventListener("click", enterFromHome);
  }
  if (dom.introContinueButton) {
    dom.introContinueButton.addEventListener("click", continueFromIntro);
  }
  if (dom.introWritten) {
    dom.introWritten.addEventListener("scroll", handleIntroScroll);
  }
  if (dom.durationRecommendedButton) {
    dom.durationRecommendedButton.addEventListener("click", () => {
      setDurationMode("recommended");
      startTimedSession();
    });
  }
  if (dom.durationCustomInput) {
    dom.durationCustomInput.addEventListener("focus", () => setDurationMode("custom"));
    dom.durationCustomInput.addEventListener("input", () => {
      state.durationMode = "custom";
      updateDurationControls(true);
    });
    dom.durationCustomInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        state.durationMode = "custom";
        startTimedSession();
      }
    });
  }
  if (dom.durationCustomChoice) {
    dom.durationCustomChoice.addEventListener("click", (event) => {
      if (event.target === dom.durationCustomInput) return;
      state.durationMode = "custom";
      if (getSelectedDurationMinutes() === null) {
        dom.durationCustomInput?.focus();
        updateDurationControls(true);
        return;
      }
      startTimedSession();
    });
  }
  if (dom.groundButton) {
    dom.groundButton.addEventListener("click", triggerGrounding);
  }
  if (dom.sessionContinueButton) {
    dom.sessionContinueButton.addEventListener("click", continueSession);
  }
  if (dom.sessionCloseInline) {
    dom.sessionCloseInline.addEventListener("click", closeSession);
  }
  if (dom.sessionWriteButton) {
    dom.sessionWriteButton.addEventListener("click", handleWritePlaceholder);
  }
  if (dom.sessionEndButton) {
    dom.sessionEndButton.addEventListener("click", endSession);
  }
  if (dom.groundReturnButton) {
    dom.groundReturnButton.addEventListener("click", returnFromGround);
  }
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
  updatePageCopy();
  setView("home");
  setLang(state.lang);
}

init();
