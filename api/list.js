const { db } = require("../lib/firebase");

module.exports = async (req, res) => {
  try {
    const { deviceId } = req.query;

    if (!deviceId) {
      return res.status(400).json({ error: "deviceId wajib ada" });
    }

    const snapshot = await db
      .collection("urls")
      .where("deviceId", "==", deviceId)
      .get();

    const data = snapshot.docs.map((doc) => doc.data());

    return res.status(200).json(data);
  } catch (err) {
    console.error("Error in /api/list:", err);
    return res.status(500).json({ error: "Server error" });
  }
};
