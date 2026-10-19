"use strict";

import { I18N, STORAGE_KEYS } from "./app-config.js";
import { convertPronouns, isLikelyEcho, normalizeForMatch, normalizeSpokenText } from "./pronouns.js";

const dom = {
  langButtons: document.querySelectorAll(".lang-btn"),
  pageButtons: document.querySelectorAll(".page-btn"),
  pages: document.querySelectorAll(".page"),
  settingsToggle: document.getElementById("settings-toggle"),
  settingsPanel: document.getElementById("settings-panel"),
  firstWelcome: document.getElementById("first-welcome"),
  firstGuidePrompt: document.getElementById("first-guide-prompt"),
  firstGuideButton: document.getElementById("first-guide-btn"),
  title: document.getElementById("title"),
  welcome: document.getElementById("welcome-copy"),
  homeStartBtn: document.getElementById("home-start-btn"),
  introTitle: document.getElementById("intro-title"),
  introWritten: document.getElementById("intro-written"),
  introReturnButton: document.getElementById("intro-return-btn"),
  practiceSetup: document.getElementById("practice-setup"),
  practiceLive: document.getElementById("practice-live"),
  durationPrompt: document.getElementById("duration-prompt"),
  setupSubtitle: document.getElementById("setup-subtitle"),
  durationSectionLabel: document.getElementById("duration-section-label"),
  durationRecommendedButton: document.getElementById("duration-recommended-btn"),
  durationRecommendedValue: document.getElementById("duration-recommended-value"),
  durationRecommendedLabel: document.getElementById("duration-recommended-label"),
  durationTestButton: document.getElementById("duration-test-btn"),
  durationTestValue: document.getElementById("duration-test-value"),
  durationTestLabel: document.getElementById("duration-test-label"),
  durationCustomInput: document.getElementById("duration-custom-input"),
  durationCustomChoice: document.querySelector(".duration-custom"),
  durationCustomLabel: document.getElementById("duration-custom-label"),
  durationCustomDetail: document.getElementById("duration-custom-detail"),
  customDurationModal: document.getElementById("custom-duration-modal"),
  customDurationTitle: document.getElementById("custom-duration-title"),
  customDurationRange: document.getElementById("custom-duration-range"),
  customDurationCancel: document.getElementById("custom-duration-cancel"),
  customDurationDone: document.getElementById("custom-duration-done"),
  openingSectionLabel: document.getElementById("opening-section-label"),
  openingChoices: document.querySelectorAll(".opening-choice"),
  openingQuietTitle: document.getElementById("opening-quiet-title"),
  openingQuietDetail: document.getElementById("opening-quiet-detail"),
  openingGuidedTitle: document.getElementById("opening-guided-title"),
  openingGuidedDetail: document.getElementById("opening-guided-detail"),
  openingFullTitle: document.getElementById("opening-full-title"),
  openingFullDetail: document.getElementById("opening-full-detail"),
  voiceSectionLabel: document.getElementById("voice-section-label"),
  voiceChoices: document.querySelectorAll(".practice-voice-choice"),
  voiceFemaleTitle: document.getElementById("voice-female-title"),
  voiceMaleTitle: document.getElementById("voice-male-title"),
  movementRemindersInput: document.getElementById("movement-reminders-input"),
  movementRemindersTitle: document.getElementById("movement-reminders-title"),
  movementRemindersDetail: document.getElementById("movement-reminders-detail"),
  durationError: document.getElementById("duration-error"),
  practiceBeginButton: document.getElementById("practice-begin-btn"),
  openingStage: document.getElementById("opening-stage"),
  openingStageTitle: document.getElementById("opening-stage-title"),
  openingGuidanceStatus: document.getElementById("opening-guidance-status"),
  openingGuidanceLabel: document.getElementById("opening-guidance-label"),
  openingMissingPanel: document.getElementById("opening-missing-panel"),
  openingMissingTitle: document.getElementById("opening-missing-title"),
  openingMissingCopy: document.getElementById("opening-missing-copy"),
  openingSkipButton: document.getElementById("opening-skip-btn"),
  openingBeginButton: document.getElementById("opening-begin-btn"),
  practiceFocus: document.getElementById("practice-focus"),
  practiceLiveCopy: document.getElementById("practice-live-copy"),
  closingPanel: document.getElementById("closing-panel"),
  closingCopy: document.getElementById("closing-copy"),
  closingGuidanceStatus: document.getElementById("closing-guidance-status"),
  closingGuidanceLabel: document.getElementById("closing-guidance-label"),
  postClosingActions: document.getElementById("post-closing-actions"),
  postClosingCopy: document.getElementById("post-closing-copy"),
  sessionWriteButton: document.getElementById("session-write-btn"),
  sessionWriteLabel: document.getElementById("session-write-label"),
  sessionEndButton: document.getElementById("session-end-btn"),
  sessionContinueButton: document.getElementById("session-continue-btn"),
  sessionFinishButton: document.getElementById("session-finish-btn"),
  practiceSupportActions: document.getElementById("practice-support-actions"),
  practiceRemindButton: document.getElementById("practice-remind-btn"),
  practiceCompleteButton: document.getElementById("practice-complete-btn"),
  groundKicker: document.getElementById("ground-kicker"),
  groundTitle: document.getElementById("ground-title"),
  groundGuidanceIndicator: document.getElementById("ground-guidance-indicator"),
  groundGuidanceLabel: document.getElementById("ground-guidance-label"),
  groundEndGuidanceButton: document.getElementById("ground-end-guidance-btn"),
  groundActions: document.getElementById("ground-actions"),
  groundBetterButton: document.getElementById("ground-better-btn"),
  groundMoreButton: document.getElementById("ground-more-btn"),
  supportScreen: document.getElementById("support-screen"),
  supportTitle: document.getElementById("support-title"),
  supportList: document.getElementById("support-list"),
  supportContinueButton: document.getElementById("support-continue-btn"),
  breathingGuide: document.getElementById("breathing-guide"),
  breathingPhase: document.getElementById("breathing-phase"),
  breathingEndButton: document.getElementById("breathing-end-btn"),
  endScreen: document.getElementById("end-screen"),
  endMessage: document.getElementById("end-message"),
  reflectTitle: document.getElementById("reflect-title"),
  reflectForm: document.getElementById("reflect-form"),
  reflectInput: document.getElementById("reflect-input"),
  reflectSendButton: document.getElementById("reflect-send-btn"),
  notesTitle: document.getElementById("notes-title"),
  notesListTitle: document.getElementById("notes-list-title"),
  notesAddTodayButton: document.getElementById("notes-add-today-btn"),
  notesReadButton: document.getElementById("notes-read-btn"),
  notesPrivacy: document.getElementById("notes-privacy"),
  notesEmpty: document.getElementById("notes-empty"),
  notesList: document.getElementById("notes-list"),
  status: document.getElementById("status"),
  transcript: document.getElementById("transcript-area"),
  practiceTitle: document.getElementById("practice-title"),
  practiceLead: document.getElementById("practice-lead"),
  practiceBody: document.getElementById("practice-body"),
  practiceKickoff: document.getElementById("practice-kicker"),
  groundButton: document.getElementById("ground-btn"),
  faqIntro: document.getElementById("faq-intro"),
  faqList: document.getElementById("faq-list"),
  contactTitle: document.getElementById("contact-title"),
  contactCta: document.getElementById("contact-cta"),
  contactBackButton: document.getElementById("contact-back-btn"),
  contactFormTitle: document.getElementById("contact-form-title"),
  contactFormIntro: document.getElementById("contact-form-intro"),
  contactForm: document.getElementById("contact-form"),
  contactNameLabel: document.getElementById("contact-name-label"),
  contactEmailLabel: document.getElementById("contact-email-label"),
  contactMessageLabel: document.getElementById("contact-message-label"),
  contactConsentLabel: document.getElementById("contact-consent-label"),
  contactSubmitButton: document.getElementById("contact-submit-btn"),
  contactFormStatus: document.getElementById("contact-form-status"),
  contactPrivacyNote: document.getElementById("contact-privacy-note"),
  howTitle: document.getElementById("how-title"),
  howText: document.getElementById("how-text"),
  settingsVoiceSummary: document.getElementById("tts-voice-summary"),
};

const GEMINI_TTS_MODEL = "gemini-3.8-flash-lite-tts";
const GEMINI_REPETITION_VOICES = new Set(["Callirrhoe", "Umbriel"]);
const savedRepetitionVoice = localStorage.getItem(STORAGE_KEYS.geminiVoice);
const INTERIM_COMMIT_MS = 280;
const MAX_TTS_CACHE_ENTRIES = 20;

