let links = [];

const form = document.getElementById("shortenForm");
const urlInput = document.getElementById("urlInput");
const errorText = document.getElementById("errorText");
const totalLinksEl = document.getElementById("totalLinks");
const totalClicksEl = document.getElementById("totalClicks");
const linksContainer = document.getElementById("linksContainer");
const emptyState = document.getElementById("emptyState");

async function loadLinks() {
  try {
    const res = await fetch("/api/shorten");
    links = await res.json();
    render();
  } catch (err) {
    console.error("Gagal load data:", err);
  }
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
    card.dataset.id = item.shortCode;

    const clicks = item.clicks || 0;
    const clickWord = clicks === 1 ? t("clickOne") : t("clickMany");

    card.innerHTML = `
      <div class="link-row-top">
        <div class="link-meta">
          <p class="link-label">${t("shortLabel")}</p>
          <a 
            href="${item.shortUrl}" 
            target="_blank" 
            class="link-short" 
            data-role="short-link">
            ${item.shortUrl}
          </a>
        </div>
        <div class="link-actions">
          <button class="btn-text" data-role="copy">${t("copy")}</button>
        </div>
      </div>

      <div class="link-row-bottom">
        <div>
          <p class="link-label">${t("originalLabel")}</p>
          <p class="link-original">${item.originalUrl}</p>
        </div>
        <div class="link-info">
          <span>${clicks} ${clickWord}</span>
          <span>• ${new Date(item.createdAt).toLocaleString()}</span>
        </div>
      </div>
    `;

    linksContainer.appendChild(card);
  });
}

form.addEventListener("submit", async function (e) {
  e.preventDefault();
  errorText.textContent = "";

  const value = urlInput.value.trim();
  if (!value) {
    errorText.textContent = "URL tidak boleh kosong.";
    return;
  }

  try {
    new URL(value);
  } catch {
    errorText.textContent = "Format URL tidak valid.";
    return;
  }

  try {
    const res = await fetch("/api/shorten", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ originalUrl: value }),
    });

    const data = await res.json();

    if (!res.ok) {
      errorText.textContent = data.error || "Gagal mempersingkat URL.";
      return;
    }

    links.unshift(data);
    render();
    urlInput.value = "";
  } catch (err) {
    console.error(err);
    errorText.textContent = "Server error.";
  }
});

linksContainer.addEventListener("click", async function (e) {
  const target = e.target;
  const card = target.closest(".link-card");
  if (!card) return;

  const shortCode = card.dataset.id;
  const role = target.getAttribute("data-role");

  const item = links.find((x) => x.shortCode === shortCode);
  if (!item) return;

  if (role === "copy") {
    const textToCopy = item.shortUrl;
    await navigator.clipboard.writeText(textToCopy);
    alert("Short URL disalin: " + textToCopy);
  }
});

window.addEventListener("DOMContentLoaded", loadLinks);
