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

// ==== MODAL EDIT (inject sekali) ====
const modalHtml = `
  <div id="editModal" class="modal hidden">
    <div class="modal-overlay" data-role="close-modal"></div>
    <div class="modal-card">
      <h3 class="modal-title" id="editTitle">${t("editTitle")}</h3>
      <p class="modal-subtitle" id="editSubtitle">${t("editSubtitle")}</p>

      <div class="modal-row">
        <span class="modal-prefix" id="editPrefix"></span>
        <input id="editAliasInput" class="modal-input" placeholder="${t("editPlaceholder")}" />
      </div>

      <p class="modal-error" id="editError"></p>

      <div class="modal-actions">
        <button class="btn-text" data-role="cancel-edit">${t("cancel")}</button>
        <button class="btn-primary modal-save" id="saveEditBtn" data-role="save-edit">${t("save")}</button>
      </div>
    </div>
  </div>
`;
document.body.insertAdjacentHTML("beforeend", modalHtml);

const editModal = document.getElementById("editModal");
const editAliasInput = document.getElementById("editAliasInput");
const editError = document.getElementById("editError");
const editPrefix = document.getElementById("editPrefix");
const saveEditBtn = document.getElementById("saveEditBtn");

let editingOldCode = null;

function openEditModal(item) {
  editingOldCode = item.shortCode;
  editError.textContent = "";

  // prefix: https://domain/
  const origin = window.location.origin;
  editPrefix.textContent = origin + "/";

  editAliasInput.value = item.shortCode; // default isi code lama
  editModal.classList.remove("hidden");
  editAliasInput.focus();
  editAliasInput.select();
}

function closeEditModal() {
  editingOldCode = null;
  editModal.classList.add("hidden");
}

// close overlay / cancel
editModal.addEventListener("click", (e) => {
  const role = e.target.getAttribute("data-role");
  if (role === "close-modal" || role === "cancel-edit") {
    closeEditModal();
  }
});

saveEditBtn.addEventListener("click", async () => {
  editError.textContent = "";

  const newCode = (editAliasInput.value || "").trim();
  if (!editingOldCode) return;

  if (!newCode) {
    editError.textContent = t("aliasEmpty");
    return;
  }

  // validasi client (biar cepat)
  if (!/^[A-Za-z0-9_-]{3,24}$/.test(newCode)) {
    editError.textContent = t("aliasInvalid");
    return;
  }

  saveEditBtn.disabled = true;
  const oldText = saveEditBtn.textContent;
  saveEditBtn.textContent = t("saving");

  try {
    const res = await fetch("/api/edit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ oldCode: editingOldCode, newCode, deviceId }),
    });

    const data = await res.json();

    if (!res.ok) {
      editError.textContent = data.error || t("editFailed");
      return;
    }

    // update array lokal: ganti item lama dengan item baru
    const idx = links.findIndex((x) => x.shortCode === editingOldCode);
    if (idx !== -1) {
      links[idx] = data;
    }

    closeEditModal();
    render();
  } catch (err) {
    console.error(err);
    editError.textContent = t("serverError");
  } finally {
    saveEditBtn.disabled = false;
    saveEditBtn.textContent = oldText;
  }
});

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
          <button class="btn-text" data-role="edit">${t("edit")}</button>
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
  openEditModal(item);
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