const state = {
  lang: getInitialLang(),
  isActive: false,
  isSpeaking: false,
  recognition: null,
  speechAvailable: true,
  lastSpokenText: "",
  lastProcessedText: "",
  lastProcessedAt: 0,
  recognitionRestartTimer: null,
  recognitionInterimTimer: null,
  recognitionInterimText: "",
  recognitionPauseRequested: false,
  recognitionCycleId: 0,
  recognitionHandledCycleId: -1,
  currentAudio: null,
  recordedAudioResolve: null,
  speechAbortController: null,
  streamingSources: new Set(),
  streamingPlaybackResolve: null,
  ttsAudioCache: new Map(),
  durationMode: "recommended",
  selectedDurationMinutes: 15,
  openingMode: localStorage.getItem(STORAGE_KEYS.firstSessionComplete) === "true" ? "quiet" : "full",
  movementRemindersEnabled: false,
  repetitionVoice: GEMINI_REPETITION_VOICES.has(savedRepetitionVoice) ? savedRepetitionVoice : "Callirrhoe",
  openingCycleId: 0,
  sessionPhase: "setup",
  sessionTimerId: null,
  sessionEndsAt: 0,
  audioContext: null,
  closingCancelled: false,
  viewBeforeGuide: "practice",
  wasActiveBeforeGuide: false,
  guideReturnToPractice: false,
  groundingCycleId: 0,
  breathingCycleId: 0,
  breathingPhaseIndex: 0,
  breathingStartedAt: 0,
  breathingTimerId: null,
  breathingToneNodes: [],
  reflectMode: "new",
  reflectAfterSaveView: "end",
  reflectSaveTimer: null,
  view: "home",
};

const BREATHING_PHASE_MS = 5000;
const BREATHING_PHASE_COUNT = 60;
const GUIDANCE_AUDIO = {
  quiet: new URL("../audio/02-opening-quiet.m4a", import.meta.url).href,
  guided: null,
  full: new URL("../audio/01-opening-full.m4a", import.meta.url).href,
  closing: new URL("../audio/03-closing.m4a", import.meta.url).href,
  grounding: new URL("../audio/04-grounding.m4a", import.meta.url).href,
};
const MOVEMENT_REMINDER_AUDIO = [];

function t(key) {
  return I18N[state.lang][key] || key;
}

function getInitialLang() {
  const language = navigator.language || navigator.userLanguage || "";
  return language.toLowerCase().startsWith("fr") ? "fr" : "en";
}

function setStatus(message) {
  dom.status.textContent = message;
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

function renderSupportTips() {
  if (!dom.supportList) return;
  dom.supportList.innerHTML = "";
  I18N[state.lang].supportTips.forEach((tip, index) => {
    const item = document.createElement("li");

    if (index === 0) {
      item.className = "support-breathing-item";
      const button = document.createElement("button");
      button.className = "support-breathing-btn";
      button.type = "button";
      button.textContent = tip;
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        startBreathingGuidance();
      });
      item.appendChild(button);
    } else {
      item.textContent = tip;
    }

    dom.supportList.appendChild(item);
  });
}

function renderIntro() {
  if (!dom.introWritten) return;
  dom.introWritten.innerHTML = "";
  t("introReadText").forEach((paragraph) => {
    const node = document.createElement("p");
    const stepMatch = paragraph.match(/^(\d+\.)\s*(.*)$/);

    if (stepMatch) {
      const number = document.createElement("span");
      number.className = "intro-step-number";
      number.textContent = stepMatch[1];
      node.appendChild(number);
      node.append(` ${stepMatch[2]}`);
    } else {
      node.textContent = paragraph;
    }

    dom.introWritten.appendChild(node);
  });
}

function updatePageCopy() {
  const navLabels = {
    practice: t("navStart"),
    intro: t("navGuide"),
    faq: t("navFaq"),
    notes: t("navNotes"),
  };
  dom.pageButtons.forEach((button) => {
    if (navLabels[button.dataset.view]) {
      button.textContent = navLabels[button.dataset.view];
    }
  });
  if (dom.firstWelcome) dom.firstWelcome.textContent = t("firstWelcome");
  if (dom.firstGuidePrompt) dom.firstGuidePrompt.textContent = t("firstGuidePrompt");
  if (dom.firstGuideButton) dom.firstGuideButton.textContent = t("firstGuideCta");
  if (dom.homeStartBtn) dom.homeStartBtn.textContent = t("homeCta");
  if (dom.introTitle) dom.introTitle.textContent = t("introTitle");
  if (dom.durationPrompt) dom.durationPrompt.textContent = t("durationPrompt");
  if (dom.setupSubtitle) dom.setupSubtitle.textContent = t("setupSubtitle");
  if (dom.durationSectionLabel) dom.durationSectionLabel.textContent = t("durationSectionLabel");
  if (dom.durationRecommendedValue) dom.durationRecommendedValue.textContent = t("durationRecommendedValue");
  if (dom.durationRecommendedLabel) dom.durationRecommendedLabel.textContent = t("durationRecommendedLabel");
  if (dom.durationTestValue) dom.durationTestValue.textContent = t("durationTestValue");
  if (dom.durationTestLabel) dom.durationTestLabel.textContent = t("durationTestLabel");
  if (dom.durationCustomLabel) dom.durationCustomLabel.textContent = t("durationCustomLabel");
  if (dom.durationCustomDetail) dom.durationCustomDetail.textContent = t("durationCustomDetail");
  if (dom.customDurationTitle) dom.customDurationTitle.textContent = t("customDurationTitle");
  if (dom.customDurationRange) dom.customDurationRange.textContent = t("customDurationRange");
  if (dom.customDurationCancel) dom.customDurationCancel.textContent = t("customDurationCancel");
  if (dom.customDurationDone) dom.customDurationDone.textContent = t("customDurationDone");
  if (dom.openingSectionLabel) dom.openingSectionLabel.textContent = t("openingSectionLabel");
  if (dom.openingQuietTitle) dom.openingQuietTitle.textContent = t("openingQuietTitle");
  if (dom.openingQuietDetail) dom.openingQuietDetail.textContent = t("openingQuietDetail");
  if (dom.openingGuidedTitle) dom.openingGuidedTitle.textContent = t("openingGuidedTitle");
  if (dom.openingGuidedDetail) dom.openingGuidedDetail.textContent = t("openingGuidedDetail");
  if (dom.openingFullTitle) dom.openingFullTitle.textContent = t("openingFullTitle");
  if (dom.openingFullDetail) dom.openingFullDetail.textContent = t("openingFullDetail");
  if (dom.voiceSectionLabel) dom.voiceSectionLabel.textContent = t("voiceSectionLabel");
  if (dom.voiceFemaleTitle) dom.voiceFemaleTitle.textContent = t("voiceFemaleTitle");
  if (dom.voiceMaleTitle) dom.voiceMaleTitle.textContent = t("voiceMaleTitle");
  if (dom.movementRemindersTitle) dom.movementRemindersTitle.textContent = t("movementRemindersTitle");
  if (dom.movementRemindersDetail) dom.movementRemindersDetail.textContent = t("movementRemindersDetail");
  if (dom.practiceBeginButton) dom.practiceBeginButton.textContent = t("practiceStart");
  if (dom.openingGuidanceLabel) dom.openingGuidanceLabel.textContent = t("openingPreparing");
  if (dom.openingMissingTitle) dom.openingMissingTitle.textContent = t("openingMissingTitle");
  if (dom.openingMissingCopy) {
    dom.openingMissingCopy.textContent = state.openingMode === "guided"
      ? t("openingMissingCopy")
      : t("openingRecordingUnavailable");
  }
  if (dom.openingSkipButton) dom.openingSkipButton.textContent = t("openingSkipCta");
  if (dom.openingBeginButton) dom.openingBeginButton.textContent = t("openingMissingBeginCta");
  if (dom.practiceLiveCopy) dom.practiceLiveCopy.textContent = t("practiceLiveCopy");
  if (dom.closingCopy) dom.closingCopy.textContent = t("closingCopy");
  if (dom.closingGuidanceLabel) dom.closingGuidanceLabel.textContent = t("closingGuidanceLabel");
  if (dom.postClosingCopy) dom.postClosingCopy.textContent = t("postClosingCopy");
  if (dom.practiceKickoff) dom.practiceKickoff.textContent = t("practiceTitle");
  if (dom.practiceTitle) dom.practiceTitle.textContent = t("practiceTitle");
  if (dom.practiceLead) dom.practiceLead.textContent = t("practiceLead");
  if (dom.practiceBody) dom.practiceBody.textContent = t("practiceBody");
  if (dom.sessionContinueButton) dom.sessionContinueButton.textContent = t("sessionContinuePracticeCta");
  if (dom.sessionFinishButton) dom.sessionFinishButton.textContent = t("sessionClosePracticeCta");
  if (dom.sessionWriteLabel) dom.sessionWriteLabel.textContent = t("sessionWriteCta");
  if (dom.sessionEndButton) dom.sessionEndButton.textContent = t("sessionEndCta");
  if (dom.practiceRemindButton) dom.practiceRemindButton.textContent = t("remindPracticeCta");
  if (dom.practiceCompleteButton) dom.practiceCompleteButton.textContent = t("completePracticeCta");
  if (dom.introReturnButton) dom.introReturnButton.textContent = t("introReturnCta");
  if (dom.groundKicker) dom.groundKicker.textContent = t("groundCta");
  if (dom.groundButton) dom.groundButton.textContent = t("safetyStopCta");
  if (dom.groundTitle) dom.groundTitle.textContent = t("groundTitle");
  if (dom.groundGuidanceLabel) dom.groundGuidanceLabel.textContent = t("groundGuidanceLabel");
  if (dom.groundEndGuidanceButton) dom.groundEndGuidanceButton.textContent = t("groundEndGuidanceCta");
  if (dom.groundBetterButton) dom.groundBetterButton.textContent = t("groundBetterCta");
  if (dom.groundMoreButton) dom.groundMoreButton.textContent = t("groundMoreCta");
  if (dom.supportTitle) dom.supportTitle.textContent = t("supportTitle");
  if (dom.supportContinueButton) dom.supportContinueButton.textContent = t("supportContinueCta");
  if (dom.breathingEndButton) dom.breathingEndButton.textContent = t("breathingEndCta");
  if (dom.endMessage) dom.endMessage.textContent = t("endMessage");
  if (dom.reflectTitle) dom.reflectTitle.textContent = t("reflectTitle");
  if (dom.reflectInput) dom.reflectInput.placeholder = t("reflectPlaceholder");
  if (dom.reflectSendButton) dom.reflectSendButton.setAttribute("aria-label", t("reflectSendLabel"));
  if (dom.notesTitle) dom.notesTitle.textContent = t("notesTitle");
  if (dom.notesListTitle) dom.notesListTitle.textContent = t("notesTitle");
  if (dom.notesAddTodayButton) dom.notesAddTodayButton.textContent = t("notesAddTodayCta");
  if (dom.notesReadButton) dom.notesReadButton.textContent = t("notesReadCta");
  if (dom.notesEmpty) dom.notesEmpty.textContent = t("notesEmpty");
  if (dom.notesPrivacy) dom.notesPrivacy.textContent = t("notesPrivacy");
  if (dom.faqIntro) dom.faqIntro.textContent = t("faqIntro");
  if (dom.contactTitle) dom.contactTitle.textContent = t("contactTitle");
  if (dom.contactCta) dom.contactCta.textContent = t("contactCta");
  if (dom.contactBackButton) dom.contactBackButton.textContent = t("contactBackCta");
  if (dom.contactFormTitle) dom.contactFormTitle.textContent = t("contactFormTitle");
  if (dom.contactFormIntro) dom.contactFormIntro.textContent = t("contactFormIntro");
  if (dom.contactNameLabel) dom.contactNameLabel.textContent = t("contactNameLabel");
  if (dom.contactEmailLabel) dom.contactEmailLabel.textContent = t("contactEmailLabel");
  if (dom.contactMessageLabel) dom.contactMessageLabel.textContent = t("contactMessageLabel");
  if (dom.contactConsentLabel) dom.contactConsentLabel.textContent = t("contactConsentLabel");
  if (dom.contactSubmitButton && !dom.contactSubmitButton.disabled) dom.contactSubmitButton.textContent = t("contactSubmitCta");
  if (dom.contactPrivacyNote) dom.contactPrivacyNote.textContent = t("contactPrivacy");
  if (dom.howTitle) dom.howTitle.textContent = t("howTitle");
  if (dom.howText) dom.howText.innerHTML = t("howText");
  updateDurationControls();
  updateOpeningControls();
  renderIntro();
  renderFaq();
  renderSupportTips();
  renderNotes();
}

