import { VideoProviderType, ResolvedStream } from './types';

export interface IVideoProvider {
  name: string;
  type: VideoProviderType;
  resolvePlayback(sourceUrl: string): Promise<ResolvedStream>;
  extractFileId?(url: string): string | null;
}

/**
 * Google Drive Provider Implementation
 * Resolves Google Drive sharing/view links into direct stream proxies or preview embed fallbacks.
 */
export class GoogleDriveProvider implements IVideoProvider {
  name = 'Google Drive';
  type: VideoProviderType = 'gdrive';

  extractFileId(url: string): string | null {
    if (!url) return null;
    
    // Patterns:
    // https://drive.google.com/file/d/FILE_ID/view
    // https://drive.google.com/open?id=FILE_ID
    // https://drive.google.com/uc?id=FILE_ID
    const fileDMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileDMatch && fileDMatch[1]) return fileDMatch[1];

    const idParamMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (idParamMatch && idParamMatch[1]) return idParamMatch[1];

    // Direct clean string check if user pasted pure ID
    if (/^[a-zA-Z0-9_-]{25,50}$/.test(url.trim())) {
      return url.trim();
    }

    return null;
  }

  async resolvePlayback(sourceUrl: string): Promise<ResolvedStream> {
    const fileId = this.extractFileId(sourceUrl);
    
    if (!fileId) {
      return {
        playbackUrl: sourceUrl,
        mimeType: 'video/mp4',
        isEmbedFallback: false,
        provider: 'gdrive',
        instructions: 'URL do Google Drive não possui um ID de arquivo válido. Usando link fornecido.',
      };
    }

    // Google Drive direct stream proxy link for Smart TV HTML5 player
    const streamProxyUrl = `/api/stream/gdrive/${fileId}`;
    const embedUrl = `https://drive.google.com/file/d/${fileId}/preview`;

    return {
      playbackUrl: streamProxyUrl,
      mimeType: 'video/mp4',
      isEmbedFallback: false,
      embedUrl,
      fileId,
      provider: 'gdrive',
      instructions: 'Link do Google Drive direcionado para o proxy de streaming direto de alta velocidade para Smart TV.',
    };
  }
}

/**
 * Mega.nz Provider Implementation
 * Converts Mega.nz sharing/embed URLs into official embed player URLs (e.g. https://mega.nz/embed/fileID#fileKey or https://mega.nz/embed/fileID!fileKey)
 */
export class MegaNZProvider implements IVideoProvider {
  name = 'Mega.nz';
  type: VideoProviderType = 'mega';

