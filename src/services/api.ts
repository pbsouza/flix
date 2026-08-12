import { Video, Category, ResolvedStream } from '../types';

const API_BASE = '/api';

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

export async function fetchPublicVideos(): Promise<Video[]> {
  const res = await fetch(`${API_BASE}/videos`);
  if (!res.ok) throw new Error('Erro ao carregar vídeos.');
  return res.json();
}

export async function fetchAdminVideos(): Promise<Video[]> {
  const res = await fetch(`${API_BASE}/videos?admin=true`);
  if (!res.ok) throw new Error('Erro ao carregar vídeos do painel.');
  return res.json();
}

export async function fetchCategories(admin = false): Promise<Category[]> {
  const res = await fetch(`${API_BASE}/categories${admin ? '?admin=true' : ''}`);
  if (!res.ok) throw new Error('Erro ao carregar categorias.');
  return res.json();
}

export async function resolveVideoProvider(sourceUrl: string, provider?: string): Promise<ResolvedStream> {
  const res = await fetch(`${API_BASE}/provider/resolve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sourceUrl, provider }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Falha ao resolver fonte de vídeo.');
  }
  return res.json();
}

// Admin Auth
export async function loginAdmin(username: string, password: string): Promise<{ token: string; username: string }> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Credenciais inválidas.');
  }
  const data = await res.json();
  setAuthToken(data.token);
  return data;
}

export async function verifyAdminAuth(): Promise<boolean> {
  const token = getAuthToken();
  if (!token) return false;
  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function changeAdminPassword(newPassword: string): Promise<void> {
  const res = await fetch(`${API_BASE}/admin/change-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ newPassword }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Erro ao alterar senha.');
  }
}

// Admin Video CRUD
export async function createVideo(videoData: Partial<Video>): Promise<Video> {
  const res = await fetch(`${API_BASE}/admin/videos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(videoData),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Erro ao cadastrar vídeo.');
  }
  return res.json();
}

export async function updateVideo(id: string, updates: Partial<Video>): Promise<Video> {
  const res = await fetch(`${API_BASE}/admin/videos/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(updates),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Erro ao atualizar vídeo.');
  }
  return res.json();
}

export async function deleteVideo(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/admin/videos/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Erro ao excluir vídeo.');
  }
}

// Admin Category CRUD
export async function createCategory(name: string, active = true): Promise<Category> {
  const res = await fetch(`${API_BASE}/admin/categories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ name, active }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Erro ao criar categoria.');
  }
  return res.json();
}

export async function updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
  const res = await fetch(`${API_BASE}/admin/categories/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(updates),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Erro ao atualizar categoria.');
  }
  return res.json();
}

export async function deleteCategory(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/admin/categories/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Erro ao excluir categoria.');
  }
}

// Upload Thumbnail
export async function uploadThumbnail(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('thumbnail', file);

  const res = await fetch(`${API_BASE}/admin/upload-thumbnail`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Erro ao fazer upload da imagem.');
  }

  const data = await res.json();
  return data.url;
}