function updateIntroReturnButton() {
  if (!dom.introReturnButton) return;
  const canReturnToPractice =
    state.view === "intro" &&
    state.guideReturnToPractice &&
    state.wasActiveBeforeGuide &&
    (state.sessionPhase === "timed" || state.sessionPhase === "open");
  dom.introReturnButton.hidden = !canReturnToPractice;
}

function clearGuideReturnState() {
  state.guideReturnToPractice = false;
  state.wasActiveBeforeGuide = false;
  state.viewBeforeGuide = "practice";
}

function setSessionFocusMode(active) {
  document.body.classList.toggle("session-focus", active);
}

function cancelClosingForNavigation(nextView) {
  if (state.sessionPhase !== "closing") return;
  state.closingCancelled = true;
  stopSpeechPlayback();
  state.isSpeaking = false;
  document.body.classList.remove("session-closing", "session-complete");
  if (dom.closingPanel) dom.closingPanel.hidden = true;
  if (dom.postClosingActions) dom.postClosingActions.hidden = true;

  if (nextView === "practice") {
    state.sessionPhase = "open";
    state.isActive = true;
    document.body.classList.add("session-active", "session-open");
    if (dom.practiceFocus) dom.practiceFocus.hidden = false;
    if (dom.practiceSupportActions) dom.practiceSupportActions.hidden = false;
    if (dom.groundButton) dom.groundButton.hidden = false;
    updateButton();
    scheduleRecognitionRestart(150);
    return;
  }

  state.sessionPhase = "setup";
  state.isActive = false;
  document.body.classList.remove("session-active", "session-open");
  if (dom.practiceFocus) dom.practiceFocus.hidden = false;
  if (dom.practiceSupportActions) dom.practiceSupportActions.hidden = true;
  if (dom.groundButton) dom.groundButton.hidden = true;
  updateButton();
}

function cancelGroundingForNavigation(nextView) {
  if (state.view !== "ground" || nextView === "ground") return;
  state.groundingCycleId += 1;
  stopSpeechPlayback();
  state.isSpeaking = false;
  clearSessionTimer();
  state.sessionPhase = "setup";
  state.isActive = false;
  document.body.classList.remove("session-active", "session-open", "session-complete", "session-closing");
  updateButton();
}

function stopBreathingTone() {
  state.breathingToneNodes.forEach((node) => {
    try {
      node.stop?.();
    } catch {
      // The oscillator may already have ended.
    }
    try {
      node.disconnect?.();
    } catch {
      // no-op
    }
  });
  state.breathingToneNodes = [];
}

function clearBreathingGuidance() {
  state.breathingCycleId += 1;
  if (state.breathingTimerId) {
    clearTimeout(state.breathingTimerId);
    state.breathingTimerId = null;
  }
  stopBreathingTone();
  state.breathingPhaseIndex = 0;
  state.breathingStartedAt = 0;
}

function cancelBreathingForNavigation(nextView) {
  if (state.view !== "breathing" || nextView === "breathing") return;
  clearBreathingGuidance();
}

function cancelOpeningForNavigation(nextView) {
  if (state.sessionPhase !== "opening" || nextView === "practice") return;
  state.openingCycleId += 1;
  stopSpeechPlayback();
  state.isSpeaking = false;
  state.sessionPhase = "setup";
  setSessionFocusMode(false);
  updateButton();
}

function cancelGuidanceForNavigation(nextView) {
  cancelOpeningForNavigation(nextView);
  cancelClosingForNavigation(nextView);
  cancelGroundingForNavigation(nextView);
  cancelBreathingForNavigation(nextView);
}

function setView(view, options = {}) {
  if (!hasSeenIntro() && view !== "home" && view !== "first" && view !== "intro") {
    view = "intro";
  }
  if (view === "intro" && !hasSeenIntro()) {
    markIntroSeen();
  }
  cancelGuidanceForNavigation(view);
  if (view === "intro" && !options.returnToPractice) {
    clearGuideReturnState();
  } else if (view !== "intro") {
    clearGuideReturnState();
  }

  state.view = view;
  document.body.dataset.view = view;
  dom.pageButtons.forEach((button) => {
    const isNotesSubpage = view === "notes-list" && button.dataset.view === "notes";
    button.classList.toggle("active", button.dataset.view === view || isNotesSubpage);
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
    if (!state.isActive && state.sessionPhase !== "timed" && state.sessionPhase !== "open" && state.sessionPhase !== "closing") {
      showPracticeSetup();
    }
    setStatus(state.isActive ? t("listening") : t("press"));
  } else if (view === "intro") {
    renderIntro();
    setStatus(t("press"));
  } else if (view === "notes-list") {
    renderNotes();
    setStatus(t("press"));
  } else if (!state.isActive) {
    setStatus(t("press"));
  }
  updateIntroReturnButton();
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

function clearLegacyTestNotes() {
  localStorage.removeItem("emerge_reflection_notes");
}

function enterFromHome() {
  setView(hasSeenIntro() ? "practice" : "first");
}

function loadReflectionNotes() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEYS.notes) || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((note) => note && typeof note.text === "string" && note.text.trim());
  } catch {
    return [];
  }
}

