import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Video, Category, AdminUser } from './types';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');

interface DbSchema {
  videos: Video[];
  categories: Category[];
  admin: AdminUser;
}

// Initial hash for password "admin123"
function hashPassword(pwd: string): string {
  return crypto.createHash('sha256').update(pwd + '_cinestream_salt').digest('hex');
}

const DEFAULT_ADMIN: AdminUser = {
  username: 'admin',
  passwordHash: hashPassword('admin123'),
};

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Ação', slug: 'acao', display_order: 1, active: true },
  { id: 'cat-2', name: 'Comédia', slug: 'comedia', display_order: 2, active: true },
  { id: 'cat-3', name: 'Drama', slug: 'drama', display_order: 3, active: true },
  { id: 'cat-4', name: 'Ficção Científica', slug: 'ficcao-cientifica', display_order: 4, active: true },
  { id: 'cat-5', name: 'Terror & Suspense', slug: 'terror-suspense', display_order: 5, active: true },
  { id: 'cat-6', name: 'Animação', slug: 'animacao', display_order: 6, active: true },
  { id: 'cat-7', name: 'Documentários', slug: 'documentarios', display_order: 7, active: true },
];

const DEFAULT_VIDEOS: Video[] = [];

export class DatabaseService {
  private static instance: DatabaseService;
  private data: DbSchema;

  private constructor() {
    this.ensureDirectoryExists();
    this.data = this.loadData();
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  private ensureDirectoryExists() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }
  }

  private loadData(): DbSchema {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          videos: parsed.videos || DEFAULT_VIDEOS,
          categories: parsed.categories || DEFAULT_CATEGORIES,
          admin: parsed.admin || DEFAULT_ADMIN,
        };
      } catch (e) {
        console.error('Error reading db.json, writing defaults', e);
      }
    }

    const initial: DbSchema = {
      videos: DEFAULT_VIDEOS,
      categories: DEFAULT_CATEGORIES,
      admin: DEFAULT_ADMIN,
    };
    this.saveData(initial);
    return initial;
  }

  private saveData(data: DbSchema) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  }

  // --- Videos CRUD ---
  public getVideos(publicOnly = true): Video[] {
    let list = this.data.videos;
    if (publicOnly) {
      list = list.filter((v) => v.active);
    }
    return [...list].sort((a, b) => a.display_order - b.display_order);
  }

  public getVideoById(id: string): Video | undefined {
    return this.data.videos.find((v) => v.id === id);
  }

  public createVideo(videoData: Omit<Video, 'id' | 'created_at' | 'updated_at'>): Video {
    const id = 'vid-' + Date.now();
    const now = new Date().toISOString();

    // If marked as featured, optionally reset other featured flags if featured is single
    if (videoData.featured) {
      this.data.videos = this.data.videos.map((v) => ({ ...v, featured: false }));
    }

    const newVideo: Video = {
      ...videoData,
      id,
      created_at: now,
      updated_at: now,
    };

    this.data.videos.push(newVideo);
    this.saveData(this.data);
    return newVideo;
  }

  public updateVideo(id: string, updates: Partial<Omit<Video, 'id' | 'created_at'>>): Video | null {
    const index = this.data.videos.findIndex((v) => v.id === id);
    if (index === -1) return null;

    if (updates.featured) {
      this.data.videos = this.data.videos.map((v) =>
        v.id === id ? v : { ...v, featured: false }
      );
    }

    const existing = this.data.videos[index];
    const updated: Video = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    this.data.videos[index] = updated;
    this.saveData(this.data);
    return updated;
  }

  public deleteVideo(id: string): boolean {
    const initialLen = this.data.videos.length;
    this.data.videos = this.data.videos.filter((v) => v.id !== id);
    if (this.data.videos.length < initialLen) {
      this.saveData(this.data);
      return true;
    }
    return false;
  }

  // --- Categories CRUD ---
  public getCategories(publicOnly = true): Category[] {
    let list = this.data.categories;
    if (publicOnly) {
      list = list.filter((c) => c.active);
    }
    return [...list].sort((a, b) => a.display_order - b.display_order);
  }

  public createCategory(name: string, active = true): Category {
    const id = 'cat-' + Date.now();
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const display_order = this.data.categories.length + 1;
    const category: Category = { id, name, slug, display_order, active };
    
    this.data.categories.push(category);
    this.saveData(this.data);
    return category;
  }

  public updateCategory(id: string, updates: Partial<Category>): Category | null {
    const index = this.data.categories.findIndex((c) => c.id === id);
    if (index === -1) return null;

    const existing = this.data.categories[index];
    const updated = { ...existing, ...updates };
    this.data.categories[index] = updated;
    this.saveData(this.data);
    return updated;
  }

  public deleteCategory(id: string): boolean {
    this.data.categories = this.data.categories.filter((c) => c.id !== id);
    this.saveData(this.data);
    return true;
  }

  // --- Auth & Admin ---
  public verifyAdminCredentials(username: string, pwdPlain: string): boolean {
    const hash = hashPassword(pwdPlain);
    return username === this.data.admin.username && hash === this.data.admin.passwordHash;
  }

  public updateAdminPassword(newPwdPlain: string): boolean {
    this.data.admin.passwordHash = hashPassword(newPwdPlain);
    this.saveData(this.data);
    return true;
  }
}
