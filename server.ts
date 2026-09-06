import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { apiRouter } from './src/server/api';
import { initDatabase } from './src/db/database';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize SQLite database
  try {
    await initDatabase();
    console.log('[Database] SQLite initialized successfully.');
  } catch (err) {
    console.error('[Database] Failed to initialize SQLite database:', err);
  }

  // Mount API endpoints FIRST
  app.use('/api', apiRouter);

  // Vite middleware for development vs static serve for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[PhishShield] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
