export const GEMINI_TTS_MODELS = [
  {
    id: "gemini-3.8-flash-tts",
    label: "3.8 Flash",
    description: "Best voice fidelity",
  },
  {
    id: "gemini-3.8-flash-lite-tts",
    label: "3.8 Flash-Lite",
    description: "Lowest latency",
  },
];

export const GEMINI_TTS_VOICES = [
  { id: "Achernar", gender: "Female", quality: "Soft" },
  { id: "Vindemiatrix", gender: "Female", quality: "Gentle" },
  { id: "Sulafat", gender: "Female", quality: "Warm" },
  { id: "Callirrhoe", gender: "Female", quality: "Easy-going" },
  { id: "Achird", gender: "Male", quality: "Friendly" },
  { id: "Algieba", gender: "Male", quality: "Smooth" },
  { id: "Umbriel", gender: "Male", quality: "Easy-going" },
  { id: "Iapetus", gender: "Male", quality: "Clear" },
];

export const GEMINI_TTS_SAMPLES = [
  "You feel angry.",
  "You don't know what to do.",
  "You feel like nobody really sees you.",
];

export const GEMINI_TTS_STORAGE = {
  model: "emerge_gemini_tts_model",
  voice: "emerge_gemini_tts_voice",
};

export function getSavedGeminiSelection() {
  const savedModel = localStorage.getItem(GEMINI_TTS_STORAGE.model);
  const savedVoice = localStorage.getItem(GEMINI_TTS_STORAGE.voice);
  return {
    model: GEMINI_TTS_MODELS.some(({ id }) => id === savedModel) ? savedModel : GEMINI_TTS_MODELS[0].id,
    voice: GEMINI_TTS_VOICES.some(({ id }) => id === savedVoice) ? savedVoice : GEMINI_TTS_VOICES[0].id,
  };
}
