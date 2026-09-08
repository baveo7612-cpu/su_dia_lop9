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

  let bodyText = '';
  req.on('data', chunk => { bodyText += chunk; });
  req.on('end', async () => {
    let text = '';
    const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    text = urlObj.searchParams.get('text') || '';

    if (!text && bodyText) {
      try {
        const parsed = JSON.parse(bodyText);
        text = parsed.text || '';
      } catch {
        text = bodyText;
      }
    }

    if (!text || text.trim() === '') {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ error: 'No text provided' }));
    }

    try {
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
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify(data));
    } catch (error) {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ error_code: 500, message: error.message }));
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