function saveReflectionNote(text) {
  const notes = loadReflectionNotes();
  const note = {
    id: String(Date.now()),
    createdAt: new Date().toISOString(),
    text: text.trim(),
  };
  localStorage.setItem(STORAGE_KEYS.notes, JSON.stringify([...notes, note]));
}

function isSameLocalDay(value, reference = new Date()) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  return (
    date.getFullYear() === reference.getFullYear() &&
    date.getMonth() === reference.getMonth() &&
    date.getDate() === reference.getDate()
  );
}

function getTodayReflectionNotes() {
  return loadReflectionNotes()
    .filter((note) => isSameLocalDay(note.createdAt))
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

function getTodayReflectionText() {
  return getTodayReflectionNotes().map((note) => note.text).join("\n\n");
}

function saveTodayReflectionNote(text) {
  const existingTodayNotes = getTodayReflectionNotes();
  const otherNotes = loadReflectionNotes().filter((note) => !isSameLocalDay(note.createdAt));
  const firstTodayNote = existingTodayNotes[0];
  const note = {
    id: firstTodayNote?.id || String(Date.now()),
    createdAt: firstTodayNote?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    text: text.trim(),
  };
  localStorage.setItem(STORAGE_KEYS.notes, JSON.stringify([...otherNotes, note]));
}

function formatNoteDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(state.lang === "fr" ? "fr-FR" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function renderNotes() {
  if (!dom.notesList || !dom.notesEmpty) return;

  const notes = loadReflectionNotes()
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  dom.notesList.innerHTML = "";
  dom.notesEmpty.hidden = notes.length > 0;

  notes.forEach((note) => {
    const article = document.createElement("article");
    article.className = "note-item";

    const date = document.createElement("time");
    date.className = "note-date";
    date.dateTime = note.createdAt;
    date.textContent = formatNoteDate(note.createdAt);

    const text = document.createElement("p");
    text.className = "note-text";
    text.textContent = note.text;

    article.appendChild(date);
    article.appendChild(text);
    dom.notesList.appendChild(article);
  });
}

function formatSessionTime(ms) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function getSelectedDurationMinutes() {
  if (state.durationMode === "test") return 10 / 60;
  if (state.durationMode === "recommended") return 15;
  const value = Number(dom.durationCustomInput?.value);
  if (!Number.isFinite(value) || value < 3 || value > 60) return null;
  return value;
}

function populateCustomDurationOptions() {
  if (!dom.durationCustomInput) return;
  const selectedValue = Number(dom.durationCustomInput.value) || 20;
  dom.durationCustomInput.innerHTML = "";
  for (let minutes = 3; minutes <= 60; minutes += 1) {
    const option = document.createElement("option");
    option.value = String(minutes);
    option.textContent = `${minutes} min`;
    dom.durationCustomInput.appendChild(option);
  }
  dom.durationCustomInput.value = String(Math.min(60, Math.max(3, selectedValue)));
}

function showPracticeSetupError(message) {
  if (!dom.durationError) return;
  dom.durationError.textContent = message;
  dom.durationError.classList.add("is-visible");
}

function clearPracticeSetupError() {
  if (!dom.durationError) return;
  dom.durationError.textContent = "";
  dom.durationError.classList.remove("is-visible");
}

function updateDurationControls(showError = false) {
  const duration = getSelectedDurationMinutes();
  const isCustom = state.durationMode === "custom";
  const hasInvalidCustom = isCustom && duration === null;

  dom.durationRecommendedButton?.classList.toggle("is-selected", state.durationMode === "recommended");
  dom.durationTestButton?.classList.toggle("is-selected", state.durationMode === "test");
  dom.durationCustomChoice?.classList.toggle("is-selected", isCustom);

  if (dom.durationError) {
    if (showError && hasInvalidCustom) {
      showPracticeSetupError(t("durationError"));
    } else if (!hasInvalidCustom) {
      clearPracticeSetupError();
    }
  }
}

function updateOpeningControls() {
  dom.openingChoices.forEach((button) => {
    const selected = button.dataset.opening === state.openingMode;
    button.classList.toggle("is-selected", selected);
    button.setAttribute("aria-checked", selected ? "true" : "false");
  });
  if (dom.movementRemindersInput) {
    dom.movementRemindersInput.checked = state.movementRemindersEnabled;
  }
  dom.voiceChoices.forEach((button) => {
    const selected = button.dataset.voice === state.repetitionVoice;
    button.classList.toggle("is-selected", selected);
    button.setAttribute("aria-checked", selected ? "true" : "false");
  });
  updateTtsStatus();
}

function setDurationMode(mode) {
  state.durationMode = mode;
  updateDurationControls();
}

function openCustomDurationPicker() {
  if (!dom.customDurationModal) return;
  dom.customDurationModal.hidden = false;
  document.body.classList.add("modal-open");
  dom.durationCustomInput?.focus();
  const selectedOption = dom.durationCustomInput?.selectedOptions?.[0];
  selectedOption?.scrollIntoView({ block: "center" });
}

function closeCustomDurationPicker() {
  if (!dom.customDurationModal) return;
  dom.customDurationModal.hidden = true;
  document.body.classList.remove("modal-open");
  dom.durationCustomChoice?.focus();
}

function confirmCustomDuration() {
  state.durationMode = "custom";
  updateDurationControls();
  closeCustomDurationPicker();
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

function getBreathingAudioContext() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return null;
  if (!state.audioContext) state.audioContext = new AudioContext();
  state.audioContext.resume?.();
  return state.audioContext;
}

function playBreathingTone(isInhale) {
  const context = getBreathingAudioContext();
  if (!context) return;
  stopBreathingTone();

  const start = context.currentTime + 0.04;
  const end = start + 3.85;
  const masterGain = context.createGain();
  const frequencies = isInhale
    ? [261.63, 329.63, 392]
    : [196, 246.94, 293.66];
  const voiceLevels = [0.56, 0.28, 0.16];

  masterGain.gain.setValueAtTime(0.0001, start);
  masterGain.gain.exponentialRampToValueAtTime(0.12, start + 0.45);
  masterGain.gain.exponentialRampToValueAtTime(0.072, start + 1.55);
  masterGain.gain.exponentialRampToValueAtTime(0.0001, end);
  masterGain.connect(context.destination);

  const oscillators = frequencies.map((frequency, index) => {
    const oscillator = context.createOscillator();
    const voiceGain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, start);
    voiceGain.gain.value = voiceLevels[index];
    oscillator.connect(voiceGain);
    voiceGain.connect(masterGain);
    oscillator.start(start);
    oscillator.stop(end + 0.02);
    state.breathingToneNodes.push(voiceGain);
    return oscillator;
  });

  state.breathingToneNodes.push(masterGain, ...oscillators);
}

function updateBreathingPhase(isInhale) {
  if (dom.breathingPhase) {
    dom.breathingPhase.textContent = t(isInhale ? "breathingIn" : "breathingOut");
  }
  if (dom.breathingGuide) {
    dom.breathingGuide.classList.toggle("is-inhale", isInhale);
    dom.breathingGuide.classList.toggle("is-exhale", !isInhale);
  }
  setStatus(t("breathingStatus"));
}

function runBreathingPhase(cycleId) {
  if (state.breathingCycleId !== cycleId || state.view !== "breathing") return;

  if (state.breathingPhaseIndex >= BREATHING_PHASE_COUNT) {
    setView("support");
    return;
  }

  const isInhale = state.breathingPhaseIndex % 2 === 0;
  updateBreathingPhase(isInhale);
  playBreathingTone(isInhale);
  state.breathingPhaseIndex += 1;

  const nextPhaseAt = state.breathingStartedAt + state.breathingPhaseIndex * BREATHING_PHASE_MS;
  state.breathingTimerId = setTimeout(
    () => runBreathingPhase(cycleId),
    Math.max(0, nextPhaseAt - Date.now()),
  );
}

function startBreathingGuidance() {
  clearBreathingGuidance();
  stopSpeechPlayback();
  getBreathingAudioContext();
  setSessionFocusMode(true);
  setView("breathing");

  const cycleId = state.breathingCycleId + 1;
  state.breathingCycleId = cycleId;
  state.breathingPhaseIndex = 0;
  state.breathingStartedAt = Date.now();
  if (dom.breathingGuide) {
    dom.breathingGuide.classList.remove("is-inhale", "is-exhale");
    dom.breathingGuide.classList.add("is-exhale");
    void dom.breathingGuide.offsetWidth;
  }
  runBreathingPhase(cycleId);
}

function endBreathingGuidance() {
  if (state.view !== "breathing") return;
  setView("support");
}

function showPracticeSetup(message = "") {
  setSessionFocusMode(false);
  state.sessionPhase = "setup";
  clearSessionTimer();
  if (dom.practiceSetup) dom.practiceSetup.hidden = false;
  if (dom.practiceLive) dom.practiceLive.hidden = true;
  if (dom.openingStage) dom.openingStage.hidden = true;
  if (dom.closingPanel) dom.closingPanel.hidden = true;
  if (dom.postClosingActions) dom.postClosingActions.hidden = true;
  if (dom.practiceFocus) dom.practiceFocus.hidden = false;
  if (dom.practiceSupportActions) dom.practiceSupportActions.hidden = true;
  if (dom.groundButton) dom.groundButton.hidden = true;
  document.body.classList.remove("session-active", "session-complete", "session-open");
  updateDurationControls();
  updateOpeningControls();
  if (dom.practiceBeginButton) {
    dom.practiceBeginButton.disabled = false;
    dom.practiceBeginButton.textContent = t("practiceStart");
  }
  if (message) showPracticeSetupError(message);
  else clearPracticeSetupError();
  updateButton();
}

function showPracticeLive() {
  if (dom.practiceSetup) dom.practiceSetup.hidden = true;
  if (dom.practiceLive) dom.practiceLive.hidden = false;
  if (dom.openingStage) dom.openingStage.hidden = true;
  if (dom.practiceFocus) dom.practiceFocus.hidden = false;
  if (dom.closingPanel) dom.closingPanel.hidden = true;
  if (dom.postClosingActions) dom.postClosingActions.hidden = true;
  if (dom.practiceSupportActions) dom.practiceSupportActions.hidden = false;
  if (dom.groundButton) dom.groundButton.hidden = false;
}

function getOpeningScreenTitle() {
  if (state.openingMode === "full") return t("openingFullTitle");
  if (state.openingMode === "guided") return t("openingGuidedTitle");
  return t("openingQuietScreenTitle");
}

function showPracticeOpening(recordingMissing = false) {
  if (dom.practiceSetup) dom.practiceSetup.hidden = true;
  if (dom.practiceLive) dom.practiceLive.hidden = false;
  if (dom.openingStage) dom.openingStage.hidden = false;
  if (dom.openingStageTitle) dom.openingStageTitle.textContent = getOpeningScreenTitle();
  if (dom.openingMissingCopy) {
    dom.openingMissingCopy.textContent = state.openingMode === "guided"
      ? t("openingMissingCopy")
      : t("openingRecordingUnavailable");
  }
  if (dom.practiceFocus) dom.practiceFocus.hidden = true;
  if (dom.openingGuidanceStatus) dom.openingGuidanceStatus.hidden = recordingMissing;
  if (dom.openingMissingPanel) dom.openingMissingPanel.hidden = !recordingMissing;
  if (dom.openingSkipButton) dom.openingSkipButton.hidden = recordingMissing;
  if (dom.openingBeginButton) dom.openingBeginButton.hidden = !recordingMissing;
  if (dom.closingPanel) dom.closingPanel.hidden = true;
  if (dom.postClosingActions) dom.postClosingActions.hidden = true;
  if (dom.practiceSupportActions) dom.practiceSupportActions.hidden = true;
  if (dom.groundButton) dom.groundButton.hidden = true;
}

function stopSpeechPlayback() {
  speechSynthesis.cancel();
  state.speechAbortController?.abort();
  state.speechAbortController = null;
  state.streamingSources.forEach((source) => {
    try {
      source.stop();
    } catch {
      // no-op
    }
  });
  state.streamingSources.clear();
  if (state.streamingPlaybackResolve) {
    const resolveStreamingPlayback = state.streamingPlaybackResolve;
    state.streamingPlaybackResolve = null;
    resolveStreamingPlayback(false);
  }
  if (state.currentAudio) {
    try {
      state.currentAudio.pause();
      state.currentAudio.currentTime = 0;
    } catch {
      // no-op
    }
    state.currentAudio = null;
  }
  if (state.recordedAudioResolve) {
    const resolvePlayback = state.recordedAudioResolve;
    state.recordedAudioResolve = null;
    resolvePlayback(false);
  }
}

function playRecordedAudio(source) {
  stopSpeechPlayback();
  if (!source) return Promise.resolve(false);

  return new Promise((resolve) => {
    const audio = new Audio(source);
    let settled = false;

    const finish = (completed) => {
      if (settled) return;
      settled = true;
      audio.onended = null;
      audio.onerror = null;
      if (state.currentAudio === audio) state.currentAudio = null;
      if (state.recordedAudioResolve === finish) state.recordedAudioResolve = null;
      resolve(completed);
    };

    state.currentAudio = audio;
    state.recordedAudioResolve = finish;
    audio.preload = "auto";
    audio.onended = () => finish(true);
    audio.onerror = () => finish(false);
    audio.play().catch(() => finish(false));
  });
}

async function playGuidanceAudio(kind, statusMessage) {
  const source = GUIDANCE_AUDIO[kind];
  if (!source) return false;

  state.isSpeaking = true;
  updateButton();
  setStatus(statusMessage);
  const completed = await playRecordedAudio(source);
  state.isSpeaking = false;
  updateButton();
  return completed;
}

function getSpeechAudioContext() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return null;
  if (!state.audioContext) state.audioContext = new AudioContext();
  state.audioContext.resume?.();
  return state.audioContext;
}

