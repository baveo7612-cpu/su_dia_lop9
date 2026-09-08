export default async function handler(req, res) {
  const { text } = req.query;
  if (!text) return res.status(400).json({ error: "Missing text" });
  try {
    const formData = new URLSearchParams();
    formData.append("input", text);
    formData.append("speaker_id", "1"); // Nữ miền Bắc chuẩn sư phạm
    formData.append("speed", "0.95");

    const response = await fetch("https://api.zalo.ai/v1/tts/synthesize", {
      method: "POST",
      headers: {
        "apikey": "54IY1Y4zgI6DStypp6Y6Qw2kgC5JLD6T",
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: formData.toString()
    });

    const data = await response.json();
    if (data.error_code === 0 && data.data?.url) {
      return res.status(200).json({ url: data.data.url });
    }
    return res.status(500).json({ error: data.message || "Zalo API failed" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
