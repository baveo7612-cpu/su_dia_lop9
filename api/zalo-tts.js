export default async function handler(req, res) {
  // CORS Headers
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Read Environment Variable with fallback
  const zaloApiKey = process.env.ZALO_API_KEY || "54IY1Y4zgI6DStypp6Y6Qw2kgC5JLD6T";
  if (!process.env.ZALO_API_KEY) {
    console.log("[ZALO TTS API] ZALO_API_KEY env variable is undefined, using default key fallback.");
  }

  try {
    let rawText = "";
    if (req.method === "POST") {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      rawText = body?.text || "";
    } else {
      rawText = req.query?.text || "";
    }

    if (rawText) {
      try {
        rawText = decodeURIComponent(rawText);
      } catch {}
    }

    const text = (rawText || "").trim();

    if (!text) {
      return res.status(400).json({ error: true, message: "No text provided" });
    }

    const cleanText = text.substring(0, 300);

    const payload = new URLSearchParams();
    payload.append("input", cleanText);
    payload.append("speaker_id", "1"); // Nữ Bắc chuẩn
    payload.append("speed", "0.95");
    payload.append("encode_type", "1");

    const zaloRes = await fetch("https://api.zalo.ai/v1/tts/synthesize", {
      method: "POST",
      headers: {
        "apikey": zaloApiKey,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: payload.toString()
    });

    const data = await zaloRes.json().catch(() => null);

    if (data && data.error_code === 0 && data.data?.url) {
      return res.status(200).json(data);
    }

    console.log("[ZALO TTS API] Zalo response error, returning Google TTS fallback:", data);
    const googleFallbackUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=vi&client=tw-ob&q=${encodeURIComponent(cleanText.slice(0, 200))}`;
    return res.status(200).json({
      error_code: 0,
      fallback: true,
      message: data?.message || "Zalo API fallback to Google TTS",
      data: { url: googleFallbackUrl }
    });
  } catch (error) {
    console.error("[ZALO TTS API] Handler exception, returning Google TTS fallback:", error);
    const textParam = req.query?.text ? decodeURIComponent(req.query.text) : "";
    const googleFallbackUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=vi&client=tw-ob&q=${encodeURIComponent((textParam || "Bài giảng cô giáo").slice(0, 200))}`;
    return res.status(200).json({
      error_code: 0,
      fallback: true,
      message: error.message,
      data: { url: googleFallbackUrl }
    });
  }
}
