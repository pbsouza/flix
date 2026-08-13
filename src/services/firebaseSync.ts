import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDoc,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Video, Category } from '../types';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Ação', slug: 'acao', display_order: 1, active: true },
  { id: 'cat-2', name: 'Comédia', slug: 'comedia', display_order: 2, active: true },
  { id: 'cat-3', name: 'Drama', slug: 'drama', display_order: 3, active: true },
  { id: 'cat-4', name: 'Ficção Científica', slug: 'ficcao-cientifica', display_order: 4, active: true },
  { id: 'cat-5', name: 'Terror & Suspense', slug: 'terror-suspense', display_order: 5, active: true },
  { id: 'cat-6', name: 'Animação', slug: 'animacao', display_order: 6, active: true },
  { id: 'cat-7', name: 'Documentários', slug: 'documentarios', display_order: 7, active: true },
];

const LOCAL_META_KEY = 'cinestream_fb_last_updated';
const LOCAL_VIDEOS_KEY = 'cinestream_fb_videos';
const LOCAL_CATEGORIES_KEY = 'cinestream_fb_categories';

/**
 * STRATEGY FOR MINIMIZING FIRESTORE READS:
 * 1. Read single light document `app_meta/sync` containing `last_updated` timestamp (1 read).
 * 2. If `last_updated` matches client local cache timestamp, reuse cached array (0 additional reads).
 * 3. Only if `last_updated` changed, query `videos` / `categories` and update client cache.
 */

async function bumpSyncTimestamp(): Promise<number> {
  const newTime = Date.now();
  try {
    await setDoc(doc(db, 'app_meta', 'sync'), { last_updated: newTime }, { merge: true });
    localStorage.setItem(LOCAL_META_KEY, newTime.toString());
  } catch (err) {
    console.warn('Erro ao atualizar carimbo de sincronização do Firebase:', err);
  }
  return newTime;
}

async function needsSync(): Promise<boolean> {
  try {
    const metaRef = doc(db, 'app_meta', 'sync');
    const metaSnap = await getDoc(metaRef);
    if (!metaSnap.exists()) return true;

    const serverTime = metaSnap.data().last_updated || 0;
    const localTime = parseInt(localStorage.getItem(LOCAL_META_KEY) || '0', 10);
    return serverTime > localTime;
  } catch (e) {
    console.warn('Aviso ao consultar metadados do Firebase, usando cache local:', e);
    return false;
  }
}

export async function getFirebaseVideos(): Promise<Video[]> {
  const cachedData = localStorage.getItem(LOCAL_VIDEOS_KEY);
  const localVideos: Video[] = cachedData ? JSON.parse(cachedData) : [];

  const shouldFetch = cachedData ? await needsSync() : true;

  if (!shouldFetch && cachedData) {
    return localVideos;
  }

  try {
    const q = query(collection(db, 'videos'));
    const snapshot = await getDocs(q);

    const fetchedVideos: Video[] = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    } as Video));

    localStorage.setItem(LOCAL_VIDEOS_KEY, JSON.stringify(fetchedVideos));
    return fetchedVideos;
  } catch (err) {
    console.warn('Falha ao buscar vídeos no Firestore, retornando cache local:', err);
    return localVideos;
  }
}

export async function getFirebaseCategories(): Promise<Category[]> {
  const cachedData = localStorage.getItem(LOCAL_CATEGORIES_KEY);
  const localCategories: Category[] = cachedData ? JSON.parse(cachedData) : DEFAULT_CATEGORIES;

  const shouldFetch = cachedData ? await needsSync() : true;

  if (!shouldFetch && cachedData) {
    return localCategories;
  }

  try {
    const q = query(collection(db, 'categories'));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      // Seed default movie categories if collection is brand new
      for (const cat of DEFAULT_CATEGORIES) {
        await setDoc(doc(db, 'categories', cat.id), cat);
      }
      await bumpSyncTimestamp();
      localStorage.setItem(LOCAL_CATEGORIES_KEY, JSON.stringify(DEFAULT_CATEGORIES));
      return DEFAULT_CATEGORIES;
    }

    const fetchedCats: Category[] = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    } as Category));

    fetchedCats.sort((a, b) => a.display_order - b.display_order);
    localStorage.setItem(LOCAL_CATEGORIES_KEY, JSON.stringify(fetchedCats));
    return fetchedCats;
  } catch (err) {
    console.warn('Falha ao buscar categorias no Firestore, retornando cache local:', err);
    return localCategories;
  }
}

export async function saveFirebaseVideo(video: Video): Promise<Video> {
  const videoRef = doc(db, 'videos', video.id);
  await setDoc(videoRef, video, { merge: true });
  await bumpSyncTimestamp();

  // Update local cache
  const cachedData = localStorage.getItem(LOCAL_VIDEOS_KEY);
  const videos: Video[] = cachedData ? JSON.parse(cachedData) : [];
  const index = videos.findIndex((v) => v.id === video.id);
  if (index >= 0) {
    videos[index] = video;
  } else {
    videos.unshift(video);
  }
  localStorage.setItem(LOCAL_VIDEOS_KEY, JSON.stringify(videos));

  return video;
}

export async function removeFirebaseVideo(id: string): Promise<boolean> {
  await deleteDoc(doc(db, 'videos', id));
  await bumpSyncTimestamp();

  const cachedData = localStorage.getItem(LOCAL_VIDEOS_KEY);
  const videos: Video[] = cachedData ? JSON.parse(cachedData) : [];
  const filtered = videos.filter((v) => v.id !== id);
  localStorage.setItem(LOCAL_VIDEOS_KEY, JSON.stringify(filtered));

  return true;
}

export async function saveFirebaseCategory(category: Category): Promise<Category> {
  const catRef = doc(db, 'categories', category.id);
  await setDoc(catRef, category, { merge: true });
  await bumpSyncTimestamp();

  const cachedData = localStorage.getItem(LOCAL_CATEGORIES_KEY);
  const categories: Category[] = cachedData ? JSON.parse(cachedData) : DEFAULT_CATEGORIES;
  const index = categories.findIndex((c) => c.id === category.id);
  if (index >= 0) {
    categories[index] = category;
  } else {
    categories.push(category);
  }
  localStorage.setItem(LOCAL_CATEGORIES_KEY, JSON.stringify(categories));

  return category;
}

export async function removeFirebaseCategory(id: string): Promise<boolean> {
  await deleteDoc(doc(db, 'categories', id));
  await bumpSyncTimestamp();

  const cachedData = localStorage.getItem(LOCAL_CATEGORIES_KEY);
  const categories: Category[] = cachedData ? JSON.parse(cachedData) : DEFAULT_CATEGORIES;
  const filtered = categories.filter((c) => c.id !== id);
  localStorage.setItem(LOCAL_CATEGORIES_KEY, JSON.stringify(filtered));

  return true;
}
