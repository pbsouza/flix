import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import http from 'http';
import https from 'https';
import multer from 'multer';
import jwt from 'jsonwebtoken';
import { createServer as createViteServer } from 'vite';
import { File as MegaFile } from 'megajs';
import { DatabaseService } from './server/db';
import { ProviderFactory } from './server/providers';
import { VideoProviderType } from './server/types';

const JWT_SECRET = process.env.JWT_SECRET || 'cinestream_smarttv_vod_secret_key_2026';
const PORT = 3000;

const app = express();
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

const db = DatabaseService.getInstance();

// Static directory for uploaded thumbnails
const uploadsDir = path.join(process.cwd(), 'data', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Multer storage for custom image uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `thumb_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos de imagem (JPG, PNG, WebP) são permitidos.'));
    }
  },
});

// Auth Middleware
interface AuthenticatedRequest extends Request {
  user?: { username: string };
}

function requireAdminAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Acesso negado. Token de autenticação ausente.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { username: string };
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
}

// --- PUBLIC REST API ENDPOINTS ---

// 1. Health check & System info
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'online',
    app: 'CineStream Smart TV VOD',
    timestamp: new Date().toISOString(),
  });
});

// 2. Public Videos
app.get('/api/videos', (req, res) => {
  const publicOnly = req.query.admin !== 'true';
  const videos = db.getVideos(publicOnly);
  res.json(videos);
});

// 3. Single Video by ID
app.get('/api/videos/:id', (req, res) => {
  const video = db.getVideoById(req.params.id);
  if (!video) {
    return res.status(404).json({ error: 'Vídeo não encontrado.' });
  }
  res.json(video);
});

// 4. Public Categories
app.get('/api/categories', (req, res) => {
  const publicOnly = req.query.admin !== 'true';
  const categories = db.getCategories(publicOnly);
  res.json(categories);
});

// 5. Provider Resolver Endpoint (resolves sourceUrl to playbackUrl via Provider Factory)
app.post('/api/provider/resolve', async (req, res) => {
  try {
    const { provider, sourceUrl } = req.body;
    if (!sourceUrl) {
      return res.status(400).json({ error: 'A URL de origem é obrigatória.' });
    }

    const providerType: VideoProviderType = provider || ProviderFactory.autoDetectProvider(sourceUrl);
    const resolved = await ProviderFactory.resolve(providerType, sourceUrl);
    res.json(resolved);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Erro ao resolver fonte de vídeo.' });
  }
});

// 6. Google Drive & Direct Stream Proxy with HTTP 206 Range headers for Smart TVs
app.get('/api/stream/gdrive/:fileId', async (req, res) => {
  const fileId = req.params.fileId;
  if (!fileId) return res.status(400).send('File ID required');

  const directDriveUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
  
  try {
    const range = req.headers.range;
    const fetchHeaders: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    };
    if (range) {
      fetchHeaders['Range'] = range;
    }

    const driveRes = await fetch(directDriveUrl, { headers: fetchHeaders, redirect: 'follow' });

    if (!driveRes.ok && driveRes.status !== 206) {
      // Fallback redirect to drive preview if proxy fails
      return res.redirect(`https://drive.google.com/file/d/${fileId}/preview`);
    }

    const contentType = driveRes.headers.get('content-type') || 'video/mp4';
    const contentLength = driveRes.headers.get('content-length');
    const contentRange = driveRes.headers.get('content-range');

    res.status(driveRes.status);
    res.setHeader('Content-Type', contentType.includes('text/html') ? 'video/mp4' : contentType);
    if (contentLength) res.setHeader('Content-Length', contentLength);
    if (contentRange) res.setHeader('Content-Range', contentRange);
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Access-Control-Allow-Origin', '*');

    if (!driveRes.body) {
      return res.end();
    }

    const reader = driveRes.body.getReader();
    const pump = async () => {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (!res.writableEnded) {
            res.write(Buffer.from(value));
          } else {
            break;
          }
        }
      } catch (e) {
        // Client disconnected or stream ended
      } finally {
        res.end();
      }
    };
    pump();
  } catch (err) {
    console.error('Error proxying Google Drive stream:', err);
    res.redirect(`https://drive.google.com/file/d/${fileId}/preview`);
  }
});

// 7. Mega.nz Direct Stream Proxy with Range support for Smart TV HTML5 player
app.get('/api/stream/mega', async (req, res) => {
  const sourceUrl = req.query.url as string;
  if (!sourceUrl) return res.status(400).send('URL do Mega.nz é necessária');

  try {
    let cleanUrl = sourceUrl;
    if (cleanUrl.includes('#!')) {
      const match = cleanUrl.match(/#!([a-zA-Z0-9_-]+)!([a-zA-Z0-9_-]+)/);
      if (match) {
        cleanUrl = `https://mega.nz/file/${match[1]}#${match[2]}`;
      }
    } else if (cleanUrl.includes('/embed/')) {
      cleanUrl = cleanUrl.replace('/embed/', '/file/');
    }

    const file = MegaFile.fromURL(cleanUrl);
    await file.loadAttributes();

    const fileSize = file.size;
    const fileName = file.name || 'video.mp4';

    let contentType = 'video/mp4';
    if (fileName.endsWith('.mkv')) contentType = 'video/x-matroska';
    if (fileName.endsWith('.webm')) contentType = 'video/webm';
    if (fileName.endsWith('.avi')) contentType = 'video/x-msvideo';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Access-Control-Allow-Origin', '*');

    const range = req.headers.range;
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = (end - start) + 1;

      res.status(206);
      res.setHeader('Content-Range', `bytes ${start}-${end}/${fileSize}`);
      res.setHeader('Content-Length', chunkSize);

      const downloadStream = file.download({ start, end });
      downloadStream.on('error', (err) => {
        console.error('Mega download stream error:', err);
        if (!res.headersSent) res.status(500).end();
      });
      downloadStream.pipe(res);
    } else {
      res.setHeader('Content-Length', fileSize);
      res.status(200);
      const downloadStream = file.download({});
      downloadStream.on('error', (err) => {
        console.error('Mega download stream error:', err);
        if (!res.headersSent) res.status(500).end();
      });
      downloadStream.pipe(res);
    }
  } catch (err: any) {
    console.error('Error in Mega stream proxy:', err);
    res.status(500).send('Erro ao inicializar transmissão do Mega.nz: ' + (err?.message || ''));
  }
});

