import {
  WRITING_CATEGORIES,
  WRITING_ITEMS,
  WRITING_PRIORITIES,
  WRITING_STATUSES,
} from "./writing-content.js";

const STORAGE_KEY = "emerge_writing_studio_v1";
const SAVE_DELAY_MS = 280;

const dom = {
  studio: document.getElementById("writing-studio"),
  sidebar: document.getElementById("studio-sidebar"),
  sidebarToggle: document.getElementById("sidebar-toggle"),
  list: document.getElementById("writing-list"),
  search: document.getElementById("writing-search"),
  priorityTabs: [...document.querySelectorAll("[data-priority]")],
  languageButtons: [...document.querySelectorAll("[data-writing-lang]")],
  progressValue: document.getElementById("progress-value"),
  progressBar: document.getElementById("progress-bar"),
  progressDetail: document.getElementById("progress-detail"),
  toolbarCategory: document.getElementById("toolbar-category"),
  toolbarPosition: document.getElementById("toolbar-position"),
  kind: document.getElementById("item-kind"),
  priority: document.getElementById("item-priority"),
  format: document.getElementById("item-format"),
  title: document.getElementById("item-title"),
  objective: document.getElementById("item-objective"),
  prompts: document.getElementById("item-prompts"),
  editor: document.getElementById("writing-editor"),
  status: document.getElementById("status-select"),
  count: document.getElementById("document-count"),
  saveState: document.getElementById("save-state"),
  copyButton: document.getElementById("copy-button"),
  restoreButton: document.getElementById("restore-button"),
  previousButton: document.getElementById("previous-button"),
  nextButton: document.getElementById("next-button"),
  documentPosition: document.getElementById("document-position"),
  focusToggle: document.getElementById("focus-toggle"),
  exportButton: document.getElementById("export-button"),
  toast: document.getElementById("studio-toast"),
};

const fallbackState = {
  version: 1,
  activeItemId: WRITING_ITEMS[0].id,
  language: "fr",
  priority: "now",
  drafts: {},
  statuses: {},
};

let state = loadState();
let saveTimer = null;
let toastTimer = null;

function loadState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!parsed || parsed.version !== 1) return structuredClone(fallbackState);
    return {
      ...structuredClone(fallbackState),
      ...parsed,
      drafts: parsed.drafts || {},
      statuses: parsed.statuses || {},
    };
  } catch {
    return structuredClone(fallbackState);
  }
}

function saveState() {
  clearTimeout(saveTimer);
  saveTimer = null;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  dom.saveState.textContent = "Sauvegardé";
}

function scheduleSave() {
  clearTimeout(saveTimer);
  dom.saveState.textContent = "Sauvegarde…";
  saveTimer = setTimeout(saveState, SAVE_DELAY_MS);
}

function activeItem() {
  return WRITING_ITEMS.find((item) => item.id === state.activeItemId) || WRITING_ITEMS[0];
}

function itemDraft(item, language = state.language) {
  return state.drafts[item.id]?.[language] ?? item.initial[language] ?? "";
}

function itemStatus(item, language = state.language) {
  return state.statuses[item.id]?.[language] ?? item.initialStatus ?? "write";
}

function setDraft(item, language, value) {
  state.drafts[item.id] ||= {};
  state.drafts[item.id][language] = value;
}

function setStatus(item, language, value) {
  state.statuses[item.id] ||= {};
  state.statuses[item.id][language] = value;
}

function categoryLabel(categoryId) {
  return WRITING_CATEGORIES.find((category) => category.id === categoryId)?.label || categoryId;
}

function statusLabel(statusId) {
  return WRITING_STATUSES.find((status) => status.id === statusId)?.label || statusId;
}

function filteredItems() {
  const query = dom.search.value.trim().toLocaleLowerCase("fr");
  return WRITING_ITEMS.filter((item) => {
    const priorityMatches = state.priority === "all" || item.priority === state.priority;
    if (!priorityMatches) return false;
    if (!query) return true;
    const searchable = [
      item.title,
      item.objective,
      item.kind,
      categoryLabel(item.category),
    ].join(" ").toLocaleLowerCase("fr");
    return searchable.includes(query);
  });
}

function updateProgress() {
  const total = WRITING_ITEMS.length * 2;
  const finalCount = WRITING_ITEMS.reduce((count, item) => (
    count
      + Number(itemStatus(item, "fr") === "final")
      + Number(itemStatus(item, "en") === "final")
  ), 0);
  const percentage = total ? Math.round((finalCount / total) * 100) : 0;

  dom.progressValue.textContent = `${finalCount} / ${total}`;
  dom.progressBar.style.width = `${percentage}%`;
  dom.progressDetail.textContent = finalCount
    ? `${percentage}% des versions FR et EN sont validées`
    : "Aucun texte validé pour le moment";
}

