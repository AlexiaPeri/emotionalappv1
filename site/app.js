const header = document.querySelector("#site-header");
const menuButton = document.querySelector("#menu-button");
const navigation = document.querySelector("#site-navigation");
const year = document.querySelector("#current-year");

function updateHeader() {
  header?.classList.toggle("is-scrolled", window.scrollY > 18);
}

function closeMenu() {
  document.body.classList.remove("menu-open");
  menuButton?.setAttribute("aria-expanded", "false");
}

menuButton?.addEventListener("click", () => {
  const willOpen = !document.body.classList.contains("menu-open");
  document.body.classList.toggle("menu-open", willOpen);
  menuButton.setAttribute("aria-expanded", String(willOpen));
});

navigation?.addEventListener("click", (event) => {
  if (event.target.closest("a")) closeMenu();
});

window.addEventListener("scroll", updateHeader, { passive: true });
window.addEventListener("resize", () => {
  if (window.innerWidth > 760) closeMenu();
});

year.textContent = String(new Date().getFullYear());
updateHeader();