function clearRecognitionInterim() {
  if (state.recognitionInterimTimer) {
    clearTimeout(state.recognitionInterimTimer);
    state.recognitionInterimTimer = null;
  }
  state.recognitionInterimText = "";
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
  clearRecognitionInterim();
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
  clearRecognitionInterim();
  state.recognitionPauseRequested = true;
  try {
    state.recognition.abort();
  } catch {
    // no-op
  }
}

function createAudioBufferFromPcm(context, bytes) {
  const sampleCount = Math.floor(bytes.byteLength / 2);
  const audioBuffer = context.createBuffer(1, sampleCount, 24000);
  const channel = audioBuffer.getChannelData(0);
  const view = new DataView(bytes.buffer, bytes.byteOffset, sampleCount * 2);
  for (let index = 0; index < sampleCount; index += 1) {
    channel[index] = view.getInt16(index * 2, true) / 32768;
  }
  return audioBuffer;
}

function cacheGeminiPcm(key, chunks, totalBytes) {
  if (!totalBytes) return;
  const combined = new Uint8Array(totalBytes);
  let offset = 0;
  chunks.forEach((chunk) => {
    combined.set(chunk, offset);
    offset += chunk.byteLength;
  });
  if (state.ttsAudioCache.size >= MAX_TTS_CACHE_ENTRIES) {
    const oldestKey = state.ttsAudioCache.keys().next().value;
    state.ttsAudioCache.delete(oldestKey);
  }
  state.ttsAudioCache.set(key, combined);
}

function playCachedGeminiPcm(context, pcmBytes, spokenText) {
  return new Promise((resolve) => {
    let settled = false;
    const source = context.createBufferSource();
    const finish = (completed) => {
      if (settled) return;
      settled = true;
      state.streamingSources.delete(source);
      if (state.streamingPlaybackResolve === finish) state.streamingPlaybackResolve = null;
      if (completed) state.lastSpokenText = spokenText;
      resolve(completed);
    };

    state.streamingPlaybackResolve = finish;
    source.buffer = createAudioBufferFromPcm(context, pcmBytes);
    source.connect(context.destination);
    state.streamingSources.add(source);
    source.onended = () => finish(true);
    source.start(context.currentTime + 0.008);
  });
}

