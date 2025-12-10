const themeToggle = document.getElementById("themeToggle");

// Baca tema tersimpan (kalau ada)
const savedTheme = localStorage.getItem("theme"); // "dark" atau "light"

if (savedTheme === "light") {
  document.body.classList.add("light");
}

// Set ikon awal
updateThemeIcon();

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("light");

  const isLight = document.body.classList.contains("light");
  localStorage.setItem("theme", isLight ? "light" : "dark");

  updateThemeIcon();
});

function updateThemeIcon() {
  const isLight = document.body.classList.contains("light");
  themeToggle.textContent = isLight ? "🌙" : "☀";
}
