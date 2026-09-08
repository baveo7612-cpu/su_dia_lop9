import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'zalo-tts-dev-middleware',
      configureServer(server) {
        server.middlewares.use('/api/zalo-tts', async (req, res) => {
          const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
          const text = urlObj.searchParams.get('text');
          if (!text) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ error: 'Missing text parameter' }));
          }

          try {
            const formData = new URLSearchParams();
            formData.append("input", text);
            formData.append("speaker_id", "1"); // Nữ miền Bắc chuẩn sư phạm
            formData.append("speed", "0.95");

            const zaloRes = await fetch("https://api.zalo.ai/v1/tts/synthesize", {
              method: "POST",
              headers: {
                "apikey": "54IY1Y4zgI6DStypp6Y6Qw2kgC5JLD6T",
                "Content-Type": "application/x-www-form-urlencoded"
              },
              body: formData.toString()
            });

            const data = await zaloRes.json();
            res.setHeader('Content-Type', 'application/json');
            if (data.error_code === 0 && data.data?.url) {
              res.statusCode = 200;
              return res.end(JSON.stringify({ url: data.data.url }));
            } else {
              res.statusCode = 500;
              return res.end(JSON.stringify({ error: data.message || "Zalo API failed", details: data }));
            }
          } catch (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ error: err.message }));
          }
        });
      }
    }
  ],
  server: {
    port: 5173,
    host: true
  }
});
