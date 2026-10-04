import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, Plugin } from 'vite';
import dotenv from 'dotenv';
import { parseMenuWithGemini, generateCoachAdviceWithGemini, generateRuleBasedCoachAdvice } from './src/server/geminiService';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Custom Vite plugin to handle backend API routes in Node server
function apiServerPlugin(): Plugin {
  return {
    name: 'mess-macro-coach-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split('?')[0];

        if (url === '/api/parse-menu' && req.method === 'POST') {
          try {
            const body = await parseJsonBody(req);
            const parsedDays = await parseMenuWithGemini(body);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, days: parsedDays }));
          } catch (err: any) {
            console.log('Notice in Vite middleware /api/parse-menu:', err?.message || err);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, days: [] }));
          }
          return;
        }

        if (url === '/api/coach-advice' && req.method === 'POST') {
          try {
            const body = await parseJsonBody(req);
            const advice = await generateCoachAdviceWithGemini(body);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, advice }));
          } catch (err: any) {
            console.log('Notice in Vite middleware /api/coach-advice:', err?.message || err);
            const body = await parseJsonBody(req).catch(() => ({}));
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, advice: generateRuleBasedCoachAdvice(body) }));
          }
          return;
        }

        if (url === '/api/health' && req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ status: 'ok', hasGeminiKey: Boolean(process.env.GEMINI_API_KEY) }));
          return;
        }

        next();
      });
    },
  };
}

function parseJsonBody(req: any): Promise<any> {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk: any) => {
      raw += chunk;
      // Safeguard: 10MB limit for image uploads
      if (raw.length > 10 * 1024 * 1024) {
        req.destroy();
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiServerPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
