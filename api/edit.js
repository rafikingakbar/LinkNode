const { db } = require("../lib/firebase");

function isValidNewCode(code) {
  return /^[a-zA-Z0-9-]{3,32}$/.test(code);
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

    if (!isValidNewCode(newCode)) {
      return res.status(400).json({
        error: "Kode hanya boleh huruf/angka dan '-' (3–32 karakter)",
      });
    }

    const oldRef = db.collection("urls").doc(oldCode);
    const newRef = db.collection("urls").doc(newCode);

    await db.runTransaction(async (tx) => {
      const oldSnap = await tx.get(oldRef);
      if (!oldSnap.exists) throw new Error("NOT_FOUND");

      const oldData = oldSnap.data();
      if (oldData.deviceId !== deviceId) throw new Error("FORBIDDEN");

      const newSnap = await tx.get(newRef);
      if (newSnap.exists) throw new Error("TAKEN");

      tx.set(newRef, {
        ...oldData,
        shortCode: newCode,
        shortUrl: `${req.headers.origin}/${newCode}`,
      });

      tx.delete(oldRef);
    });

    return res.status(200).json({
      success: true,
      oldCode,
      newCode,
      shortUrl: `${req.headers.origin}/${newCode}`,
    });
  } catch (err) {
    if (err.message === "NOT_FOUND") return res.status(404).json({ error: "Link lama tidak ditemukan" });
    if (err.message === "FORBIDDEN") return res.status(403).json({ error: "Tidak boleh edit link milik device lain" });
    if (err.message === "TAKEN") return res.status(409).json({ error: "Kode sudah digunakan" });

    console.error("Error in /api/edit:", err);
    return res.status(500).json({ error: "Server error" });
  }
};
