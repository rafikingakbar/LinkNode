// Simpan data link di array
let links = [];

// Ambil elemen DOM
const form = document.getElementById("shortenForm");
const urlInput = document.getElementById("urlInput");
const errorText = document.getElementById("errorText");
const totalLinksEl = document.getElementById("totalLinks");
const totalClicksEl = document.getElementById("totalClicks");
const linksContainer = document.getElementById("linksContainer");
const emptyState = document.getElementById("emptyState");
const themeToggle = document.getElementById("themeToggle");

// ------- Inisialisasi -------

window.addEventListener("DOMContentLoaded", () => {
  const stored = localStorage.getItem("shortenedLinks");
  if (stored) {
    links = JSON.parse(stored);
  }
  render();
});

// ------- Utilitas -------

function generateShortCode() {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let res = "";
  for (let i = 0; i < 6; i++) {
    res += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return res;
}

function saveToStorage() {
  localStorage.setItem("shortenedLinks", JSON.stringify(links));
}

function updateStats() {
  const totalLinks = links.length;
  const totalClicks = links.reduce((sum, item) => sum + (item.clicks || 0), 0);
  totalLinksEl.textContent = totalLinks;
  totalClicksEl.textContent = totalClicks;
}

function render() {
  updateStats();

  if (links.length === 0) {
    emptyState.style.display = "block";
    linksContainer.innerHTML = "";
    return;
  }

  emptyState.style.display = "none";
  linksContainer.innerHTML = "";

  links.forEach((item) => {
    const card = document.createElement("div");
    card.className = "link-card";
    card.dataset.id = item.id;

    card.innerHTML = `
      <div class="link-row-top">
        <div class="link-meta">
          <p class="link-label">SHORT LINK</p>
          <a href="${item.originalUrl}" target="_blank" class="link-short" data-role="short-link">
            ${item.shortUrl}
          </a>
        </div>
        <div class="link-actions">
          <button class="btn-text" data-role="copy">Copy</button>
          <button class="btn-text delete" data-role="delete">Delete</button>
        </div>
      </div>

      <div class="link-row-bottom">
        <div>
          <p class="link-label">ORIGINAL URL</p>
          <p class="link-original">${item.originalUrl}</p>
        </div>
        <div class="link-info">
          <span>${item.clicks || 0} clicks</span>
          <span>• ${item.createdAt}</span>
        </div>
      </div>
    `;

    linksContainer.appendChild(card);
  });
}

// ------- Event: submit form -------

form.addEventListener("submit", function (e) {
  e.preventDefault();
  errorText.textContent = "";

  const value = urlInput.value.trim();
  if (!value) {
    errorText.textContent = "URL tidak boleh kosong.";
    return;
  }

  // Validasi URL
  try {
    new URL(value);
  } catch (err) {
    errorText.textContent = "Format URL tidak valid.";
    return;
  }

  const shortCode = generateShortCode();
  const now = new Date();

  const newItem = {
    id: Date.now().toString(),
    originalUrl: value,
    shortCode: shortCode,
    shortUrl: "https://short.link/" + shortCode,
    createdAt: now.toLocaleString(),
    clicks: 0,
  };

  links.unshift(newItem);
  saveToStorage();
  render();
  urlInput.value = "";
});

// ------- Event: klik di dalam list (copy / delete / klik short link) -------

linksContainer.addEventListener("click", function (e) {
  const target = e.target;
  const card = target.closest(".link-card");
  if (!card) return;
  const id = card.dataset.id;
  const itemIndex = links.findIndex((x) => x.id === id);
  if (itemIndex === -1) return;

  const role = target.getAttribute("data-role");

  if (role === "copy") {
    const textToCopy = links[itemIndex].shortUrl;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textToCopy).then(
        () => {
          alert("Short URL disalin: " + textToCopy);
        },
        () => {
          alert("Gagal menyalin ke clipboard.");
        }
      );
    } else {
      // fallback sederhana
      prompt("Copy URL ini:", textToCopy);
    }
  }

  if (role === "delete") {
    const ok = confirm("Hapus link ini?");
    if (!ok) return;
    links.splice(itemIndex, 1);
    saveToStorage();
    render();
  }

  if (role === "short-link") {
    // hitung klik
    links[itemIndex].clicks = (links[itemIndex].clicks || 0) + 1;
    saveToStorage();
    // biarkan browser membuka tab baru (href di <a>)
  }
});

// ------- Tema (opsional) -------

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("light");
});
