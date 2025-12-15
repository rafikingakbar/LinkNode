const { db } = require("../lib/firebase");

function isValidAlias(code) {
  return typeof code === "string" && /^[A-Za-z0-9_-]{3,24}$/.test(code);
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    let body = req.body || {};
    if (typeof body === "string") body = JSON.parse(body || "{}");

    const { oldCode, newCode, deviceId } = body;

    if (!oldCode || !newCode || !deviceId) {
      return res.status(400).json({ error: "oldCode, newCode, deviceId wajib ada" });
    }

    if (!isValidAlias(newCode)) {
      return res.status(400).json({ error: "Format alias tidak valid (3–24, A-Z a-z 0-9 _ -)" });
    }

    if (oldCode === newCode) {
      return res.status(400).json({ error: "Alias baru tidak boleh sama dengan alias lama" });
    }

    const oldRef = db.collection("urls").doc(oldCode);
    const newRef = db.collection("urls").doc(newCode);

    const result = await db.runTransaction(async (tx) => {
      const oldSnap = await tx.get(oldRef);
      if (!oldSnap.exists) {
        throw Object.assign(new Error("NOT_FOUND"), { code: 404, msg: "Short URL lama tidak ditemukan" });
      }

      const oldData = oldSnap.data();
      if (oldData.deviceId !== deviceId) {
        throw Object.assign(new Error("FORBIDDEN"), { code: 403, msg: "Tidak boleh edit link milik device lain" });
      }

      const newSnap = await tx.get(newRef);
      if (newSnap.exists) {
        throw Object.assign(new Error("CONFLICT"), { code: 409, msg: "Alias sudah dipakai (global)" });
      }

    const origin =
        req.headers.origin ||
        `https://${req.headers["x-forwarded-host"] || req.headers.host}`;
    const shortUrl = `${origin}/${newCode}`;


      const newData = {
        ...oldData,
        shortCode: newCode,
        shortUrl,
        // optional: catat update
        updatedAt: new Date().toISOString(),
      };

      tx.set(newRef, newData);
      tx.delete(oldRef);

      return newData;
    });

    return res.status(200).json(result);
  } catch (err) {
    // error custom dari transaction
    if (err && err.code && err.msg) {
      return res.status(err.code).json({ error: err.msg });
    }
    console.error("Error in /api/edit:", err);
    return res.status(500).json({ error: "Server error" });
  }
};