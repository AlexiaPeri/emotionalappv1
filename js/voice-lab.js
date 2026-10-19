import {
  GEMINI_TTS_MODELS,
  GEMINI_TTS_SAMPLES,
  GEMINI_TTS_STORAGE,
  GEMINI_TTS_VOICES,
  getSavedGeminiSelection,
} from "./gemini-tts-config.js";

const dom = {
  modelOptions: document.getElementById("model-options"),
  sampleSelect: document.getElementById("sample-select"),
  status: document.getElementById("lab-status"),
  femaleVoices: document.getElementById("female-voices"),
  maleVoices: document.getElementById("male-voices"),
};

const saved = getSavedGeminiSelection();
const AUDIO_CACHE_NAME = "emerge-voice-lab-v1";
const state = {
  model: saved.model,
  voice: saved.voice,
  activeAudio: null,
  activeButton: null,
  requestController: null,
};

function getAudioCacheRequest(voice) {
  const url = new URL("/__emerge_voice_lab_cache__", window.location.origin);
  url.searchParams.set("model", state.model);
  url.searchParams.set("voice", voice.id);
  url.searchParams.set("text", dom.sampleSelect.value);
  return new Request(url.toString());
}

async function getCachedAudio(voice) {
  if (!("caches" in window)) return null;
  try {
    const cache = await caches.open(AUDIO_CACHE_NAME);
    const response = await cache.match(getAudioCacheRequest(voice));
    return response ? response.blob() : null;
  } catch {
    return null;
  }
}

async function cacheAudio(voice, audioBlob) {
  if (!("caches" in window)) return;
  try {
    const cache = await caches.open(AUDIO_CACHE_NAME);
    await cache.put(
      getAudioCacheRequest(voice),
      new Response(audioBlob, { headers: { "Content-Type": audioBlob.type || "audio/wav" } })
    );
  } catch {
    // A disabled or full browser cache should never prevent playback.
  }
}

function setStatus(message, tone = "") {
  dom.status.textContent = message;
  dom.status.dataset.tone = tone;
}

function stopPlayback() {
  state.requestController?.abort();
  state.requestController = null;
  if (state.activeAudio) {
    state.activeAudio.pause();
    if (state.activeAudio.src.startsWith("blob:")) URL.revokeObjectURL(state.activeAudio.src);
    state.activeAudio = null;
  }
  if (state.activeButton) {
    state.activeButton.disabled = false;
    state.activeButton.textContent = "Listen";
    state.activeButton = null;
  }
}

function renderModelOptions() {
  dom.modelOptions.innerHTML = "";
  GEMINI_TTS_MODELS.forEach((model) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "model-option";
    button.classList.toggle("is-selected", model.id === state.model);
    button.innerHTML = `<strong>${model.label}</strong><small>${model.description}</small>`;
    button.addEventListener("click", () => {
      stopPlayback();
      state.model = model.id;
      localStorage.setItem(GEMINI_TTS_STORAGE.model, state.model);
      renderModelOptions();
      setStatus(`${model.label} selected. Choose a voice to listen.`, "ready");
    });
    dom.modelOptions.appendChild(button);
  });
}

function updateSelectedVoice() {
  document.querySelectorAll(".voice-card").forEach((card) => {
    const selected = card.dataset.voice === state.voice;
    card.classList.toggle("is-selected", selected);
    const selectButton = card.querySelector(".select-voice");
    selectButton.textContent = selected ? "Selected" : "Choose this voice";
    selectButton.setAttribute("aria-pressed", String(selected));
  });
}

async function playVoice(voice, button) {
  stopPlayback();
  state.requestController = new AbortController();
  state.activeButton = button;
  button.disabled = true;
  button.textContent = "Preparing…";
  setStatus(`Generating ${voice.id} with ${GEMINI_TTS_MODELS.find(({ id }) => id === state.model)?.label}…`, "loading");

  try {
    let audioBlob = await getCachedAudio(voice);
    const cached = Boolean(audioBlob);

    if (!audioBlob) {
      const response = await fetch("./api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: dom.sampleSelect.value,
          model: state.model,
          voice: voice.id,
          style: "grounded",
        }),
        signal: state.requestController.signal,
      });

      if (!response.ok) {
        const details = await response.json().catch(() => ({}));
        throw new Error(details.error || `Voice service returned ${response.status}.`);
      }

      audioBlob = await response.blob();
      await cacheAudio(voice, audioBlob);
    }

    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    state.activeAudio = audio;
    button.textContent = "Playing…";
    setStatus(`Listening to ${voice.id}${cached ? " · saved preview" : ""}.`, "playing");

    await new Promise((resolve, reject) => {
      audio.onended = resolve;
      audio.onerror = () => reject(new Error("The audio could not be played."));
      audio.play().catch(reject);
    });

    setStatus(`${voice.id} finished. Try another voice or select this one.`, "ready");
  } catch (error) {
    if (error.name !== "AbortError") {
      setStatus(error.message || "The voice could not be generated.", "error");
    }
  } finally {
    if (state.activeAudio?.src?.startsWith("blob:")) URL.revokeObjectURL(state.activeAudio.src);
    state.activeAudio = null;
    state.requestController = null;
    if (state.activeButton === button) {
      button.disabled = false;
      button.textContent = "Listen";
      state.activeButton = null;
    }
  }
}

function createVoiceCard(voice) {
  const article = document.createElement("article");
  article.className = "voice-card";
  article.dataset.voice = voice.id;

  const heading = document.createElement("div");
  heading.className = "voice-card-heading";
  heading.innerHTML = `<div><h3>${voice.id}</h3><p>${voice.quality}</p></div><span>${voice.gender}</span>`;

  const actions = document.createElement("div");
  actions.className = "voice-actions";

  const listenButton = document.createElement("button");
  listenButton.type = "button";
  listenButton.className = "listen-voice";
  listenButton.textContent = "Listen";
  listenButton.addEventListener("click", () => playVoice(voice, listenButton));

  const selectButton = document.createElement("button");
  selectButton.type = "button";
  selectButton.className = "select-voice";
  selectButton.addEventListener("click", () => {
    state.voice = voice.id;
    localStorage.setItem(GEMINI_TTS_STORAGE.voice, state.voice);
    updateSelectedVoice();
    setStatus(`${voice.id} is now your selected Emerge voice.`, "selected");
  });

  actions.append(listenButton, selectButton);
  article.append(heading, actions);
  return article;
}

function renderVoices() {
  dom.femaleVoices.innerHTML = "";
  dom.maleVoices.innerHTML = "";
  GEMINI_TTS_VOICES.forEach((voice) => {
    const target = voice.gender === "Female" ? dom.femaleVoices : dom.maleVoices;
    target.appendChild(createVoiceCard(voice));
  });
  updateSelectedVoice();
}

function initSamples() {
  GEMINI_TTS_SAMPLES.forEach((sample) => {
    const option = document.createElement("option");
    option.value = sample;
    option.textContent = sample;
    dom.sampleSelect.appendChild(option);
  });
  dom.sampleSelect.addEventListener("change", () => {
    stopPlayback();
    setStatus("Phrase changed. Choose a voice to listen.", "ready");
  });
}

renderModelOptions();
initSamples();
renderVoices();
