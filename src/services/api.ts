import { Video, Category, ResolvedStream } from '../types';

const API_BASE = '/api';

// Initial seeds for static export / offline / localStorage
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
    title: 'Demonstração com Google Drive Provider (Embed Direct)',
    description: 'Vídeo cadastrado via link do Google Drive para demonstração do player de embed direto.',
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

// Local Storage Helpers
function getLocalVideos(): Video[] {
  try {
    const raw = localStorage.getItem('cinestream_videos_db');
    if (!raw) {
      localStorage.setItem('cinestream_videos_db', JSON.stringify(DEFAULT_VIDEOS));
      return DEFAULT_VIDEOS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_VIDEOS;
  }
}

function setLocalVideos(list: Video[]) {
  try {
    localStorage.setItem('cinestream_videos_db', JSON.stringify(list));
  } catch {
    // Ignore
  }
}

function getLocalCategories(): Category[] {
  try {
    const raw = localStorage.getItem('cinestream_categories_db');
    if (!raw) {
      localStorage.setItem('cinestream_categories_db', JSON.stringify(DEFAULT_CATEGORIES));
      return DEFAULT_CATEGORIES;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_CATEGORIES;
  }
}

function setLocalCategories(list: Category[]) {
  try {
    localStorage.setItem('cinestream_categories_db', JSON.stringify(list));
  } catch {
    // Ignore
  }
}

export function getAuthToken(): string | null {
  return localStorage.getItem('cinestream_admin_token');
}

export function setAuthToken(token: string) {
  localStorage.setItem('cinestream_admin_token', token);
}

export function removeAuthToken() {
  localStorage.removeItem('cinestream_admin_token');
}

function getAuthHeaders(): Record<string, string> {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Safely attempts a JSON fetch from backend; falls back if unavailable or not JSON
async function safeApiFetch<T>(url: string, options?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(url, options);
    if (!res.ok) return null;
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchPublicVideos(): Promise<Video[]> {
  const remote = await safeApiFetch<Video[]>(`${API_BASE}/videos`);
  if (remote) {
    setLocalVideos(remote);
    return remote.filter((v) => v.active);
  }
  return getLocalVideos().filter((v) => v.active);
}

export async function fetchAdminVideos(): Promise<Video[]> {
  const remote = await safeApiFetch<Video[]>(`${API_BASE}/videos?admin=true`);
  if (remote) {
    setLocalVideos(remote);
    return remote;
  }
  return getLocalVideos();
}

export async function fetchCategories(admin = false): Promise<Category[]> {
  const remote = await safeApiFetch<Category[]>(`${API_BASE}/categories${admin ? '?admin=true' : ''}`);
  if (remote) {
    setLocalCategories(remote);
    return admin ? remote : remote.filter((c) => c.active);
  }
  const cats = getLocalCategories();
  return admin ? cats : cats.filter((c) => c.active);
}

export async function resolveVideoProvider(sourceUrl: string, provider?: string): Promise<ResolvedStream> {
  const remote = await safeApiFetch<ResolvedStream>(`${API_BASE}/provider/resolve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sourceUrl, provider }),
  });
  if (remote) return remote;

  // Client-side fallback resolution for static deployments
  const url = sourceUrl.trim();
  if (url.includes('mega.nz') || url.includes('mega.io')) {
    const megaMatch = url.match(/mega\.(?:nz|io)\/(?:file|embed)\/([a-zA-Z0-9_-]+)(?:[#!]([a-zA-Z0-9_-]+))?/i);
    let embed = url;
    if (megaMatch && megaMatch[1]) {
      const key = megaMatch[2] ? `#${megaMatch[2]}` : '';
      embed = `https://mega.nz/embed/${megaMatch[1]}${key}`;
    }
    return {
      playbackUrl: embed,
      mimeType: 'text/html',
      isEmbedFallback: true,
      embedUrl: embed,
      provider: 'mega',
      instructions: 'Mega.nz embed configurado para exibição.',
    };
  }

  if (url.includes('drive.google.com') || url.includes('docs.google.com')) {
    const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    const fileId = match ? match[1] : '';
    const embedUrl = fileId ? `https://drive.google.com/file/d/${fileId}/preview` : url;
    return {
      playbackUrl: embedUrl,
      mimeType: 'text/html',
      isEmbedFallback: true,
      embedUrl,
      fileId,
      provider: 'gdrive',
      instructions: 'Google Drive preview embed configurado com sucesso.',
    };
  }

  return {
    playbackUrl: url,
    mimeType: 'video/mp4',
    isEmbedFallback: false,
    provider: (provider as any) || 'direct',
    instructions: 'Link direto processado com sucesso.',
  };
}

// Admin Auth
export async function loginAdmin(username: string, password: string): Promise<{ token: string; username: string }> {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (res.ok) {
      const data = await res.json();
      setAuthToken(data.token);
      return data;
    }
  } catch {
    // Offline / Static fallback
  }

  // Client-side static admin credentials fallback
  const savedPwd = localStorage.getItem('cinestream_admin_pwd') || 'admin123';
  if (username === 'admin' && password === savedPwd) {
    const mockToken = 'static_admin_token_' + Date.now();
    setAuthToken(mockToken);
    return { token: mockToken, username: 'admin' };
  }

  throw new Error('Credenciais inválidas.');
}

export async function verifyAdminAuth(): Promise<boolean> {
  const token = getAuthToken();
  if (!token) return false;
  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
    });
    if (res.ok) return true;
  } catch {
    // Fallback
  }
  return token.startsWith('static_admin_token') || Boolean(token);
}

