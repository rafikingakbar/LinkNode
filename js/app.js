let links = [];

// ==== DEVICE ID (per browser) ====
let deviceId = localStorage.getItem("deviceId");
if (!deviceId) {
  deviceId = "dev_" + Math.random().toString(36).slice(2);
  localStorage.setItem("deviceId", deviceId);
}

const form = document.getElementById("shortenForm");
const urlInput = document.getElementById("urlInput");
const errorText = document.getElementById("errorText");
const totalLinksEl = document.getElementById("totalLinks");
const totalClicksEl = document.getElementById("totalClicks");
const linksContainer = document.getElementById("linksContainer");
const emptyState = document.getElementById("emptyState");

// ==== LOAD DATA DARI FIRESTORE (HANYA PUNYA DEVICE INI) ====
async function loadLinks() {
  try {
    const res = await fetch(`/api/list?deviceId=${encodeURIComponent(deviceId)}`);
    if (!res.ok) {
      console.error("Gagal load data:", await res.text());
      links = [];
    } else {
      links = await res.json();
    }
    render();
  } catch (err) {
    console.error("Gagal load data:", err);
    links = [];
    render();
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
          <button class="btn-text" data-role="edit">Edit</button>
          <button class="btn-text delete" data-role="delete">${t("delete")}</button>
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
      body: JSON.stringify({ originalUrl: value, deviceId }),
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

  const itemIndex = links.findIndex((x) => x.shortCode === shortCode);
  if (itemIndex === -1) return;
  const item = links[itemIndex];

  if (role === "copy") {
    const textToCopy = item.shortUrl;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(textToCopy);
      alert("Short URL disalin: " + textToCopy);
    } else {
      prompt("Copy URL ini:", textToCopy);
    }
  }

  if (role === "edit") {
    const newCode = prompt("Masukkan back-half baru (huruf/angka/-):", item.shortCode);
    if (!newCode) return;
    
    try {
      const res = await fetch("/api/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oldCode: item.shortCode,
          newCode: newCode.trim(),
          deviceId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Gagal edit kode.");
        return;
      }

      item.shortCode = data.newCode;
      item.shortUrl = data.shortUrl;

      render();
    } catch (err) {
      console.error(err);
      alert("Server error saat edit.");
    }
  }


  if (role === "delete") {
    const ok = confirm("Hapus link ini?");
    if (!ok) return;

    try {
      const res = await fetch("/api/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shortCode, deviceId }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Gagal menghapus link.");
        return;
      }

      // Hapus dari array lokal dan re-render
      links.splice(itemIndex, 1);
      render();
    } catch (err) {
      console.error(err);
      alert("Terjadi error saat menghapus link.");
    }
  }
});

window.addEventListener("DOMContentLoaded", loadLinks);
