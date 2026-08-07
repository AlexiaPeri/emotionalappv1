const STORAGE_KEY = "emerge_beta_questionnaire_v1";

const COPY = {
  en: {
    eyebrow: "Beta feedback",
    title: "Tell us what actually happened.",
    intro: "This takes about 8 minutes. We are testing the product, not you. Please be direct: confusion and problems are especially useful.",
    privacy: "You never need to describe the emotion you worked with. Your draft stays on this device until you export or copy it.",
    contextTitle: "About this test",
    contextLead: "Use the participant code provided by the researcher. Do not enter your full name.",
    participant: "Participant code",
    build: "App build",
    device: "iPhone model",
    ios: "iOS version",
    testLanguage: "Language used in the app",
    audioSetup: "Audio setup",
    speaker: "Phone speaker",
    headphones: "Headphones",
    consent: "I am 18 or older, I understand this is an experimental wellness product rather than a crisis or medical service, and I can stop at any time.",
    onboardingTitle: "Getting started",
    onboardingLead: "Think about the moments before the practice began.",
    firstSession: "Was this your first Emerge session?",
    understood: "Before starting, I understood what the practice asked me to do.",
    startEase: "Starting the session felt easy.",
    unclear: "What, if anything, was unclear before you started?",
    voiceTitle: "The voice loop",
    voiceLead: "Focus on what the app heard and repeated, not on the content of what you said.",
    duration: "How long was your session?",
    choose: "Choose",
    recognition: "The app correctly recognised my words.",
    pronouns: "The app changed pronouns correctly when repeating my words.",
    speed: "The repetition arrived quickly enough to keep the flow.",
    naturalVoice: "The repeating voice felt natural and comfortable to hear.",
    interruptions: "Did the voice loop stop or fail?",
    none: "No",
    once: "Once, then it recovered",
    several: "Several times",
    blocked: "Yes, I could not continue",
    technicalDetails: "Describe any recognition, pronoun, delay or audio problem.",
    controlTitle: "Control and support",
    controlLead: "We want the app to remain clear even during an intense moment.",
    controlClarity: "I knew how to review instructions, get support or end the session.",
    usedSupport: "Did you use the support flow?",
    supportNo: "No",
    supportOpened: "I opened it briefly",
    supportCompleted: "I completed the guidance",
    supportAccidental: "I opened it accidentally",
    supportCalm: "The support experience felt calm and easy to follow.",
    closing: "The closing felt smooth and gave me enough time to transition out.",
    lessControl: "At any point, did the app make you feel less in control?",
    controlDetails: "Tell us what happened, without sharing anything private.",
    valueTitle: "Value and next use",
    valueLead: "There is no expected emotional outcome. We want your honest experience.",
    contact: "The practice helped me stay in contact with what I was feeling.",
    reuse: "I can imagine using Emerge on my own again.",
    privacyConfidence: "I felt confident about how my voice and notes were handled.",
    overallEase: "Overall, how easy or difficult was this session?",
    useMoment: "In what kind of moment could you imagine reaching for Emerge?",
    mostUseful: "What felt most useful?",
    mostDifficult: "What felt most frustrating, awkward or difficult?",
    oneChange: "If you could change one thing before your next session, what would it be?",
    testAgain: "Would you be willing to test another version?",
    yes: "Yes",
    no: "No",
    maybe: "Maybe",
    preferNot: "Prefer not to say",
    stronglyDisagree: "Strongly disagree",
    stronglyAgree: "Strongly agree",
    veryDifficult: "Very difficult",
    veryEasy: "Very easy",
    never: "Never",
    consistently: "Consistently",
    notConfident: "Not confident",
    veryConfident: "Very confident",
    back: "Back",
    next: "Continue",
    finish: "Finish",
    completeEyebrow: "Response complete",
    completeTitle: "Thank you for being honest.",
    completeBody: "Your response is ready. Download it or copy it, then send it to the person who invited you to test.",
    download: "Download response",
    copy: "Copy response",
    copied: "Response copied.",
    required: "Please answer the highlighted question before continuing.",
    stepNames: ["Context", "Getting started", "Voice loop", "Control", "Value"],
  },
  fr: {
    eyebrow: "Retour de bêta-test",
    title: "Raconte-nous ce qui s'est réellement passé.",
    intro: "Cela prend environ 8 minutes. Nous testons le produit, pas toi. Sois direct·e : les confusions et les problèmes nous sont particulièrement utiles.",
    privacy: "Tu n'as jamais besoin de décrire l'émotion travaillée. Ton brouillon reste sur cet appareil jusqu'à ce que tu l'exportes ou le copies.",
    contextTitle: "À propos de ce test",
    contextLead: "Utilise le code donné par la personne qui organise le test. N'indique pas ton nom complet.",
    participant: "Code participant",
    build: "Build de l'app",
    device: "Modèle d'iPhone",
    ios: "Version d'iOS",
    testLanguage: "Langue utilisée dans l'app",
    audioSetup: "Écoute du son",
    speaker: "Haut-parleur du téléphone",
    headphones: "Écouteurs ou casque",
    consent: "J'ai 18 ans ou plus, je comprends qu'il s'agit d'un produit de bien-être expérimental et non d'un service médical ou de crise, et je peux arrêter à tout moment.",
    onboardingTitle: "Commencer",
    onboardingLead: "Pense aux instants qui ont précédé le début de la pratique.",
    firstSession: "Était-ce ta première session Emerge ?",
    understood: "Avant de commencer, j'avais compris ce que la pratique me demandait de faire.",
    startEase: "Commencer la session était facile.",
    unclear: "Qu'est-ce qui, éventuellement, n'était pas clair avant de commencer ?",
    voiceTitle: "La boucle vocale",
    voiceLead: "Pense à ce que l'app a entendu et répété, sans raconter le contenu de tes phrases.",
    duration: "Combien de temps a duré ta session ?",
    choose: "Choisir",
    recognition: "L'app a correctement reconnu mes mots.",
    pronouns: "L'app a correctement changé les pronoms en répétant mes mots.",
    speed: "La répétition arrivait assez vite pour maintenir la continuité.",
    naturalVoice: "La voix de répétition semblait naturelle et agréable à entendre.",
    interruptions: "La boucle vocale s'est-elle arrêtée ou a-t-elle échoué ?",
    none: "Non",
    once: "Une fois, puis elle a repris",
    several: "Plusieurs fois",
    blocked: "Oui, je n'ai pas pu continuer",
    technicalDetails: "Décris tout problème de reconnaissance, de pronoms, de délai ou d'audio.",
    controlTitle: "Contrôle et soutien",
    controlLead: "L'app doit rester claire, même pendant un moment intense.",
    controlClarity: "Je savais comment revoir les instructions, demander de l'aide ou terminer la session.",
    usedSupport: "As-tu utilisé le parcours de soutien ?",
    supportNo: "Non",
    supportOpened: "Je l'ai ouvert brièvement",
    supportCompleted: "J'ai suivi toute la guidance",
    supportAccidental: "Je l'ai ouvert par erreur",
    supportCalm: "Le parcours de soutien était calme et facile à suivre.",
    closing: "La clôture était fluide et me laissait assez de temps pour sortir de la pratique.",
    lessControl: "À un moment, l'app t'a-t-elle donné l'impression d'avoir moins de contrôle ?",
    controlDetails: "Raconte ce qui s'est passé, sans partager quoi que ce soit de privé.",
    valueTitle: "Valeur et prochaine utilisation",
    valueLead: "Aucun résultat émotionnel n'est attendu. Nous voulons connaître ton expérience honnête.",
    contact: "La pratique m'a aidé·e à rester au contact de ce que je ressentais.",
    reuse: "Je peux imaginer réutiliser Emerge seul·e.",
    privacyConfidence: "J'avais confiance dans la manière dont ma voix et mes notes étaient traitées.",
    overallEase: "Globalement, cette session était-elle facile ou difficile ?",
    useMoment: "Dans quel type de moment pourrais-tu imaginer ouvrir Emerge ?",
    mostUseful: "Qu'est-ce qui t'a semblé le plus utile ?",
    mostDifficult: "Qu'est-ce qui t'a semblé le plus frustrant, gênant ou difficile ?",
    oneChange: "Si tu pouvais changer une chose avant ta prochaine session, laquelle ?",
    testAgain: "Accepterais-tu de tester une autre version ?",
    yes: "Oui",
    no: "Non",
    maybe: "Peut-être",
    preferNot: "Je préfère ne pas répondre",
    stronglyDisagree: "Pas du tout d'accord",
    stronglyAgree: "Tout à fait d'accord",
    veryDifficult: "Très difficile",
    veryEasy: "Très facile",
    never: "Jamais",
    consistently: "Toujours",
    notConfident: "Pas confiance",
    veryConfident: "Tout à fait confiance",
    back: "Retour",
    next: "Continuer",
    finish: "Terminer",
    completeEyebrow: "Réponse terminée",
    completeTitle: "Merci pour ton honnêteté.",
    completeBody: "Ta réponse est prête. Télécharge-la ou copie-la, puis envoie-la à la personne qui t'a invité·e au test.",
    download: "Télécharger la réponse",
    copy: "Copier la réponse",
    copied: "Réponse copiée.",
    required: "Réponds à la question indiquée avant de continuer.",
    stepNames: ["Contexte", "Prise en main", "Boucle vocale", "Contrôle", "Valeur"],
  },
};

