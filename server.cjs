var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path2 = __toESM(require("path"), 1);
var import_fs2 = __toESM(require("fs"), 1);
var import_multer = __toESM(require("multer"), 1);
var import_jsonwebtoken = __toESM(require("jsonwebtoken"), 1);
var import_vite = require("vite");

// server/db.ts
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);
var import_crypto = __toESM(require("crypto"), 1);
var DATA_DIR = import_path.default.join(process.cwd(), "data");
var DB_FILE = import_path.default.join(DATA_DIR, "db.json");
var UPLOADS_DIR = import_path.default.join(DATA_DIR, "uploads");
function hashPassword(pwd) {
  return import_crypto.default.createHash("sha256").update(pwd + "_cinestream_salt").digest("hex");
}
var DEFAULT_ADMIN = {
  username: "admin",
  passwordHash: hashPassword("admin123")
};
var DEFAULT_CATEGORIES = [
  { id: "cat-1", name: "Treinamentos", slug: "treinamentos", display_order: 1, active: true },
  { id: "cat-2", name: "Instala\xE7\xE3o e Montagem", slug: "instalacao", display_order: 2, active: true },
  { id: "cat-3", name: "Constru\xE7\xE3o Civil & Calhas", slug: "construcao-calhas", display_order: 3, active: true },
  { id: "cat-4", name: "Tutoriais & Guia Pr\xE1tico", slug: "tutoriais", display_order: 4, active: true },
  { id: "cat-5", name: "Avisos & Comunicados", slug: "avisos", display_order: 5, active: true }
];
var DEFAULT_VIDEOS = [
  {
    id: "vid-1",
    title: "Guia de Montagem e Fixa\xE7\xE3o de Calhas de Alum\xEDnio",
    description: "Aprenda o passo a passo completo para instalar calhas de alum\xEDnio de alta durabilidade com inclina\xE7\xE3o correta e veda\xE7\xF5es \xE0 prova de vazamentos.",
    category_id: "cat-3",
    provider: "direct",
    source_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    playback_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    thumbnail_type: "custom",
    thumbnail_url: "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?q=80&w=1200&auto=format&fit=crop",
    featured: true,
    active: true,
    display_order: 1,
    duration: "09:56",
    created_at: (/* @__PURE__ */ new Date()).toISOString(),
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "vid-2",
    title: "Treinamento de Seguran\xE7a no Trabalho em Altura (NR-35)",
    description: "Treinamento obrigat\xF3rio para equipes de instala\xE7\xE3o sobre uso correto de linhas de vida, cintos de paraquedista e inspe\xE7\xE3o di\xE1ria de EPIs.",
    category_id: "cat-1",
    provider: "direct",
    source_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    playback_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    thumbnail_type: "custom",
    thumbnail_url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=1200&auto=format&fit=crop",
    featured: false,
    active: true,
    display_order: 2,
    duration: "10:53",
    created_at: (/* @__PURE__ */ new Date()).toISOString(),
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "vid-3",
    title: "T\xE9cnicas Avan\xE7adas de Impermeabiliza\xE7\xE3o de Telhados",
    description: "Demostra\xE7\xE3o pr\xE1tica da aplica\xE7\xE3o de manta asf\xE1ltica e resinas el\xE1sticas em telhados industriais e residenciais.",
    category_id: "cat-2",
    provider: "direct",
    source_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    playback_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    thumbnail_type: "custom",
    thumbnail_url: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=1200&auto=format&fit=crop",
    featured: false,
    active: true,
    display_order: 3,
    duration: "00:15",
    created_at: (/* @__PURE__ */ new Date()).toISOString(),
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "vid-4",
    title: "Tutorial: Leitura de Plantas e Projetos Hidr\xE1ulicos",
    description: "Como interpretar s\xEDmbolos, cotas e conex\xF5es de plantas baixas antes de iniciar a perfura\xE7\xE3o e passagem de dutos.",
    category_id: "cat-4",
    provider: "direct",
    source_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    playback_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    thumbnail_type: "custom",
    thumbnail_url: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=1200&auto=format&fit=crop",
    featured: false,
    active: true,
    display_order: 4,
    duration: "00:15",
    created_at: (/* @__PURE__ */ new Date()).toISOString(),
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "vid-5",
    title: "Demonstra\xE7\xE3o com Google Drive Provider (Proxy e Stream Direct)",
    description: "V\xEDdeo cadastrado via link do Google Drive para demonstra\xE7\xE3o do pipeline de abstra\xE7\xE3o de provedor sem acoplamento direto.",
    category_id: "cat-4",
    provider: "gdrive",
    source_url: "https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs/view",
    playback_url: "https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs/preview",
    thumbnail_type: "custom",
    thumbnail_url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200&auto=format&fit=crop",
    featured: false,
    active: true,
    display_order: 5,
    duration: "05:30",
    created_at: (/* @__PURE__ */ new Date()).toISOString(),
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  }
];
var DatabaseService = class _DatabaseService {
  constructor() {
    this.ensureDirectoryExists();
    this.data = this.loadData();
  }
  static getInstance() {
    if (!_DatabaseService.instance) {
      _DatabaseService.instance = new _DatabaseService();
    }
    return _DatabaseService.instance;
  }
  ensureDirectoryExists() {
    if (!import_fs.default.existsSync(DATA_DIR)) {
      import_fs.default.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!import_fs.default.existsSync(UPLOADS_DIR)) {
      import_fs.default.mkdirSync(UPLOADS_DIR, { recursive: true });
    }
  }
  loadData() {
    if (import_fs.default.existsSync(DB_FILE)) {
      try {
        const raw = import_fs.default.readFileSync(DB_FILE, "utf-8");
        const parsed = JSON.parse(raw);
        return {
          videos: parsed.videos || DEFAULT_VIDEOS,
          categories: parsed.categories || DEFAULT_CATEGORIES,
          admin: parsed.admin || DEFAULT_ADMIN
        };
      } catch (e) {
        console.error("Error reading db.json, writing defaults", e);
      }
    }
    const initial = {
      videos: DEFAULT_VIDEOS,
      categories: DEFAULT_CATEGORIES,
      admin: DEFAULT_ADMIN
    };
    this.saveData(initial);
    return initial;
  }
  saveData(data) {
    import_fs.default.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  }
  // --- Videos CRUD ---
  getVideos(publicOnly = true) {
    let list = this.data.videos;
    if (publicOnly) {
      list = list.filter((v) => v.active);
    }
    return [...list].sort((a, b) => a.display_order - b.display_order);
  }
  getVideoById(id) {
    return this.data.videos.find((v) => v.id === id);
  }
  createVideo(videoData) {
    const id = "vid-" + Date.now();
    const now = (/* @__PURE__ */ new Date()).toISOString();
    if (videoData.featured) {
      this.data.videos = this.data.videos.map((v) => ({ ...v, featured: false }));
    }
    const newVideo = {
      ...videoData,
      id,
      created_at: now,
      updated_at: now
    };
    this.data.videos.push(newVideo);
    this.saveData(this.data);
    return newVideo;
  }
  updateVideo(id, updates) {
    const index = this.data.videos.findIndex((v) => v.id === id);
    if (index === -1) return null;
    if (updates.featured) {
      this.data.videos = this.data.videos.map(
        (v) => v.id === id ? v : { ...v, featured: false }
      );
    }
    const existing = this.data.videos[index];
    const updated = {
      ...existing,
      ...updates,
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.data.videos[index] = updated;
    this.saveData(this.data);
    return updated;
  }
  deleteVideo(id) {
    const initialLen = this.data.videos.length;
    this.data.videos = this.data.videos.filter((v) => v.id !== id);
    if (this.data.videos.length < initialLen) {
      this.saveData(this.data);
      return true;
    }
    return false;
  }
  // --- Categories CRUD ---
  getCategories(publicOnly = true) {
    let list = this.data.categories;
    if (publicOnly) {
      list = list.filter((c) => c.active);
    }
    return [...list].sort((a, b) => a.display_order - b.display_order);
  }
  createCategory(name, active = true) {
    const id = "cat-" + Date.now();
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const display_order = this.data.categories.length + 1;
    const category = { id, name, slug, display_order, active };
    this.data.categories.push(category);
    this.saveData(this.data);
    return category;
  }
  updateCategory(id, updates) {
    const index = this.data.categories.findIndex((c) => c.id === id);
    if (index === -1) return null;
    const existing = this.data.categories[index];
    const updated = { ...existing, ...updates };
    this.data.categories[index] = updated;
    this.saveData(this.data);
    return updated;
  }
  deleteCategory(id) {
    this.data.categories = this.data.categories.filter((c) => c.id !== id);
    this.saveData(this.data);
    return true;
  }
  // --- Auth & Admin ---
  verifyAdminCredentials(username, pwdPlain) {
    const hash = hashPassword(pwdPlain);
    return username === this.data.admin.username && hash === this.data.admin.passwordHash;
  }
  updateAdminPassword(newPwdPlain) {
    this.data.admin.passwordHash = hashPassword(newPwdPlain);
    this.saveData(this.data);
    return true;
  }
};

// server/providers.ts
var GoogleDriveProvider = class {
  constructor() {
    this.name = "Google Drive";
    this.type = "gdrive";
  }
  extractFileId(url) {
    if (!url) return null;
    const fileDMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileDMatch && fileDMatch[1]) return fileDMatch[1];
    const idParamMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (idParamMatch && idParamMatch[1]) return idParamMatch[1];
    if (/^[a-zA-Z0-9_-]{25,50}$/.test(url.trim())) {
      return url.trim();
    }
    return null;
  }
  async resolvePlayback(sourceUrl) {
    const fileId = this.extractFileId(sourceUrl);
    if (!fileId) {
      return {
        playbackUrl: sourceUrl,
        mimeType: "video/mp4",
        isEmbedFallback: false,
        provider: "gdrive",
        instructions: "URL do Google Drive n\xE3o possui um ID de arquivo v\xE1lido. Usando link fornecido."
      };
    }
    const embedUrl = `https://drive.google.com/file/d/${fileId}/preview`;
    return {
      playbackUrl: embedUrl,
      mimeType: "text/html",
      isEmbedFallback: true,
      embedUrl,
      fileId,
      provider: "gdrive",
      instructions: "Link do Google Drive processado com sucesso para reprodu\xE7\xE3o via preview embed."
    };
  }
};
var MegaNZProvider = class {
  constructor() {
    this.name = "Mega.nz";
    this.type = "mega";
  }
  extractFileId(url) {
    if (!url) return null;
    const trimmed = url.trim();
    const fileMatch = trimmed.match(/mega\.(?:nz|io)\/(?:file|embed)\/([a-zA-Z0-9_-]+)(?:[#!]([a-zA-Z0-9_-]+))?/i);
    if (fileMatch && fileMatch[1]) {
      const id = fileMatch[1];
      const key = fileMatch[2];
      return key ? `${id}#${key}` : id;
    }
    const legacyMatch = trimmed.match(/mega\.(?:nz|io)\/(?:embed\/)?#!([a-zA-Z0-9_-]+)!([a-zA-Z0-9_-]+)/i);
    if (legacyMatch && legacyMatch[1] && legacyMatch[2]) {
      return `${legacyMatch[1]}#${legacyMatch[2]}`;
    }
    if (/^[a-zA-Z0-9_-]+[#!][a-zA-Z0-9_-]+$/.test(trimmed)) {
      return trimmed.replace("!", "#");
    }
    return null;
  }
  async resolvePlayback(sourceUrl) {
    const trimmed = sourceUrl.trim();
    let embedUrl = trimmed;
    const extracted = this.extractFileId(trimmed);
    if (extracted) {
      embedUrl = `https://mega.nz/embed/${extracted}`;
    } else if (trimmed.includes("mega.nz") || trimmed.includes("mega.io")) {
      if (!trimmed.includes("/embed/")) {
        embedUrl = trimmed.replace(/\/file\//i, "/embed/");
      }
    }
    return {
      playbackUrl: embedUrl,
      mimeType: "text/html",
      isEmbedFallback: true,
      embedUrl,
      provider: "mega",
      instructions: "Link do Mega.nz preparado com sucesso para reprodu\xE7\xE3o via embed."
    };
  }
};
var DirectVideoProvider = class {
  constructor() {
    this.name = "Direct MP4/WebM URL";
    this.type = "direct";
  }
  async resolvePlayback(sourceUrl) {
    let mimeType = "video/mp4";
    if (sourceUrl.endsWith(".webm")) mimeType = "video/webm";
    if (sourceUrl.endsWith(".ogv")) mimeType = "video/ogg";
    return {
      playbackUrl: sourceUrl.trim(),
      mimeType,
      isEmbedFallback: false,
      provider: "direct"
    };
  }
};
var HLSProvider = class {
  constructor() {
    this.name = "HLS Stream (.m3u8)";
    this.type = "hls";
  }
  async resolvePlayback(sourceUrl) {
    return {
      playbackUrl: sourceUrl.trim(),
      mimeType: "application/x-mpegURL",
      isEmbedFallback: false,
      provider: "hls"
    };
  }
};
var S3R2Provider = class {
  constructor() {
    this.name = "Cloudflare R2 / Amazon S3 / Supabase";
    this.type = "s3_r2";
  }
  async resolvePlayback(sourceUrl) {
    return {
      playbackUrl: sourceUrl.trim(),
      mimeType: "video/mp4",
      isEmbedFallback: false,
      provider: "s3_r2"
    };
  }
};
var ProviderFactory = class {
  static {
    this.providers = /* @__PURE__ */ new Map([
      ["gdrive", new GoogleDriveProvider()],
      ["mega", new MegaNZProvider()],
      ["direct", new DirectVideoProvider()],
      ["hls", new HLSProvider()],
      ["s3_r2", new S3R2Provider()]
    ]);
  }
  static getProvider(type) {
    const provider = this.providers.get(type);
    if (!provider) {
      return new DirectVideoProvider();
    }
    return provider;
  }
  static autoDetectProvider(url) {
    if (!url) return "direct";
    if (url.includes("drive.google.com") || url.includes("docs.google.com")) {
      return "gdrive";
    }
    if (url.includes("mega.nz") || url.includes("mega.io")) {
      return "mega";
    }
    if (url.endsWith(".m3u8") || url.includes("/hls/")) {
      return "hls";
    }
    if (url.includes("r2.cloudflarestorage.com") || url.includes("supabase.co/storage") || url.includes("amazonaws.com")) {
      return "s3_r2";
    }
    return "direct";
  }
  static async resolve(type, sourceUrl) {
    const provider = this.getProvider(type);
    return await provider.resolvePlayback(sourceUrl);
  }
};

// server.ts
var JWT_SECRET = process.env.JWT_SECRET || "cinestream_smarttv_vod_secret_key_2026";
var PORT = 3e3;
var app = (0, import_express.default)();
app.use(import_express.default.json({ limit: "20mb" }));
app.use(import_express.default.urlencoded({ extended: true, limit: "20mb" }));
var db = DatabaseService.getInstance();
var uploadsDir = import_path2.default.join(process.cwd(), "data", "uploads");
if (!import_fs2.default.existsSync(uploadsDir)) {
  import_fs2.default.mkdirSync(uploadsDir, { recursive: true });
}
app.use("/uploads", import_express.default.static(uploadsDir));
var storage = import_multer.default.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const ext = import_path2.default.extname(file.originalname) || ".jpg";
    cb(null, `thumb_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`);
  }
});
var upload = (0, import_multer.default)({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  // 10MB limit
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Apenas arquivos de imagem (JPG, PNG, WebP) s\xE3o permitidos."));
    }
  }
});
function requireAdminAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Acesso negado. Token de autentica\xE7\xE3o ausente." });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = import_jsonwebtoken.default.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token inv\xE1lido ou expirado." });
  }
}
app.get("/api/health", (_req, res) => {
  res.json({
    status: "online",
    app: "CineStream Smart TV VOD",
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
app.get("/api/videos", (req, res) => {
  const publicOnly = req.query.admin !== "true";
  const videos = db.getVideos(publicOnly);
  res.json(videos);
});
app.get("/api/videos/:id", (req, res) => {
  const video = db.getVideoById(req.params.id);
  if (!video) {
    return res.status(404).json({ error: "V\xEDdeo n\xE3o encontrado." });
  }
  res.json(video);
});
app.get("/api/categories", (req, res) => {
  const publicOnly = req.query.admin !== "true";
  const categories = db.getCategories(publicOnly);
  res.json(categories);
});
app.post("/api/provider/resolve", async (req, res) => {
  try {
    const { provider, sourceUrl } = req.body;
    if (!sourceUrl) {
      return res.status(400).json({ error: "A URL de origem \xE9 obrigat\xF3ria." });
    }
    const providerType = provider || ProviderFactory.autoDetectProvider(sourceUrl);
    const resolved = await ProviderFactory.resolve(providerType, sourceUrl);
    res.json(resolved);
  } catch (err) {
    res.status(500).json({ error: err.message || "Erro ao resolver fonte de v\xEDdeo." });
  }
});
app.get("/api/provider/proxy/gdrive/:fileId", (req, res) => {
  const fileId = req.params.fileId;
  if (!fileId) return res.status(400).send("File ID missing");
  const drivePreviewUrl = `https://drive.google.com/file/d/${fileId}/preview`;
  res.redirect(drivePreviewUrl);
});
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Usu\xE1rio e senha s\xE3o obrigat\xF3rios." });
  }
  const isValid = db.verifyAdminCredentials(username, password);
  if (!isValid) {
    return res.status(401).json({ error: "Credenciais inv\xE1lidas." });
  }
  const token = import_jsonwebtoken.default.sign({ username }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ token, username });
});
app.get("/api/auth/me", requireAdminAuth, (req, res) => {
  res.json({ username: req.user?.username });
});
app.post("/api/admin/change-password", requireAdminAuth, (req, res) => {
  const { newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: "A nova senha deve ter no m\xEDnimo 6 caracteres." });
  }
  db.updateAdminPassword(newPassword);
  res.json({ success: true, message: "Senha alterada com sucesso." });
});
app.post("/api/admin/videos", requireAdminAuth, async (req, res) => {
  try {
    const { title, description, category_id, provider, source_url, thumbnail_type, thumbnail_url, featured, active, display_order, duration } = req.body;
    if (!title || !source_url) {
      return res.status(400).json({ error: "T\xEDtulo e URL do v\xEDdeo s\xE3o obrigat\xF3rios." });
    }
    const providerType = provider || ProviderFactory.autoDetectProvider(source_url);
    const resolved = await ProviderFactory.resolve(providerType, source_url);
    const video = db.createVideo({
      title,
      description: description || "",
      category_id: category_id || "cat-1",
      provider: providerType,
      source_url,
      playback_url: resolved.playbackUrl,
      thumbnail_type: thumbnail_type || "custom",
      thumbnail_url: thumbnail_url || "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?q=80&w=1200&auto=format&fit=crop",
      featured: Boolean(featured),
      active: active !== void 0 ? Boolean(active) : true,
      display_order: Number(display_order) || 1,
      duration: duration || "00:00"
    });
    res.status(201).json(video);
  } catch (err) {
    res.status(500).json({ error: err.message || "Erro ao criar v\xEDdeo." });
  }
});
app.put("/api/admin/videos/:id", requireAdminAuth, async (req, res) => {
  try {
    const id = req.params.id;
    const body = req.body;
    if (body.source_url || body.provider) {
      const providerType = body.provider || ProviderFactory.autoDetectProvider(body.source_url);
      const resolved = await ProviderFactory.resolve(providerType, body.source_url);
      body.playback_url = resolved.playbackUrl;
      body.provider = providerType;
    }
    const updated = db.updateVideo(id, body);
    if (!updated) {
      return res.status(404).json({ error: "V\xEDdeo n\xE3o encontrado." });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message || "Erro ao atualizar v\xEDdeo." });
  }
});
app.delete("/api/admin/videos/:id", requireAdminAuth, (req, res) => {
  const success = db.deleteVideo(req.params.id);
  if (!success) {
    return res.status(404).json({ error: "V\xEDdeo n\xE3o encontrado." });
  }
  res.json({ success: true, message: "V\xEDdeo exclu\xEDdo com sucesso." });
});
app.post("/api/admin/categories", requireAdminAuth, (req, res) => {
  const { name, active } = req.body;
  if (!name) return res.status(400).json({ error: "Nome da categoria \xE9 obrigat\xF3rio." });
  const category = db.createCategory(name, active !== void 0 ? Boolean(active) : true);
  res.status(201).json(category);
});
app.put("/api/admin/categories/:id", requireAdminAuth, (req, res) => {
  const updated = db.updateCategory(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: "Categoria n\xE3o encontrada." });
  res.json(updated);
});
app.delete("/api/admin/categories/:id", requireAdminAuth, (req, res) => {
  db.deleteCategory(req.params.id);
  res.json({ success: true });
});
app.post("/api/admin/upload-thumbnail", requireAdminAuth, upload.single("thumbnail"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Nenhum arquivo enviado." });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path2.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*all", (_req, res) => {
      res.sendFile(import_path2.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\u{1F3AC} CineStream Server running on http://0.0.0.0:${PORT}`);
  });
}
start();
//# sourceMappingURL=server.cjs.map
