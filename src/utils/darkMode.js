export function initDarkMode() {
  const toggle = document.getElementById("darkToggle");
  const root = document.documentElement;

  function emitThemeChange() {
    window.dispatchEvent(
      new CustomEvent("themeChange", {
        detail: { isDark: root.classList.contains("dark") },
      })
    );
  }

  // al cargar la página
  if (localStorage.getItem("dark") === "true") {
    root.classList.add("dark");
  }
  emitThemeChange();

  toggle.addEventListener("click", () => {
    root.classList.toggle("dark");
    localStorage.setItem("dark", root.classList.contains("dark"));
    emitThemeChange();
  });
}
