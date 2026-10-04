import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';
import { parseMenuWithGemini, generateCoachAdviceWithGemini } from './src/server/geminiService.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const HOST = '0.0.0.0';

app.use(express.json({ limit: '15mb' }));

app.post('/api/parse-menu', async (req, res) => {
  try {
    const days = await parseMenuWithGemini(req.body);
    res.json({ success: true, days });
  } catch (err: any) {
    console.error('Error in /api/parse-menu:', err);
    res.status(500).json({ error: err.message || 'Failed to parse menu' });
  }
});

app.post('/api/coach-advice', async (req, res) => {
  try {
    const advice = await generateCoachAdviceWithGemini(req.body);
    res.json({ success: true, advice });
  } catch (err: any) {
    console.error('Error in /api/coach-advice:', err);
    res.status(500).json({ error: err.message || 'Failed to generate coach advice' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', hasGeminiKey: Boolean(process.env.GEMINI_API_KEY) });
});

// Serve static assets in production
const distPath = path.resolve(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));

  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, HOST, () => {
  console.log(`Mess Macro Coach server running on http://${HOST}:${PORT}`);
});
