// === i18n config ===
var translations = {
  en: {
    subtitle: "Shorten your long links into easy-to-share and memorable URLs",
    totalLinks: "Total Links",
    totalClicks: "Total Clicks",
    inputPlaceholder: "Enter your long URL here...",
    shortenBtn: "Shorten URL",
    listTitle: "Shortened Links",
    empty: "No shortened links yet. Enter a URL above.",

    // labels di kartu link
    shortLabel: "SHORT LINK",
    originalLabel: "ORIGINAL URL",
    copy: "Copy",
    delete: "Delete",
    clickOne: "click",
    clickMany: "clicks",
  },
  id: {
    subtitle: "Pendekkan link panjang menjadi mudah dibagikan",
    totalLinks: "Total Link",
    totalClicks: "Total Klik",
    inputPlaceholder: "Masukkan URL panjang di sini...",
    shortenBtn: "Pendekkan URL",
    listTitle: "Daftar Link Pendek",
    empty: "Belum ada link yang dipendekkan. Masukkan URL di atas.",

    shortLabel: "LINK PENDEK",
    originalLabel: "URL ASLI",
    copy: "Salin",
    delete: "Hapus",
    clickOne: "klik",
    clickMany: "klik",
  },
};

var currentLang = localStorage.getItem("lang") || "en";

// helper: ambil teks dari kamus
function t(key) {
  if (translations[currentLang] && translations[currentLang][key]) {
    return translations[currentLang][key];
  }
  return key;
}

var langToggle = document.getElementById("langToggle");

// apply language saat pertama load
applyLanguage(currentLang);
if (langToggle) {
  langToggle.textContent = currentLang.toUpperCase();
}

if (langToggle) {
  langToggle.addEventListener("click", () => {
    currentLang = currentLang === "en" ? "id" : "en";
    localStorage.setItem("lang", currentLang);

    langToggle.textContent = currentLang.toUpperCase();
    applyLanguage(currentLang);

    // setelah ganti bahasa, rerender list link biar label ikut berubah
    if (typeof render === "function") {
      render();
    }
  });
}

function applyLanguage(lang) {
  // teks biasa
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (translations[lang][key]) {
      el.textContent = translations[lang][key];
    }
  });

  // placeholder
  document
    .querySelectorAll("[data-i18n-placeholder]")
    .forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      if (translations[lang][key]) {
        el.placeholder = translations[lang][key];
      }
    });
}
