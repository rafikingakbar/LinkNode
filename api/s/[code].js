const { db } = require("../../lib/firebase");

module.exports = async (req, res) => {
  const { code } = req.query;

  try {
    const doc = await db.collection("urls").doc(code).get();

    if (!doc.exists) {
      return res.status(404).send("Short URL tidak ditemukan");
    }

    const data = doc.data();

    await db.collection("urls").doc(code).update({
      clicks: (data.clicks || 0) + 1,
    });

    res.writeHead(302, { Location: data.originalUrl });
    res.end();
  } catch (err) {
    console.error("Error in /api/s/[code]:", err);
    res.status(500).send("Server error");
  }
};
