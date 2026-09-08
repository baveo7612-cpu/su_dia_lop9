export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  let text = req.method === "POST" ? (typeof req.body === 'string' ? JSON.parse(req.body)?.text : req.body?.text) : req.query?.text;
  if (!text && req.body && typeof req.body === 'string') {
    try { text = JSON.parse(req.body).text; } catch {}
  }

  if (!text) {
    return res.status(400).json({ error: "Missing text parameter" });
  }

  try {
    const params = new URLSearchParams();
    params.append("input", text);
    params.append("speaker_id", "1"); // Nữ miền Bắc
    params.append("speed", "0.9");
    params.append("encode_type", "0");

    const response = await fetch("https://api.zalo.ai/v1/tts/synthesize", {
      method: "POST",
      headers: {
        "apikey": "54IY1Y4zgI6DStypp6Y6Qw2kgC5JLD6T",
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: params.toString()
    });

    const data = await response.json().catch(() => ({ error_code: 500, message: "Zalo API invalid response" }));

    if (data.error_code === 0 && data.data?.url) {
      return res.status(200).json(data);
    } else {
      return res.status(400).json(data);
    }
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}
