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
  { id: 'cat-1', name: 'Treinamentos', slug: 'treinamentos', display_order: 1, active: true },
  { id: 'cat-2', name: 'Instalação e Montagem', slug: 'instalacao', display_order: 2, active: true },
  { id: 'cat-3', name: 'Construção Civil & Calhas', slug: 'construcao-calhas', display_order: 3, active: true },
  { id: 'cat-4', name: 'Tutoriais & Guia Prático', slug: 'tutoriais', display_order: 4, active: true },
  { id: 'cat-5', name: 'Avisos & Comunicados', slug: 'avisos', display_order: 5, active: true },
];

const DEFAULT_VIDEOS: Video[] = [
  {
    id: 'vid-1',
    title: 'Guia de Montagem e Fixação de Calhas de Alumínio',
    description: 'Aprenda o passo a passo completo para instalar calhas de alumínio de alta durabilidade com inclinação correta e vedações à prova de vazamentos.',
    category_id: 'cat-3',
    provider: 'direct',
    source_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    playback_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnail_type: 'custom',
    thumbnail_url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?q=80&w=1200&auto=format&fit=crop',
    featured: true,
    active: true,
    display_order: 1,
    duration: '09:56',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'vid-2',
    title: 'Treinamento de Segurança no Trabalho em Altura (NR-35)',
    description: 'Treinamento obrigatório para equipes de instalação sobre uso correto de linhas de vida, cintos de paraquedista e inspeção diária de EPIs.',
    category_id: 'cat-1',
    provider: 'direct',
    source_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    playback_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    thumbnail_type: 'custom',
    thumbnail_url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=1200&auto=format&fit=crop',
    featured: false,
    active: true,
    display_order: 2,
    duration: '10:53',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'vid-3',
    title: 'Técnicas Avançadas de Impermeabilização de Telhados',
    description: 'Demostração prática da aplicação de manta asfáltica e resinas elásticas em telhados industriais e residenciais.',
    category_id: 'cat-2',
    provider: 'direct',
    source_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    playback_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnail_type: 'custom',
    thumbnail_url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=1200&auto=format&fit=crop',
    featured: false,
    active: true,
    display_order: 3,
    duration: '00:15',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'vid-4',
    title: 'Tutorial: Leitura de Plantas e Projetos Hidráulicos',
    description: 'Como interpretar símbolos, cotas e conexões de plantas baixas antes de iniciar a perfuração e passagem de dutos.',
    category_id: 'cat-4',
    provider: 'direct',
    source_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    playback_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnail_type: 'custom',
    thumbnail_url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=1200&auto=format&fit=crop',
    featured: false,
    active: true,
    display_order: 4,
    duration: '00:15',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'vid-5',
    title: 'Demonstração com Google Drive Provider (Proxy e Stream Direct)',
    description: 'Vídeo cadastrado via link do Google Drive para demonstração do pipeline de abstração de provedor sem acoplamento direto.',
    category_id: 'cat-4',
    provider: 'gdrive',
    source_url: 'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs/view',
    playback_url: 'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs/preview',
    thumbnail_type: 'custom',
    thumbnail_url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200&auto=format&fit=crop',
    featured: false,
    active: true,
    display_order: 5,
    duration: '05:30',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

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