const RESPONSE_LABELS = {
  participantCode: "Participant",
  appBuild: "Build",
  device: "Device",
  iosVersion: "iOS",
  appLanguage: "App language",
  audioSetup: "Audio setup",
  consent: "Consent",
  firstSession: "First session",
  understood: "Understood practice (1-7)",
  startEase: "Starting ease (1-7)",
  onboardingUnclear: "Unclear before start",
  sessionDuration: "Session duration",
  recognition: "Recognition (1-7)",
  pronouns: "Pronoun accuracy (1-7)",
  speed: "Repetition speed (1-7)",
  naturalVoice: "Voice naturalness (1-7)",
  interruptions: "Interruptions",
  technicalDetails: "Technical details",
  controlClarity: "Control clarity (1-7)",
  usedSupport: "Used support",
  supportCalm: "Support calmness (1-7)",
  closing: "Closing quality (1-7)",
  lessControl: "Felt less in control",
  controlDetails: "Control details",
  contact: "Stayed in contact (1-7)",
  reuse: "Would reuse (1-7)",
  privacyConfidence: "Privacy confidence (1-7)",
  overallEase: "Overall ease (1-7)",
  useMoment: "Potential use moment",
  mostUseful: "Most useful",
  mostDifficult: "Most difficult",
  oneChange: "One change",
  testAgain: "Test again",
};

