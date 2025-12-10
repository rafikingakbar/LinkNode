const { db } = require("../lib/firebase");

module.exports = async (req, res) => {
  if (req.method !== "POST" && req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    let body = req.body || {};
    if (typeof body === "string") {
      body = JSON.parse(body || "{}");
    }

    const { shortCode, deviceId } = body;

    if (!shortCode || !deviceId) {
      return res.status(400).json({ error: "shortCode dan deviceId wajib ada" });
    }

    const ref = db.collection("urls").doc(shortCode);
    const doc = await ref.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Data tidak ditemukan" });
    }

    const data = doc.data();
    if (data.deviceId !== deviceId) {
      // Biar device lain nggak bisa hapus punya kamu
      return res.status(403).json({ error: "Tidak boleh menghapus data milik device lain" });
    }

    await ref.delete();

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Error in /api/delete:", err);
    return res.status(500).json({ error: "Server error" });
  }
};