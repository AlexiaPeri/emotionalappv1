const STORAGE_KEY = "emerge_beta_workspace_v1";

const defaultState = {
  checks: {},
  sessions: [],
  learningNotes: "",
  decisionNotes: "",
};

function loadState() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return { ...defaultState, ...stored };
  } catch {
    return { ...defaultState };
  }
}

let state = loadState();

const dom = {
  readiness: document.getElementById("readiness-list"),
  progress: document.getElementById("check-progress"),
  form: document.getElementById("session-form"),
  log: document.getElementById("session-log"),
  export: document.getElementById("export-sessions"),
  learning: document.getElementById("learning-notes"),
  decisions: document.getElementById("decision-notes"),
  autosave: document.getElementById("autosave-label"),
};

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  dom.autosave.textContent = "Sauvegardé";
  window.setTimeout(() => {
    dom.autosave.textContent = "Sauvegarde locale";
  }, 900);
}

function renderProgress() {
  const checks = [...dom.readiness.querySelectorAll("input[data-check]")];
  const completed = checks.filter((input) => input.checked).length;
  dom.progress.textContent = `${completed} / ${checks.length}`;
}

function renderSessions() {
  dom.log.replaceChildren();
  if (!state.sessions.length) {
    const empty = document.createElement("p");
    empty.className = "empty-log";
    empty.textContent = "Aucune session consignée pour le moment.";
    dom.log.appendChild(empty);
    return;
  }

  [...state.sessions].reverse().forEach((session) => {
    const article = document.createElement("article");
    article.className = "session-entry";
    const heading = document.createElement("div");
    const participant = document.createElement("strong");
    const metadata = document.createElement("span");
    participant.textContent = session.participant;
    metadata.textContent = `${session.date} · ${session.device} · ${session.language}`;
    heading.append(participant, metadata);
    article.appendChild(heading);
    if (session.issue) {
      const issue = document.createElement("p");
      issue.textContent = session.issue;
      article.appendChild(issue);
    }
    dom.log.appendChild(article);
  });
}

function downloadWorkspace() {
  const payload = {
    exportedAt: new Date().toISOString(),
    ...state,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `emerge-beta-workspace-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

dom.readiness.querySelectorAll("input[data-check]").forEach((input) => {
  input.checked = Boolean(state.checks[input.dataset.check]);
  input.addEventListener("change", () => {
    state.checks[input.dataset.check] = input.checked;
    renderProgress();
    saveState();
  });
});

dom.form.elements.date.value = new Date().toISOString().slice(0, 10);
dom.form.addEventListener("submit", (event) => {
  event.preventDefault();
  const session = Object.fromEntries(new FormData(dom.form));
  session.createdAt = new Date().toISOString();
  state.sessions.push(session);
  saveState();
  renderSessions();
  dom.form.reset();
  dom.form.elements.date.value = new Date().toISOString().slice(0, 10);
  dom.form.elements.participant.focus();
});

dom.learning.value = state.learningNotes;
dom.decisions.value = state.decisionNotes;
[dom.learning, dom.decisions].forEach((textarea) => {
  textarea.addEventListener("input", () => {
    state.learningNotes = dom.learning.value;
    state.decisionNotes = dom.decisions.value;
    saveState();
  });
});

dom.export.addEventListener("click", downloadWorkspace);
renderProgress();
renderSessions();