async function speakGemini(text) {
  const spokenText = normalizeSpokenText(text);
  const context = getSpeechAudioContext();
  if (!context) throw new Error("Web Audio is unavailable.");
  const cacheKey = `${state.repetitionVoice}|${state.lang}|${spokenText.toLocaleLowerCase()}`;
  const cachedPcm = state.ttsAudioCache.get(cacheKey);
  if (cachedPcm) return playCachedGeminiPcm(context, cachedPcm, spokenText);

  const controller = new AbortController();
  state.speechAbortController = controller;
  const response = await fetch("./api/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: spokenText,
      model: GEMINI_TTS_MODEL,
      voice: state.repetitionVoice,
      style: "grounded",
      stream: true,
    }),
    signal: controller.signal,
  });

  if (!response.ok) {
    const details = await response.json().catch(() => ({}));
    throw new Error(details.error || `Gemini voice service returned ${response.status}.`);
  }
  if (!response.body) throw new Error("Gemini returned no audio stream.");

  const reader = response.body.getReader();
  let pendingByte = null;
  let nextStartTime = context.currentTime + 0.025;
  let streamFinished = false;
  let activeSourceCount = 0;
  let settled = false;
  const pcmChunks = [];
  let pcmTotalBytes = 0;

  return new Promise((resolve, reject) => {
    const finish = (completed) => {
      if (settled) return;
      settled = true;
      if (state.speechAbortController === controller) state.speechAbortController = null;
      if (state.streamingPlaybackResolve === finish) state.streamingPlaybackResolve = null;
      if (completed) state.lastSpokenText = spokenText;
      resolve(completed);
    };

    const fail = (error) => {
      if (settled) return;
      settled = true;
      if (state.speechAbortController === controller) state.speechAbortController = null;
      if (state.streamingPlaybackResolve === finish) state.streamingPlaybackResolve = null;
      reject(error);
    };

    state.streamingPlaybackResolve = finish;

    const schedulePcm = (chunk) => {
      let bytes = chunk;
      if (pendingByte !== null) {
        const joined = new Uint8Array(chunk.byteLength + 1);
        joined[0] = pendingByte;
        joined.set(chunk, 1);
        bytes = joined;
        pendingByte = null;
      }
      if (bytes.byteLength % 2 === 1) {
        pendingByte = bytes[bytes.byteLength - 1];
        bytes = bytes.subarray(0, bytes.byteLength - 1);
      }
      if (!bytes.byteLength) return;

      const audioBuffer = createAudioBufferFromPcm(context, bytes);

      const source = context.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(context.destination);
      const startAt = Math.max(nextStartTime, context.currentTime + 0.012);
      nextStartTime = startAt + audioBuffer.duration;
      activeSourceCount += 1;
      state.streamingSources.add(source);
      source.onended = () => {
        state.streamingSources.delete(source);
        activeSourceCount -= 1;
        if (streamFinished && activeSourceCount === 0) finish(true);
      };
      source.start(startAt);
    };

    const pump = async () => {
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          if (value?.byteLength) {
            const cachedChunk = Uint8Array.from(value);
            pcmChunks.push(cachedChunk);
            pcmTotalBytes += cachedChunk.byteLength;
            schedulePcm(value);
          }
        }
        streamFinished = true;
        cacheGeminiPcm(cacheKey, pcmChunks, pcmTotalBytes);
        if (activeSourceCount === 0) finish(true);
      } catch (error) {
        if (error.name === "AbortError") finish(false);
        else fail(error);
      }
    };

    pump();
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
    await speakGemini(text);
  } catch (error) {
    console.error("TTS error:", error);
    if (state.isActive && error.name !== "AbortError") {
      try {
        await speakBrowser(text);
      } catch (fallbackError) {
        console.error("Fallback TTS error:", fallbackError);
      }
    }
  } finally {
    state.isSpeaking = false;
    updateButton();
    updatePageCopy();
    if (state.isActive) {
      scheduleRecognitionRestart(50);
    }
  }
}

function stopVoiceCapture() {
  state.isActive = false;
  clearRecognitionInterim();
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

async function startTimedSession() {
  clearPracticeSetupError();
  if (!state.speechAvailable) {
    setStatus(t("noChrome"));
    showPracticeSetupError(t("speechUnavailableVisible"));
    return;
  }
  if (state.isActive || state.sessionPhase === "timed" || state.sessionPhase === "open") return;

  const duration = getSelectedDurationMinutes();
  if (duration === null) {
    updateDurationControls(true);
    return;
  }

  state.selectedDurationMinutes = duration;
  state.sessionPhase = "opening";
  const openingCycleId = state.openingCycleId + 1;
  state.openingCycleId = openingCycleId;
  setSessionFocusMode(true);
  clearPracticeSetupError();
  if (dom.practiceBeginButton) {
    dom.practiceBeginButton.disabled = true;
    dom.practiceBeginButton.textContent = t("practiceStarting");
  }
  const hasOpeningRecording = Boolean(GUIDANCE_AUDIO[state.openingMode]);
  showPracticeOpening(!hasOpeningRecording);

  if (!hasOpeningRecording) return;

  const openingFinished = await playGuidanceAudio(state.openingMode, t("openingPreparing"));
  if (state.openingCycleId !== openingCycleId || state.sessionPhase !== "opening") return;
  if (!openingFinished) {
    showPracticeOpening(true);
    return;
  }

  completeOpeningGuidance();
}

function completeOpeningGuidance() {
  if (state.sessionPhase !== "opening") return;
  state.openingCycleId += 1;
  stopSpeechPlayback();
  state.isSpeaking = false;
  localStorage.setItem(STORAGE_KEYS.firstSessionComplete, "true");
  beginTimedPractice(state.selectedDurationMinutes);
}

function beginTimedPractice(duration) {
  state.sessionPhase = "timed";
  state.sessionEndsAt = Date.now() + duration * 60 * 1000;
  setSessionFocusMode(true);
  document.body.classList.add("session-active");
  document.body.classList.remove("session-complete", "session-open", "session-closing");
  showPracticeLive();
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
    setView("practice");
  }
  state.sessionPhase = "closing";
  state.closingCancelled = false;
  setSessionFocusMode(true);
  document.body.classList.add("session-closing");
  if (dom.practiceFocus) dom.practiceFocus.hidden = true;
  if (dom.practiceSupportActions) dom.practiceSupportActions.hidden = true;
  if (dom.groundButton) dom.groundButton.hidden = true;
  if (dom.closingPanel) dom.closingPanel.hidden = false;
  if (dom.closingGuidanceStatus) dom.closingGuidanceStatus.hidden = false;
  if (dom.postClosingActions) dom.postClosingActions.hidden = true;
  setStatus(t("closingStatus"));
  const closingFinished = await playGuidanceAudio("closing", t("closingStatus"));
  if (state.closingCancelled || state.sessionPhase !== "closing") return;
  if (!closingFinished) {
    await speakText(t("closingAudioText"), t("closingStatus"));
  }
  if (state.closingCancelled || state.sessionPhase !== "closing") return;
  showPostClosingActions();
}

function showPostClosingActions() {
  setSessionFocusMode(true);
  state.sessionPhase = "postClosing";
  state.isActive = false;
  document.body.classList.remove("session-closing", "session-active", "session-open", "session-complete");
  if (dom.practiceSetup) dom.practiceSetup.hidden = true;
  if (dom.practiceLive) dom.practiceLive.hidden = false;
  if (dom.practiceFocus) dom.practiceFocus.hidden = true;
  if (dom.closingPanel) dom.closingPanel.hidden = true;
  if (dom.postClosingActions) dom.postClosingActions.hidden = false;
  if (dom.practiceSupportActions) dom.practiceSupportActions.hidden = true;
  if (dom.groundButton) dom.groundButton.hidden = true;
  setStatus(t("postClosingStatus"));
}

function continueSession() {
  if (state.sessionPhase !== "closing") return;
  state.closingCancelled = true;
  setSessionFocusMode(true);
  stopSpeechPlayback();
  state.isSpeaking = false;
  state.sessionPhase = "open";
  document.body.classList.remove("session-complete", "session-closing");
  document.body.classList.add("session-active", "session-open");
  if (dom.closingPanel) dom.closingPanel.hidden = true;
  if (dom.practiceFocus) dom.practiceFocus.hidden = false;
  if (dom.practiceSupportActions) dom.practiceSupportActions.hidden = false;
  if (dom.groundButton) dom.groundButton.hidden = false;
  startVoiceCapture();
}

function finishClosingGuidance() {
  if (state.sessionPhase !== "closing") return;
  state.closingCancelled = true;
  stopSpeechPlayback();
  state.isSpeaking = false;
  showPostClosingActions();
}

function closeSession() {
  clearSessionTimer();
  stopVoiceCapture();
  beginClosingGuidance();
}