function renderList() {
  const items = filteredItems();
  dom.list.replaceChildren();

  if (!items.length) {
    const empty = document.createElement("p");
    empty.className = "empty-list";
    empty.textContent = "Aucun texte ne correspond à cette recherche.";
    dom.list.appendChild(empty);
    return;
  }

  WRITING_CATEGORIES.forEach((category) => {
    const categoryItems = items.filter((item) => item.category === category.id);
    if (!categoryItems.length) return;

    const group = document.createElement("section");
    group.className = "list-group";

    const heading = document.createElement("h2");
    heading.textContent = category.label;
    group.appendChild(heading);

    categoryItems.forEach((item) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "writing-list-button";
      button.classList.toggle("is-active", item.id === state.activeItemId);
      button.dataset.itemId = item.id;

      const mark = document.createElement("span");
      mark.className = "status-mark";
      mark.dataset.status = itemStatus(item);
      mark.setAttribute("aria-hidden", "true");

      const copy = document.createElement("span");
      copy.className = "list-button-copy";

      const title = document.createElement("strong");
      title.textContent = item.title;

      const detail = document.createElement("span");
      detail.textContent = `${item.kind} · ${WRITING_PRIORITIES[item.priority].shortLabel}`;

      const languageProgress = document.createElement("span");
      languageProgress.className = "language-progress";
      const finalLanguages = ["fr", "en"].filter((lang) => itemStatus(item, lang) === "final").length;
      languageProgress.textContent = `${finalLanguages}/2`;
      languageProgress.title = `${finalLanguages} langue${finalLanguages > 1 ? "s" : ""} validée${finalLanguages > 1 ? "s" : ""}`;

      copy.append(title, detail);
      button.append(mark, copy, languageProgress);
      button.addEventListener("click", () => selectItem(item.id));
      group.appendChild(button);
    });

    dom.list.appendChild(group);
  });
}

function renderStatusOptions() {
  dom.status.replaceChildren();
  WRITING_STATUSES.forEach((status) => {
    const option = document.createElement("option");
    option.value = status.id;
    option.textContent = status.label;
    dom.status.appendChild(option);
  });
}

function renderDocument() {
  const item = activeItem();
  const category = categoryLabel(item.category);
  const position = WRITING_ITEMS.findIndex((candidate) => candidate.id === item.id) + 1;

  dom.toolbarCategory.textContent = category;
  dom.toolbarPosition.textContent = `${position} sur ${WRITING_ITEMS.length}`;
  dom.kind.textContent = item.kind;
  dom.priority.textContent = WRITING_PRIORITIES[item.priority].label;
  dom.format.textContent = item.formatHint;
  dom.title.textContent = item.title;
  dom.objective.textContent = item.objective;
  dom.editor.value = itemDraft(item);
  dom.editor.placeholder = state.language === "fr"
    ? "Écris librement ici…"
    : "Write freely here…";
  dom.status.value = itemStatus(item);

  dom.prompts.replaceChildren();
  item.prompts.forEach((prompt) => {
    const listItem = document.createElement("li");
    listItem.textContent = prompt;
    dom.prompts.appendChild(listItem);
  });

  const currentItems = filteredItems();
  const currentIndex = currentItems.findIndex((candidate) => candidate.id === item.id);
  dom.documentPosition.textContent = currentIndex >= 0
    ? `${currentIndex + 1} / ${currentItems.length}`
    : `${position} / ${WRITING_ITEMS.length}`;
  dom.previousButton.disabled = currentIndex <= 0;
  dom.nextButton.disabled = currentIndex < 0 || currentIndex >= currentItems.length - 1;
  dom.restoreButton.disabled = !(item.initial[state.language] || "").trim();

  dom.languageButtons.forEach((button) => {
    const active = button.dataset.writingLang === state.language;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  updateCount();
  renderList();
  updateProgress();
}

function selectItem(itemId) {
  if (!WRITING_ITEMS.some((item) => item.id === itemId)) return;
  if (saveTimer) saveState();
  state.activeItemId = itemId;
  saveState();
  renderDocument();
  document.body.classList.remove("sidebar-open");
  dom.editor.focus({ preventScroll: true });
}

function selectLanguage(language) {
  if (!["fr", "en"].includes(language) || state.language === language) return;
  if (saveTimer) saveState();
  state.language = language;
  saveState();
  renderDocument();
}

function selectPriority(priority) {
  state.priority = priority;
  dom.priorityTabs.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.priority === priority);
  });

  const items = filteredItems();
  if (items.length && !items.some((item) => item.id === state.activeItemId)) {
    state.activeItemId = items[0].id;
  }
  saveState();
  renderDocument();
}

function updateCount() {
  const text = dom.editor.value.trim();
  const words = text ? text.split(/\s+/u).length : 0;
  const characters = dom.editor.value.length;
  dom.count.textContent = `${words} mot${words > 1 ? "s" : ""} · ${characters} caractère${characters > 1 ? "s" : ""}`;
}

function moveDocument(offset) {
  const items = filteredItems();
  const index = items.findIndex((item) => item.id === state.activeItemId);
  const target = items[index + offset];
  if (target) selectItem(target.id);
}

