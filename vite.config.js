import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const zaloHandler = async (req, res) => {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    res.statusCode = 200;
    return res.end();
  }

  const zaloApiKey = process.env.ZALO_API_KEY || "54IY1Y4zgI6DStypp6Y6Qw2kgC5JLD6T";

  let bodyText = '';
  req.on('data', chunk => { bodyText += chunk; });
  req.on('end', async () => {
    let rawText = '';
    const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    rawText = urlObj.searchParams.get('text') || '';

    if (!rawText && bodyText) {
      try {
        const parsed = JSON.parse(bodyText);
        rawText = parsed.text || '';
      } catch {
        rawText = bodyText;
      }
    }

    if (rawText) {
      try {
        rawText = decodeURIComponent(rawText);
      } catch {}
    }

    const text = (rawText || '').trim();

    if (!text) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ error: 'No text provided' }));
    }

    try {
      const payload = new URLSearchParams();
      payload.append("input", text.substring(0, 300));
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

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');

      if (data && data.error_code === 0 && data.data?.url) {
        return res.end(JSON.stringify(data));
      }

      const googleFallbackUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=vi&client=tw-ob&q=${encodeURIComponent(text.slice(0, 200))}`;
      return res.end(JSON.stringify({
        error_code: 0,
        fallback: true,
        message: data?.message || "Zalo API fallback to Google TTS",
        data: { url: googleFallbackUrl }
      }));
    } catch (error) {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      const googleFallbackUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=vi&client=tw-ob&q=${encodeURIComponent(text.slice(0, 200) || "Bài giảng cô giáo")}`;
      return res.end(JSON.stringify({
        error_code: 0,
        fallback: true,
        message: error.message,
        data: { url: googleFallbackUrl }
      }));
    }
  });
};

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'zalo-tts-dev-middleware',
      configureServer(server) {
        server.middlewares.use('/api/zalo-tts', zaloHandler);
        server.middlewares.use('/api/tts', zaloHandler);
      }
    }
  ],
  server: {
    port: 5173,
    host: true
  }
});
