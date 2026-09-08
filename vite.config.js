import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'zalo-tts-dev-middleware',
      configureServer(server) {
        server.middlewares.use('/api/tts', async (req, res) => {
          res.setHeader("Access-Control-Allow-Origin", "*");
          res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
          res.setHeader("Access-Control-Allow-Headers", "Content-Type");

          if (req.method === "OPTIONS") {
            res.statusCode = 200;
            return res.end();
          }

          let bodyText = '';
          req.on('data', chunk => { bodyText += chunk; });
          req.on('end', async () => {
            let text = '';
            const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
            text = urlObj.searchParams.get('text');

            if (!text && bodyText) {
              try {
                const parsed = JSON.parse(bodyText);
                text = parsed.text;
              } catch {
                text = bodyText;
              }
            }

            if (!text) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ error: 'Missing text' }));
            }

            try {
              const params = new URLSearchParams();
              params.append("input", text);
              params.append("speaker_id", "1"); // Nữ miền Bắc
              params.append("speed", "0.95");
              params.append("encode_type", "0");

              const zaloRes = await fetch("https://api.zalo.ai/v1/tts/synthesize", {
                method: "POST",
                headers: {
                  "apikey": "54IY1Y4zgI6DStypp6Y6Qw2kgC5JLD6T",
                  "Content-Type": "application/x-www-form-urlencoded"
                },
                body: params.toString()
              });

              const data = await zaloRes.json();
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify(data));
            } catch (err) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ error: err.message }));
            }
          });
        });
      }
    }
  ],
  server: {
    port: 5173,
    host: true
  }
});