// --- ADMIN AUTH ENDPOINTS ---

// Admin Login
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Usuário e senha são obrigatórios.' });
  }

  const isValid = db.verifyAdminCredentials(username, password);
  if (!isValid) {
    return res.status(401).json({ error: 'Credenciais inválidas.' });
  }

  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, username });
});

// Verify Current Token
app.get('/api/auth/me', requireAdminAuth, (req: AuthenticatedRequest, res) => {
  res.json({ username: req.user?.username });
});

// Update Password
app.post('/api/admin/change-password', requireAdminAuth, (req, res) => {
  const { newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'A nova senha deve ter no mínimo 6 caracteres.' });
  }

  db.updateAdminPassword(newPassword);
  res.json({ success: true, message: 'Senha alterada com sucesso.' });
});

// --- ADMIN PROTECTED CRUD ENDPOINTS ---

// Create Video
app.post('/api/admin/videos', requireAdminAuth, async (req, res) => {
  try {
    const { title, description, category_id, provider, source_url, thumbnail_type, thumbnail_url, featured, active, display_order, duration, is_series, series_id, season, episode_number } = req.body;

    if (!title || (!is_series && !source_url)) {
      return res.status(400).json({ error: 'Preencha o título e o link do vídeo.' });
    }

    // Auto resolve playback URL if source_url is provided
    let providerType: VideoProviderType = provider || 'direct';
    let playbackUrl = source_url || '';

    if (source_url) {
      providerType = provider || ProviderFactory.autoDetectProvider(source_url);
      try {
        const resolved = await ProviderFactory.resolve(providerType, source_url);
        playbackUrl = resolved.playbackUrl;
      } catch (e) {
        console.warn('Warning resolving provider in POST /api/admin/videos:', e);
      }
    }

    const video = db.createVideo({
      title,
      description: description || '',
      category_id: category_id || 'cat-1',
      provider: providerType,
      source_url: source_url || '',
      playback_url: playbackUrl,
      thumbnail_type: thumbnail_type || 'custom',
      thumbnail_url: thumbnail_url || 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?q=80&w=1200&auto=format&fit=crop',
      featured: Boolean(featured),
      active: active !== undefined ? Boolean(active) : true,
      display_order: Number(display_order) || 1,
      duration: duration || '00:00',
      is_series: Boolean(is_series),
      series_id: series_id || '',
      season: Number(season) || 1,
      episode_number: Number(episode_number) || 1,
    });

    res.status(201).json(video);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Erro ao criar vídeo.' });
  }
});

// Update Video
app.put('/api/admin/videos/:id', requireAdminAuth, async (req, res) => {
  try {
    const id = req.params.id;
    const body = req.body;

    if (body.source_url && !body.is_series) {
      const providerType: VideoProviderType = body.provider || ProviderFactory.autoDetectProvider(body.source_url);
      try {
        const resolved = await ProviderFactory.resolve(providerType, body.source_url);
        body.playback_url = resolved.playbackUrl;
        body.provider = providerType;
      } catch (e) {
        console.warn('Warning resolving provider in PUT /api/admin/videos:', e);
      }
    }

    const updated = db.updateVideo(id, body);
    if (!updated) {
      return res.status(404).json({ error: 'Vídeo não encontrado.' });
    }

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Erro ao atualizar vídeo.' });
  }
});

// Delete Video
app.delete('/api/admin/videos/:id', requireAdminAuth, (req, res) => {
  const success = db.deleteVideo(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Vídeo não encontrado.' });
  }
  res.json({ success: true, message: 'Vídeo excluído com sucesso.' });
});

// Categories CRUD
app.post('/api/admin/categories', requireAdminAuth, (req, res) => {
  const { name, active } = req.body;
  if (!name) return res.status(400).json({ error: 'Nome da categoria é obrigatório.' });

  const category = db.createCategory(name, active !== undefined ? Boolean(active) : true);
  res.status(201).json(category);
});

app.put('/api/admin/categories/:id', requireAdminAuth, (req, res) => {
  const updated = db.updateCategory(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Categoria não encontrada.' });
  res.json(updated);
});

app.delete('/api/admin/categories/:id', requireAdminAuth, (req, res) => {
  db.deleteCategory(req.params.id);
  res.json({ success: true });
});

// Custom Thumbnail Image Upload
app.post('/api/admin/upload-thumbnail', requireAdminAuth, upload.single('thumbnail'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});

// --- VITE & STATIC FILES MIDDLWARE ---
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🎬 CineStream Server running on http://0.0.0.0:${PORT}`);
  });
}

start();
