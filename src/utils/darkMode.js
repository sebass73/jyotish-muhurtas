export function initDarkMode() {
  const toggle = document.getElementById("darkToggle");
  const isDark = localStorage.getItem("darkMode") === "true";
  if (isDark) document.documentElement.classList.add("dark");

  toggle.addEventListener("click", () => {
    const nowDark = document.documentElement.classList.toggle("dark");
    localStorage.setItem("darkMode", nowDark);
  });
}