function endSession() {
  clearSessionTimer();
  stopVoiceCapture();
  setSessionFocusMode(false);
  setView("end");
}

function resetReflectForm() {
  if (state.reflectSaveTimer) {
    clearTimeout(state.reflectSaveTimer);
    state.reflectSaveTimer = null;
  }
  state.reflectMode = "new";
  state.reflectAfterSaveView = "end";
  if (dom.reflectInput) dom.reflectInput.value = "";
  if (dom.reflectSendButton) {
    dom.reflectSendButton.disabled = false;
    dom.reflectSendButton.classList.remove("is-saved");
    dom.reflectSendButton.innerHTML = '<span aria-hidden="true">→</span>';
    dom.reflectSendButton.setAttribute("aria-label", t("reflectSendLabel"));
  }
}

function openReflectPage(options = {}) {
  setSessionFocusMode(false);
  resetReflectForm();
  state.reflectMode = options.mode || "new";
  state.reflectAfterSaveView = options.afterSaveView || "end";
  if (dom.reflectInput && options.prefill) {
    dom.reflectInput.value = options.prefill;
  }
  setView("reflect");
  dom.reflectInput?.focus();
}

function openTodayNotesEditor() {
  openReflectPage({
    mode: "today",
    afterSaveView: "notes-list",
    prefill: getTodayReflectionText(),
  });
}

function openNotesList() {
  renderNotes();
  setView("notes-list");
}

function handleReflectSubmit(event) {
  event.preventDefault();
  const text = dom.reflectInput?.value.trim() || "";
  if (!text) {
    setStatus(t("reflectEmptyStatus"));
    dom.reflectInput?.focus();
    return;
  }

  if (state.reflectMode === "today") {
    saveTodayReflectionNote(text);
  } else {
    saveReflectionNote(text);
  }
  renderNotes();
  if (dom.reflectSendButton) {
    dom.reflectSendButton.disabled = true;
    dom.reflectSendButton.classList.add("is-saved");
    dom.reflectSendButton.textContent = t("reflectSaved");
  }
  state.reflectSaveTimer = setTimeout(() => {
    const nextView = state.reflectAfterSaveView;
    state.reflectSaveTimer = null;
    setView(nextView);
    resetReflectForm();
  }, 500);
}

function openFaqFromEnd() {
  setSessionFocusMode(false);
  setView("faq");
}

function openContactForm() {
  if (dom.contactFormStatus) {
    dom.contactFormStatus.textContent = "";
    dom.contactFormStatus.classList.remove("is-error");
  }
  setView("contact");
  document.getElementById("contact-name")?.focus();
}

