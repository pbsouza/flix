export type VideoProviderType = 'gdrive' | 'mega' | 'direct' | 'hls' | 's3_r2' | 'youtube';
export type ThumbnailType = 'auto' | 'custom';

export interface Video {
  id: string;
  title: string;
  description: string;
  category_id: string;
  provider: VideoProviderType;
  source_url: string;
  playback_url: string;
  thumbnail_type?: ThumbnailType;
  thumbnail_url: string;
  featured?: boolean;
  active?: boolean;
  display_order?: number;
  duration?: string;
  is_series?: boolean;
  series_id?: string;
  season?: number;
  episode_number?: number;
  views?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  display_order: number;
  active: boolean;
}

export interface ResolvedStream {
  playbackUrl: string;
  mimeType: string;
  isEmbedFallback: boolean;
  embedUrl?: string;
  fileId?: string;
  provider: VideoProviderType;
  instructions?: string;
}

export type AppView = 'home' | 'categories' | 'search' | 'admin';