export async function changeAdminPassword(newPassword: string): Promise<void> {
  try {
    const res = await fetch(`${API_BASE}/admin/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ newPassword }),
    });
    if (res.ok) return;
  } catch {
    // Fallback
  }
  localStorage.setItem('cinestream_admin_pwd', newPassword);
}

// Admin Video CRUD
export async function createVideo(videoData: Partial<Video>): Promise<Video> {
  try {
    const res = await fetch(`${API_BASE}/admin/videos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(videoData),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Fallback
  }

  const list = getLocalVideos();
  const id = 'vid-' + Date.now();
  const newVideo: Video = {
    id,
    title: videoData.title || 'Sem título',
    description: videoData.description || '',
    category_id: videoData.category_id || 'cat-1',
    provider: videoData.provider || 'direct',
    source_url: videoData.source_url || '',
    playback_url: videoData.playback_url || videoData.source_url || '',
    thumbnail_type: videoData.thumbnail_type || 'custom',
    thumbnail_url: videoData.thumbnail_url || '',
    featured: Boolean(videoData.featured),
    active: videoData.active !== undefined ? videoData.active : true,
    display_order: list.length + 1,
    duration: videoData.duration || '05:00',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (newVideo.featured) {
    list.forEach((v) => (v.featured = false));
  }

  list.unshift(newVideo);
  setLocalVideos(list);
  return newVideo;
}

export async function updateVideo(id: string, updates: Partial<Video>): Promise<Video> {
  try {
    const res = await fetch(`${API_BASE}/admin/videos/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(updates),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Fallback
  }

  const list = getLocalVideos();
  const idx = list.findIndex((v) => v.id === id);
  if (idx === -1) throw new Error('Vídeo não encontrado.');

  if (updates.featured) {
    list.forEach((v) => {
      if (v.id !== id) v.featured = false;
    });
  }

  const updated: Video = {
    ...list[idx],
    ...updates,
    updated_at: new Date().toISOString(),
  };

  list[idx] = updated;
  setLocalVideos(list);
  return updated;
}

export async function deleteVideo(id: string): Promise<void> {
  try {
    const res = await fetch(`${API_BASE}/admin/videos/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (res.ok) return;
  } catch {
    // Fallback
  }

  const list = getLocalVideos().filter((v) => v.id !== id);
  setLocalVideos(list);
}

// Admin Category CRUD
export async function createCategory(name: string, active = true): Promise<Category> {
  try {
    const res = await fetch(`${API_BASE}/admin/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ name, active }),
    });
    if (res.ok) return await res.json();
  } catch {
    // Fallback
  }

  const list = getLocalCategories();
  const id = 'cat-' + Date.now();
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const newCat: Category = {
    id,
    name,
    slug,
    display_order: list.length + 1,
    active,
  };
  list.push(newCat);
  setLocalCategories(list);
  return newCat;
}

export async function updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
  try {
    const res = await fetch(`${API_BASE}/admin/categories/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(updates),
    });
    if (res.ok) return await res.json();
  } catch {
    // Fallback
  }

  const list = getLocalCategories();
  const idx = list.findIndex((c) => c.id === id);
  if (idx === -1) throw new Error('Categoria não encontrada.');

  const updated = { ...list[idx], ...updates };
  list[idx] = updated;
  setLocalCategories(list);
  return updated;
}

export async function deleteCategory(id: string): Promise<void> {
  try {
    const res = await fetch(`${API_BASE}/admin/categories/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (res.ok) return;
  } catch {
    // Fallback
  }

  const list = getLocalCategories().filter((c) => c.id !== id);
  setLocalCategories(list);
}

// Upload Thumbnail
export async function uploadThumbnail(file: File): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('thumbnail', file);

    const res = await fetch(`${API_BASE}/admin/upload-thumbnail`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      return data.url;
    }
  } catch {
    // Fallback
  }

  // Client-side Base64 Data URL fallback for static host
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Erro ao ler arquivo local'));
    reader.readAsDataURL(file);
  });
}