async function handleContactSubmit(event) {
  event.preventDefault();
  if (!dom.contactForm || !dom.contactSubmitButton || dom.contactSubmitButton.disabled) return;

  const formData = new FormData(dom.contactForm);
  const payload = {
    name: String(formData.get("name") || "").trim(),
    email: String(formData.get("email") || "").trim(),
    message: String(formData.get("message") || "").trim(),
    consent: formData.get("consent") === "on",
    website: String(formData.get("website") || ""),
  };

  dom.contactSubmitButton.disabled = true;
  dom.contactSubmitButton.textContent = t("contactSending");
  if (dom.contactFormStatus) {
    dom.contactFormStatus.textContent = "";
    dom.contactFormStatus.classList.remove("is-error");
  }

  try {
    const response = await fetch("./api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error(`Contact service returned ${response.status}.`);
    dom.contactForm.reset();
    if (dom.contactFormStatus) dom.contactFormStatus.textContent = t("contactSent");
  } catch (error) {
    console.error("Contact form error:", error);
    if (dom.contactFormStatus) {
      dom.contactFormStatus.textContent = t("contactError");
      dom.contactFormStatus.classList.add("is-error");
    }
  } finally {
    dom.contactSubmitButton.disabled = false;
    dom.contactSubmitButton.textContent = t("contactSubmitCta");
  }
}

function openCompletionChoicesFromSupport() {
  state.groundingCycleId += 1;
  clearSessionTimer();
  stopSpeechPlayback();
  state.isSpeaking = false;
  state.isActive = false;
  state.sessionPhase = "setup";
  document.body.classList.remove("session-active", "session-open", "session-complete", "session-closing");
  setView("practice");
  showPostClosingActions();
}

function showSupportChoices() {
  if (dom.groundGuidanceIndicator) dom.groundGuidanceIndicator.hidden = true;
  if (dom.groundEndGuidanceButton) dom.groundEndGuidanceButton.hidden = true;
  if (dom.groundActions) dom.groundActions.hidden = false;
  setStatus(t("groundStatus"));
}

function endGroundingGuidance() {
  if (state.view !== "ground") return;
  state.groundingCycleId += 1;
  stopSpeechPlayback();
  state.isSpeaking = false;
  updateButton();
  showSupportChoices();
}

function showMoreSupport() {
  state.groundingCycleId += 1;
  clearSessionTimer();
  stopSpeechPlayback();
  state.isSpeaking = false;
  state.isActive = false;
  state.sessionPhase = "setup";
  setSessionFocusMode(true);
  document.body.classList.remove("session-active", "session-open", "session-complete", "session-closing");
  setView("support");
}

async function triggerGrounding() {
  const groundingCycleId = state.groundingCycleId + 1;
  state.groundingCycleId = groundingCycleId;
  clearSessionTimer();
  stopVoiceCapture();
  state.sessionPhase = "support";
  state.closingCancelled = true;
  setSessionFocusMode(true);
  document.body.classList.remove("session-active", "session-open", "session-complete", "session-closing");
  if (dom.groundGuidanceIndicator) dom.groundGuidanceIndicator.hidden = false;
  if (dom.groundEndGuidanceButton) dom.groundEndGuidanceButton.hidden = false;
  if (dom.groundActions) dom.groundActions.hidden = true;
  setView("ground");
  setStatus(t("groundStatus"));
  const groundingFinished = await playGuidanceAudio("grounding", t("groundStatus"));
  if (state.groundingCycleId !== groundingCycleId || state.view !== "ground") return;
  if (!groundingFinished) {
    await speakText(t("groundText"), t("groundStatus"));
  }
  if (state.groundingCycleId !== groundingCycleId || state.view !== "ground") return;
  showSupportChoices();
}

function openGuideFromPractice() {
  state.viewBeforeGuide = state.view;
  state.wasActiveBeforeGuide = state.isActive;
  state.guideReturnToPractice = true;
  if (state.isActive) {
    pauseRecognitionForTts();
    state.isActive = false;
  }
  stopSpeechPlayback();
  state.isSpeaking = false;
  state.recognitionPauseRequested = false;
  document.body.classList.remove("session-active");
  setView("intro", { returnToPractice: true });
  updateButton();
  updateIntroReturnButton();
}

function returnFromGuide() {
  const shouldResumePractice = state.wasActiveBeforeGuide && (state.sessionPhase === "timed" || state.sessionPhase === "open");
  const returnView = state.viewBeforeGuide || "practice";
  state.guideReturnToPractice = false;
  setView(returnView);
  if (returnView === "practice" && (state.sessionPhase === "timed" || state.sessionPhase === "open")) {
    showPracticeLive();
  }
  if (shouldResumePractice) {
    state.isActive = true;
    document.body.classList.add("session-active");
    updateButton();
    scheduleRecognitionRestart(150);
    setStatus(t("listening"));
  }
  state.wasActiveBeforeGuide = false;
  state.viewBeforeGuide = "practice";
}

function updateTtsStatus() {
  if (!dom.settingsVoiceSummary) return;
  const label = state.repetitionVoice === "Umbriel" ? t("voiceMaleTitle") : t("voiceFemaleTitle");
  dom.settingsVoiceSummary.textContent = label;
  dom.settingsToggle.classList.add("has-key");
}

function handleRecognizedText(userText) {
  if (!userText || state.isSpeaking || state.recognitionPauseRequested || !state.isActive) return;
  if (state.recognitionHandledCycleId === state.recognitionCycleId) return;
  clearRecognitionInterim();

  const normalizedUserText = normalizeForMatch(userText);
  const now = Date.now();
  if (
    normalizedUserText &&
    normalizedUserText === state.lastProcessedText &&
    now - state.lastProcessedAt < 700
  ) {
    scheduleRecognitionRestart(80);
    return;
  }
  if (isLikelyEcho(userText)) {
    scheduleRecognitionRestart(100);
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
  state.recognition.interimResults = true;
  state.recognition.maxAlternatives = 3;

  state.recognition.onresult = (event) => {
    if (state.isSpeaking || state.recognitionPauseRequested) return;
    if (state.recognitionHandledCycleId === state.recognitionCycleId) return;

    const resultIndex = typeof event.resultIndex === "number" ? event.resultIndex : event.results.length - 1;
    let finalResult = null;
    let interimText = "";
    for (let index = resultIndex; index < event.results.length; index += 1) {
      if (event.results[index].isFinal) {
        finalResult = event.results[index];
      } else {
        interimText += `${event.results[index][0]?.transcript || ""} `;
      }
    }

    if (finalResult) {
      const alternatives = Array.from(finalResult);
      const bestAlternative = alternatives.reduce((best, candidate) => (
        (candidate.confidence || 0) > (best.confidence || 0) ? candidate : best
      ), alternatives[0]);
      handleRecognizedText(bestAlternative?.transcript?.trim() || finalResult[0]?.transcript?.trim());
      return;
    }

    const cleanedInterim = interimText.trim();
    if (!cleanedInterim) return;
    state.recognitionInterimText = cleanedInterim;
    if (state.recognitionInterimTimer) clearTimeout(state.recognitionInterimTimer);
    state.recognitionInterimTimer = setTimeout(() => {
      state.recognitionInterimTimer = null;
      const textToCommit = state.recognitionInterimText;
      state.recognitionInterimText = "";
      handleRecognizedText(textToCommit);
    }, INTERIM_COMMIT_MS);
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
    const pendingInterim = state.recognitionInterimText;
    clearRecognitionInterim();
    if (pendingInterim && state.isActive && !state.isSpeaking && !state.recognitionPauseRequested) {
      handleRecognizedText(pendingInterim);
      return;
    }
    if (state.isActive && !state.isSpeaking) {
      if (state.recognitionPauseRequested) return;
      scheduleRecognitionRestart(120);
    }
  };
}

function initSettings() {
  dom.settingsToggle.addEventListener("click", (event) => {
    event.stopPropagation();
    dom.settingsPanel.classList.toggle("open");
  });

  dom.settingsPanel.addEventListener("click", (event) => {
    event.stopPropagation();
  });

  document.addEventListener("click", () => {
    dom.settingsPanel.classList.remove("open");
  });

  updateTtsStatus();
}

function initUi() {
  populateCustomDurationOptions();
  dom.langButtons.forEach((button) => {
    button.addEventListener("click", () => setLang(button.dataset.lang));
  });
  dom.pageButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setView(button.dataset.view);
    });
  });
  if (dom.firstGuideButton) {
    dom.firstGuideButton.addEventListener("click", () => setView("intro"));
  }
  if (dom.homeStartBtn) {
    dom.homeStartBtn.addEventListener("click", enterFromHome);
  }
  if (dom.durationRecommendedButton) {
    dom.durationRecommendedButton.addEventListener("click", () => {
      setDurationMode("recommended");
    });
  }
  if (dom.durationTestButton) {
    dom.durationTestButton.addEventListener("click", () => {
      setDurationMode("test");
      startTimedSession();
    });
  }
  if (dom.durationCustomInput) {
    dom.durationCustomInput.addEventListener("change", () => clearPracticeSetupError());
  }
  if (dom.durationCustomChoice) {
    dom.durationCustomChoice.addEventListener("click", openCustomDurationPicker);
  }
  if (dom.customDurationCancel) {
    dom.customDurationCancel.addEventListener("click", closeCustomDurationPicker);
  }
  if (dom.customDurationDone) {
    dom.customDurationDone.addEventListener("click", confirmCustomDuration);
  }
  if (dom.customDurationModal) {
    dom.customDurationModal.addEventListener("click", (event) => {
      if (event.target === dom.customDurationModal) closeCustomDurationPicker();
    });
  }
  dom.openingChoices.forEach((button) => {
    button.addEventListener("click", () => {
      state.openingMode = button.dataset.opening;
      clearPracticeSetupError();
      updateOpeningControls();
    });
  });
  dom.voiceChoices.forEach((button) => {
    button.addEventListener("click", () => {
      state.repetitionVoice = button.dataset.voice;
      localStorage.setItem(STORAGE_KEYS.geminiVoice, state.repetitionVoice);
      updateOpeningControls();
    });
  });
  if (dom.movementRemindersInput) {
    dom.movementRemindersInput.addEventListener("change", () => {
      state.movementRemindersEnabled = dom.movementRemindersInput.checked;
      clearPracticeSetupError();
      updateOpeningControls();
    });
  }
  if (dom.practiceBeginButton) {
    dom.practiceBeginButton.addEventListener("click", startTimedSession);
  }
  if (dom.openingSkipButton) {
    dom.openingSkipButton.addEventListener("click", completeOpeningGuidance);
  }
  if (dom.openingBeginButton) {
    dom.openingBeginButton.addEventListener("click", completeOpeningGuidance);
  }
  if (dom.groundButton) {
    dom.groundButton.addEventListener("click", triggerGrounding);
  }
  if (dom.groundEndGuidanceButton) {
    dom.groundEndGuidanceButton.addEventListener("click", endGroundingGuidance);
  }
  if (dom.practiceRemindButton) {
    dom.practiceRemindButton.addEventListener("click", openGuideFromPractice);
  }
  if (dom.practiceCompleteButton) {
    dom.practiceCompleteButton.addEventListener("click", closeSession);
  }
  if (dom.introReturnButton) {
    dom.introReturnButton.addEventListener("click", returnFromGuide);
  }
  if (dom.groundBetterButton) {
    dom.groundBetterButton.addEventListener("click", openCompletionChoicesFromSupport);
  }
  if (dom.groundMoreButton) {
    dom.groundMoreButton.addEventListener("click", showMoreSupport);
  }
  if (dom.breathingEndButton) {
    dom.breathingEndButton.addEventListener("click", endBreathingGuidance);
  }
  if (dom.supportContinueButton) {
    dom.supportContinueButton.addEventListener("click", openCompletionChoicesFromSupport);
  }
  if (dom.sessionContinueButton) {
    dom.sessionContinueButton.addEventListener("click", continueSession);
  }
  if (dom.sessionFinishButton) {
    dom.sessionFinishButton.addEventListener("click", finishClosingGuidance);
  }
  if (dom.sessionWriteButton) {
    dom.sessionWriteButton.addEventListener("click", () => openReflectPage());
  }
  if (dom.sessionEndButton) {
    dom.sessionEndButton.addEventListener("click", endSession);
  }
  if (dom.supportScreen) {
    dom.supportScreen.addEventListener("click", (event) => {
      if (event.target.closest(".support-breathing-btn, .support-action-btn")) return;
      openCompletionChoicesFromSupport();
    });
    dom.supportScreen.addEventListener("keydown", (event) => {
      if (event.target.closest(".support-breathing-btn, .support-action-btn")) return;
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openCompletionChoicesFromSupport();
      }
    });
  }
  if (dom.endScreen) {
    dom.endScreen.addEventListener("click", openFaqFromEnd);
    dom.endScreen.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openFaqFromEnd();
      }
    });
  }
  if (dom.contactCta) {
    dom.contactCta.addEventListener("click", openContactForm);
  }
  if (dom.contactBackButton) {
    dom.contactBackButton.addEventListener("click", () => setView("faq"));
  }
  if (dom.contactForm) {
    dom.contactForm.addEventListener("submit", handleContactSubmit);
  }
  if (dom.notesAddTodayButton) {
    dom.notesAddTodayButton.addEventListener("click", openTodayNotesEditor);
  }
  if (dom.notesReadButton) {
    dom.notesReadButton.addEventListener("click", openNotesList);
  }
  if (dom.reflectForm) {
    dom.reflectForm.addEventListener("submit", handleReflectSubmit);
  }
  if (dom.reflectSendButton) {
    dom.reflectSendButton.addEventListener("click", (event) => {
      event.preventDefault();
      if (dom.reflectSendButton.disabled) return;
      if (dom.reflectForm?.requestSubmit) {
        dom.reflectForm.requestSubmit();
      } else {
        handleReflectSubmit(event);
      }
    });
  }
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && state.view === "breathing") {
      setView("support");
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && dom.customDurationModal && !dom.customDurationModal.hidden) {
      closeCustomDurationPicker();
    }
  });
  window.addEventListener("pagehide", () => {
    if (state.view === "breathing") {
      clearBreathingGuidance();
    }
  });
}

function initVoices() {
  speechSynthesis.onvoiceschanged = () => {
    speechSynthesis.getVoices();
  };
  speechSynthesis.getVoices();
}

function init() {
  clearLegacyTestNotes();
  initSettings();
  initUi();
  initSpeechRecognition();
  initVoices();
  setLang(state.lang);
  setView("home");
}

init();