  extractFileId(url: string): string | null {
    if (!url) return null;
    const trimmed = url.trim();

    // Standard format: https://mega.nz/file/fileID#fileKey or https://mega.nz/embed/fileID#fileKey (or with !)
    const fileMatch = trimmed.match(/mega\.(?:nz|io)\/(?:file|embed)\/([a-zA-Z0-9_-]+)(?:[#!]([a-zA-Z0-9_-]+))?/i);
    if (fileMatch && fileMatch[1]) {
      const id = fileMatch[1];
      const key = fileMatch[2];
      return key ? `${id}#${key}` : id;
    }

    // Legacy format: https://mega.nz/#!fileID!fileKey or https://mega.nz/embed/#!fileID!fileKey
    const legacyMatch = trimmed.match(/mega\.(?:nz|io)\/(?:embed\/)?#!([a-zA-Z0-9_-]+)!([a-zA-Z0-9_-]+)/i);
    if (legacyMatch && legacyMatch[1] && legacyMatch[2]) {
      return `${legacyMatch[1]}#${legacyMatch[2]}`;
    }

    // Raw fileID#fileKey or fileID!fileKey input
    if (/^[a-zA-Z0-9_-]+[#!][a-zA-Z0-9_-]+$/.test(trimmed)) {
      return trimmed.replace('!', '#');
    }

    return null;
  }

  async resolvePlayback(sourceUrl: string): Promise<ResolvedStream> {
    const trimmed = sourceUrl.trim();
    const extracted = this.extractFileId(trimmed);

    // Stream proxy URL for Mega.nz files to play directly in app HTML5 player
    const streamProxyUrl = `/api/stream/mega?url=${encodeURIComponent(trimmed)}`;
    const embedUrl = extracted ? `https://mega.nz/embed/${extracted}` : trimmed;

    return {
      playbackUrl: streamProxyUrl,
      mimeType: 'video/mp4',
      isEmbedFallback: false,
      embedUrl,
      fileId: extracted || undefined,
      provider: 'mega',
      instructions: 'Link do Mega.nz direcionado para o proxy de transmissão direta para reprodução no player nativo do aplicativo.',
    };
  }
}

/**
 * Direct Video Provider (MP4, WebM, OGV, direct CDN links)
 */
export class DirectVideoProvider implements IVideoProvider {
  name = 'Direct MP4/WebM URL';
  type: VideoProviderType = 'direct';

  async resolvePlayback(sourceUrl: string): Promise<ResolvedStream> {
    let mimeType = 'video/mp4';
    if (sourceUrl.endsWith('.webm')) mimeType = 'video/webm';
    if (sourceUrl.endsWith('.ogv')) mimeType = 'video/ogg';

    return {
      playbackUrl: sourceUrl.trim(),
      mimeType,
      isEmbedFallback: false,
      provider: 'direct',
    };
  }
}

/**
 * HLS Adaptive Streaming Provider (.m3u8)
 */
export class HLSProvider implements IVideoProvider {
  name = 'HLS Stream (.m3u8)';
  type: VideoProviderType = 'hls';

  async resolvePlayback(sourceUrl: string): Promise<ResolvedStream> {
    return {
      playbackUrl: sourceUrl.trim(),
      mimeType: 'application/x-mpegURL',
      isEmbedFallback: false,
      provider: 'hls',
    };
  }
}

/**
 * S3 / Cloudflare R2 / Supabase Storage Provider
 */
export class S3R2Provider implements IVideoProvider {
  name = 'Cloudflare R2 / Amazon S3 / Supabase';
  type: VideoProviderType = 's3_r2';

  async resolvePlayback(sourceUrl: string): Promise<ResolvedStream> {
    return {
      playbackUrl: sourceUrl.trim(),
      mimeType: 'video/mp4',
      isEmbedFallback: false,
      provider: 's3_r2',
    };
  }
}

/**
 * Provider Factory - Centralized registry mapping video providers
 */
export class ProviderFactory {
  private static providers: Map<VideoProviderType, IVideoProvider> = new Map([
    ['gdrive', new GoogleDriveProvider()],
    ['mega', new MegaNZProvider()],
    ['direct', new DirectVideoProvider()],
    ['hls', new HLSProvider()],
    ['s3_r2', new S3R2Provider()],
  ]);

  static getProvider(type: VideoProviderType): IVideoProvider {
    const provider = this.providers.get(type);
    if (!provider) {
      return new DirectVideoProvider();
    }
    return provider;
  }

  static autoDetectProvider(url: string): VideoProviderType {
    if (!url) return 'direct';
    if (url.includes('drive.google.com') || url.includes('docs.google.com')) {
      return 'gdrive';
    }
    if (url.includes('mega.nz') || url.includes('mega.io')) {
      return 'mega';
    }
    if (url.endsWith('.m3u8') || url.includes('/hls/')) {
      return 'hls';
    }
    if (url.includes('r2.cloudflarestorage.com') || url.includes('supabase.co/storage') || url.includes('amazonaws.com')) {
      return 's3_r2';
    }
    return 'direct';
  }

  static async resolve(type: VideoProviderType, sourceUrl: string): Promise<ResolvedStream> {
    const provider = this.getProvider(type);
    return await provider.resolvePlayback(sourceUrl);
  }
}
