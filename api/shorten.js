const { db } = require("../lib/firebase");

function generateShortCode() {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let res = "";
  for (let i = 0; i < 6; i++) {
    res += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return res;
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    let body = req.body || {};
    if (typeof body === "string") {
      body = JSON.parse(body || "{}");
    }

    const { originalUrl, deviceId } = body;

    if (!originalUrl) {
      return res.status(400).json({ error: "URL wajib diisi" });
    }

    if (!deviceId) {
      return res.status(400).json({ error: "deviceId wajib ada" });
    }

    const shortCode = generateShortCode();

    const shortUrl = `${req.headers.origin}/api/s/${shortCode}`;

    const data = {
      originalUrl,
      shortCode,
      shortUrl,
      deviceId,
      createdAt: new Date().toISOString(),
      clicks: 0,
    };

    await db.collection("urls").doc(shortCode).set(data);

    return res.status(200).json(data);
  } catch (err) {
    console.error("Error in /api/shorten:", err);
    return res.status(500).json({ error: "Server error" });
  }
};