const form = document.getElementById("beta-questionnaire");
const steps = [...document.querySelectorAll(".form-step")];
const previousButton = document.getElementById("previous-step");
const nextButton = document.getElementById("next-step");
const submitButton = document.getElementById("submit-questionnaire");
const progressBar = document.getElementById("progress-bar");
const progressLabel = document.getElementById("progress-label");
const progressName = document.getElementById("progress-name");
const completionPanel = document.getElementById("completion-panel");
const supportSelect = document.getElementById("used-support");
const supportRating = document.getElementById("support-rating");
const copyStatus = document.getElementById("copy-status");

let language = "en";
let currentStep = 0;
let submittedResponse = null;

function buildScales() {
  document.querySelectorAll(".scale-field").forEach((fieldset) => {
    const name = fieldset.dataset.scaleName;
    const container = fieldset.querySelector(".scale-options");
    for (let value = 1; value <= 7; value += 1) {
      const label = document.createElement("label");
      const input = document.createElement("input");
      const number = document.createElement("span");
      input.type = "radio";
      input.name = name;
      input.value = String(value);
      input.required = true;
      number.textContent = String(value);
      label.append(input, number);
      container.appendChild(label);
    }
  });
}

function getDraft() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function collectValues() {
  const values = {};
  new FormData(form).forEach((value, key) => {
    values[key] = value;
  });
  return values;
}

function saveDraft() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ language, values: collectValues() }));
}