function showToast(message) {
  clearTimeout(toastTimer);
  dom.toast.textContent = message;
  dom.toast.classList.add("is-visible");
  toastTimer = setTimeout(() => dom.toast.classList.remove("is-visible"), 2200);
}

async function copyCurrentText() {
  try {
    await navigator.clipboard.writeText(dom.editor.value);
    showToast("Texte copié");
  } catch {
    showToast("La copie n’a pas fonctionné");
  }
}

function restoreCurrentText() {
  const item = activeItem();
  const initial = item.initial[state.language] || "";
  if (!initial.trim()) return;
  const confirmed = window.confirm("Remplacer ce brouillon par le texte actuellement présent dans l’app ?");
  if (!confirmed) return;
  dom.editor.value = initial;
  setDraft(item, state.language, initial);
  setStatus(item, state.language, item.initialStatus);
  saveState();
  renderDocument();
  showToast("Texte actuel restauré");
}

function exportMarkdown() {
  if (saveTimer) saveState();
  const date = new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date());
  const sections = [
    "# Emerge · Export du studio d’écriture",
    "",
    `Exporté le ${date}.`,
    "",
  ];

  Object.keys(WRITING_PRIORITIES).forEach((priorityId) => {
    const priorityItems = WRITING_ITEMS.filter((item) => item.priority === priorityId);
    sections.push(`## ${WRITING_PRIORITIES[priorityId].label}`, "");

    priorityItems.forEach((item) => {
      sections.push(
        `### ${item.title}`,
        "",
        `**Objectif :** ${item.objective}`,
        "",
        `**FR · ${statusLabel(itemStatus(item, "fr"))}**`,
        "",
        itemDraft(item, "fr") || "_À écrire_",
        "",
        `**EN · ${statusLabel(itemStatus(item, "en"))}**`,
        "",
        itemDraft(item, "en") || "_To write_",
        "",
      );
    });
  });

  const blob = new Blob([sections.join("\n")], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const stamp = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.download = `emerge-textes-${stamp}.md`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showToast("Export Markdown téléchargé");
}

function initEvents() {
  dom.editor.addEventListener("input", () => {
    const item = activeItem();
    setDraft(item, state.language, dom.editor.value);
    if (itemStatus(item) === "write" && dom.editor.value.trim()) {
      setStatus(item, state.language, "draft");
      dom.status.value = "draft";
    }
    updateCount();
    updateProgress();
    renderList();
    scheduleSave();
  });

  dom.status.addEventListener("change", () => {
    setStatus(activeItem(), state.language, dom.status.value);
    saveState();
    renderList();
    updateProgress();
  });

  dom.languageButtons.forEach((button) => {
    button.addEventListener("click", () => selectLanguage(button.dataset.writingLang));
  });

  dom.priorityTabs.forEach((button) => {
    button.addEventListener("click", () => selectPriority(button.dataset.priority));
  });

  dom.search.addEventListener("input", () => {
    const items = filteredItems();
    if (items.length && !items.some((item) => item.id === state.activeItemId)) {
      state.activeItemId = items[0].id;
      renderDocument();
      return;
    }
    renderList();
    renderDocumentNavigation();
  });

  dom.previousButton.addEventListener("click", () => moveDocument(-1));
  dom.nextButton.addEventListener("click", () => moveDocument(1));
  dom.copyButton.addEventListener("click", copyCurrentText);
  dom.restoreButton.addEventListener("click", restoreCurrentText);
  dom.exportButton.addEventListener("click", exportMarkdown);

  dom.focusToggle.addEventListener("click", () => {
    const enabled = dom.studio.classList.toggle("is-focus");
    dom.focusToggle.textContent = enabled ? "Afficher les textes" : "Mode focus";
  });

  dom.sidebarToggle.addEventListener("click", (event) => {
    event.stopPropagation();
    document.body.classList.toggle("sidebar-open");
  });

  document.addEventListener("click", (event) => {
    if (!document.body.classList.contains("sidebar-open")) return;
    if (dom.sidebar.contains(event.target) || dom.sidebarToggle.contains(event.target)) return;
    document.body.classList.remove("sidebar-open");
  });

  document.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
      event.preventDefault();
      saveState();
      showToast("Brouillon sauvegardé");
    }
  });

  window.addEventListener("beforeunload", () => {
    if (saveTimer) saveState();
  });
}

function renderDocumentNavigation() {
  const items = filteredItems();
  const index = items.findIndex((item) => item.id === state.activeItemId);
  dom.documentPosition.textContent = index >= 0 ? `${index + 1} / ${items.length}` : `0 / ${items.length}`;
  dom.previousButton.disabled = index <= 0;
  dom.nextButton.disabled = index < 0 || index >= items.length - 1;
}

function init() {
  renderStatusOptions();
  dom.priorityTabs.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.priority === state.priority);
  });
  initEvents();
  renderDocument();
}

init();
