export default async function handler(req, res) {
  // CORS Headers
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  try {
    let text = "";
    if (req.method === "POST") {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      text = body?.text || "";
    } else {
      text = req.query?.text || "";
    }

    if (!text || text.trim() === "") {
      return res.status(400).json({ error: "No text provided" });
    }

    const payload = new URLSearchParams();
    payload.append("input", text.trim());
    payload.append("speaker_id", "1"); // Nữ Bắc chuẩn
    payload.append("speed", "0.95");
    payload.append("encode_type", "0");

    const zaloRes = await fetch("https://api.zalo.ai/v1/tts/synthesize", {
      method: "POST",
      headers: {
        "apikey": "54IY1Y4zgI6DStypp6Y6Qw2kgC5JLD6T",
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: payload.toString()
    });

    const data = await zaloRes.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(200).json({ error_code: 500, message: error.message });
  }
}