function restoreDraft() {
  const draft = getDraft();
  language = draft.language === "fr" ? "fr" : "en";
  Object.entries(draft.values || {}).forEach(([name, value]) => {
    const fields = [...form.elements].filter((field) => field.name === name);
    fields.forEach((field) => {
      if (field.type === "radio" || field.type === "checkbox") field.checked = field.value === value || value === "on";
      else field.value = value;
    });
  });
}

function setLanguage(nextLanguage) {
  language = nextLanguage;
  document.documentElement.lang = language;
  document.querySelectorAll("[data-language]").forEach((button) => {
    button.classList.toggle("active", button.dataset.language === language);
  });
  document.querySelectorAll("[data-copy]").forEach((element) => {
    const value = COPY[language][element.dataset.copy];
    if (value) element.textContent = value;
  });
  updateStep();
  saveDraft();
}

function updateStep() {
  steps.forEach((step, index) => step.classList.toggle("active", index === currentStep));
  previousButton.hidden = currentStep === 0;
  nextButton.hidden = currentStep === steps.length - 1;
  submitButton.hidden = currentStep !== steps.length - 1;
  progressLabel.textContent = `${currentStep + 1} / ${steps.length}`;
  progressName.textContent = COPY[language].stepNames[currentStep];
  progressBar.style.width = `${((currentStep + 1) / steps.length) * 100}%`;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function validateCurrentStep() {
  const requiredFields = [...steps[currentStep].querySelectorAll("[required]:not(:disabled)")];
  const invalid = requiredFields.find((field) => !field.checkValidity());
  if (!invalid) return true;
  invalid.reportValidity();
  invalid.closest("label, fieldset")?.classList.add("has-error");
  window.setTimeout(() => invalid.closest("label, fieldset")?.classList.remove("has-error"), 1400);
  return false;
}

function toggleSupportRating() {
  const relevant = supportSelect.value && supportSelect.value !== "no";
  supportRating.hidden = !relevant;
  supportRating.querySelectorAll("input").forEach((input) => {
    input.disabled = !relevant;
  });
}

function responsePayload() {
  return {
    questionnaireVersion: 1,
    submittedAt: new Date().toISOString(),
    questionnaireLanguage: language,
    responses: collectValues(),
  };
}

function responseAsText(payload) {
  return [
    "Emerge beta feedback",
    `Submitted: ${payload.submittedAt}`,
    `Questionnaire language: ${payload.questionnaireLanguage.toUpperCase()}`,
    "",
    ...Object.entries(payload.responses).map(([key, value]) => `${RESPONSE_LABELS[key] || key}: ${value}`),
  ].join("\n");
}

function downloadResponse() {
  if (!submittedResponse) return;
  const code = submittedResponse.responses.participantCode || "anonymous";
  const blob = new Blob([JSON.stringify(submittedResponse, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `emerge-beta-${code}-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

async function copyResponse() {
  if (!submittedResponse) return;
  await navigator.clipboard.writeText(responseAsText(submittedResponse));
  copyStatus.textContent = COPY[language].copied;
}

buildScales();
restoreDraft();
setLanguage(language);
toggleSupportRating();

document.querySelectorAll("[data-language]").forEach((button) => {
  button.addEventListener("click", () => setLanguage(button.dataset.language));
});
form.addEventListener("input", saveDraft);
form.addEventListener("change", saveDraft);
supportSelect.addEventListener("change", toggleSupportRating);
nextButton.addEventListener("click", () => {
  if (!validateCurrentStep()) return;
  currentStep += 1;
  updateStep();
});
previousButton.addEventListener("click", () => {
  currentStep -= 1;
  updateStep();
});
form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!validateCurrentStep()) return;
  submittedResponse = responsePayload();
  form.hidden = true;
  document.querySelector(".progress-wrap").hidden = true;
  completionPanel.hidden = false;
  localStorage.removeItem(STORAGE_KEY);
  window.scrollTo({ top: 0, behavior: "smooth" });
});
document.getElementById("download-response").addEventListener("click", downloadResponse);
document.getElementById("copy-response").addEventListener("click", () => {
  copyResponse().catch(() => {
    copyStatus.textContent = responseAsText(submittedResponse);
  });
});
