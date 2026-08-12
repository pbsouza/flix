import React, { useState, useRef } from 'react';
import { X, Upload, Sparkles, AlertCircle, Check, Play, RefreshCw, Image as ImageIcon } from 'lucide-react';
import { Video, Category, VideoProviderType, ThumbnailType } from '../../types';
import { resolveVideoProvider, uploadThumbnail } from '../../services/api';

const PRESET_THUMBNAILS = [
  { label: 'Treinamento & Trabalho', url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200&auto=format&fit=crop' },
  { label: 'Calhas & Construção', url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?q=80&w=1200&auto=format&fit=crop' },
  { label: 'Indústria & Oficina', url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1200&auto=format&fit=crop' },
  { label: 'Cinema & Streaming', url: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?q=80&w=1200&auto=format&fit=crop' },
  { label: 'Tecnologia & Digital', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop' },
  { label: 'Corporativo & Negócios', url: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=1200&auto=format&fit=crop' },
];

interface VideoFormModalProps {
  video: Video | null;
  categories: Category[];
  onSave: (data: Partial<Video>) => Promise<void>;
  onClose: () => void;
}

export const VideoFormModal: React.FC<VideoFormModalProps> = ({
  video,
  categories,
  onSave,
  onClose,
}) => {
  const isEditing = Boolean(video);

  const [title, setTitle] = useState(video?.title || '');
  const [description, setDescription] = useState(video?.description || '');
  const [categoryId, setCategoryId] = useState(video?.category_id || categories[0]?.id || 'cat-1');
  const [provider, setProvider] = useState<VideoProviderType>(video?.provider || 'gdrive');
  const [sourceUrl, setSourceUrl] = useState(video?.source_url || '');
  const [playbackUrl, setPlaybackUrl] = useState(video?.playback_url || '');
  const [thumbnailType, setThumbnailType] = useState<ThumbnailType>(video?.thumbnail_type || 'custom');
  const [thumbnailUrl, setThumbnailUrl] = useState(video?.thumbnail_url || '');
  const [featured, setFeatured] = useState(video?.featured || false);
  const [active, setActive] = useState(video?.active !== undefined ? video.active : true);
  const [displayOrder, setDisplayOrder] = useState(video?.display_order || 1);
  const [duration, setDuration] = useState(video?.duration || '05:00');

  const [testingLink, setTestingLink] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testError, setTestError] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Hidden file input for custom thumbnail upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Hidden video element for auto frame capture
  const hiddenVideoRef = useRef<HTMLVideoElement>(null);
  const hiddenCanvasRef = useRef<HTMLCanvasElement>(null);

  // Test provider resolution
  const handleTestLink = async () => {
    if (!sourceUrl.trim()) return;
    setTestingLink(true);
    setTestResult(null);
    setTestError(null);

    try {
      const resolved = await resolveVideoProvider(sourceUrl, provider);
      setPlaybackUrl(resolved.playbackUrl);
      setTestResult(`Link resolvido com sucesso! (${resolved.provider})`);
    } catch (err: any) {
      setTestError(err.message || 'Falha ao resolver URL do vídeo.');
    } finally {
      setTestingLink(false);
    }
  };

  // Custom Image Upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setFormError(null);

    try {
      const uploadedUrl = await uploadThumbnail(file);
      setThumbnailUrl(uploadedUrl);
      setThumbnailType('custom');
    } catch (err: any) {
      setFormError(err.message || 'Erro ao enviar imagem.');
    } finally {
      setUploadingImage(false);
    }
  };

  // Auto Cover Generator based on provider / stream / presets
  const handleAutoGenerateThumbnail = () => {
    const rawUrl = `${sourceUrl} ${playbackUrl}`;

    // 1. Check YouTube URL
    const ytMatch = rawUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
    if (ytMatch && ytMatch[1]) {
      const ytId = ytMatch[1];
      setThumbnailUrl(`https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`);
      setThumbnailType('auto');
      setTestResult('Capa automática gerada do YouTube!');
      return;
    }

    // 2. Check Google Drive URL
    const driveMatch = rawUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/i) ||
                       rawUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/i) ||
                       rawUrl.match(/\/proxy\/gdrive\/([a-zA-Z0-9_-]+)/i);
    if (driveMatch && driveMatch[1]) {
      const fileId = driveMatch[1];
      setThumbnailUrl(`https://lh3.googleusercontent.com/d/${fileId}=s1200`);
      setThumbnailType('auto');
      setTestResult('Capa automática gerada do Google Drive!');
      return;
    }

    // 3. Canvas capture for HTML5 direct MP4/WebM videos
    const videoEl = hiddenVideoRef.current;
    const canvas = hiddenCanvasRef.current;
    if (videoEl && canvas) {
      try {
        videoEl.currentTime = (videoEl.duration || 10) * 0.25;
        setTimeout(() => {
          try {
            const ctx = canvas.getContext('2d');
            if (ctx && videoEl.videoWidth > 0) {
              canvas.width = videoEl.videoWidth;
              canvas.height = videoEl.videoHeight;
              ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
              const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
              setThumbnailUrl(dataUrl);
              setThumbnailType('auto');
              setTestResult('Frame capturado com sucesso do vídeo!');
              return;
            }
          } catch {
            // CORS error or unextractable video frame
          }
          // Fallback to random preset if frame capture is blocked
          const preset = PRESET_THUMBNAILS[Math.floor(Math.random() * PRESET_THUMBNAILS.length)];
          setThumbnailUrl(preset.url);
          setThumbnailType('auto');
          setTestResult(`Capa automática aplicada (${preset.label})`);
        }, 300);
        return;
      } catch {
        // Fallthrough
      }
    }

    // 4. Default fallback theme preset
    const defaultPreset = PRESET_THUMBNAILS[0];
    setThumbnailUrl(defaultPreset.url);
    setThumbnailType('auto');
    setTestResult(`Capa temática aplicada (${defaultPreset.label})`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !sourceUrl.trim()) {
      setFormError('Título e Link do Vídeo são campos obrigatórios.');
      return;
    }

    setSaving(true);
    setFormError(null);

    try {
      await onSave({
        title,
        description,
        category_id: categoryId,
        provider,
        source_url: sourceUrl,
        playback_url: playbackUrl || sourceUrl,
        thumbnail_type: thumbnailType,
        thumbnail_url: thumbnailUrl || 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?q=80&w=1200&auto=format&fit=crop',
        featured,
        active,
        display_order: Number(displayOrder),
        duration,
      });
      onClose();
    } catch (err: any) {
      setFormError(err.message || 'Erro ao salvar vídeo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <h2 className="text-xl font-bold text-white">
            {isEditing ? 'Editar Vídeo' : 'Cadastrar Novo Vídeo'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {formError && (
          <div className="p-4 rounded-2xl bg-red-950/60 border border-red-800 text-red-200 text-xs font-semibold flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
              Título do Vídeo *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Treinamento de Instalação de Calhas"
              className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:outline-none focus:border-red-500"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
              Sinopse / Descrição
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o conteúdo do vídeo..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:outline-none focus:border-red-500 resize-none"
            />
          </div>

          {/* Category & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                Categoria
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:outline-none focus:border-red-500"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                Duração (Ex: 12:45)
              </label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="10:00"
                className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          {/* Provider Selection */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
              Provedor de Armazenamento
            </label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value as VideoProviderType)}
              className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:outline-none focus:border-red-500 font-semibold"
            >
              <option value="mega">Mega.nz (Player Embed)</option>
              <option value="gdrive">Google Drive (Link Compartilhável / Proxy)</option>
              <option value="direct">Direto MP4 / WebM (URL limpa de vídeo)</option>
              <option value="s3_r2">Cloudflare R2 / Supabase / Amazon S3</option>
              <option value="hls">HLS Adaptive Stream (.m3u8)</option>
            </select>
          </div>

          {/* Source Link & Resolution Test */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
              Link / URL do Vídeo *
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={sourceUrl}
                onChange={(e) => {
                  const val = e.target.value;
                  setSourceUrl(val);
                  if (val.includes('mega.nz') || val.includes('mega.io')) {
                    setProvider('mega');
                  } else if (val.includes('drive.google.com') || val.includes('docs.google.com')) {
                    setProvider('gdrive');
                  } else if (val.endsWith('.m3u8')) {
                    setProvider('hls');
                  }
                }}
                placeholder="https://mega.nz/file/... ou https://drive.google.com/file/d/..."
                className="flex-1 px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:outline-none focus:border-red-500 font-mono text-xs"
                required
              />
              <button
                type="button"
                onClick={handleTestLink}
                disabled={testingLink || !sourceUrl.trim()}
                className="px-4 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs flex items-center gap-1.5 transition-colors whitespace-nowrap"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testingLink ? 'animate-spin' : ''}`} />
                <span>Testar Link</span>
              </button>
            </div>
            {testResult && <p className="text-[11px] text-emerald-400 font-semibold mt-1">{testResult}</p>}
            {testError && <p className="text-[11px] text-red-400 font-semibold mt-1">{testError}</p>}
          </div>

          {/* THUMBNAIL SYSTEM */}
          <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider block flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-red-500" />
                SISTEMA DE THUMBNAIL (CAPA DO VÍDEO)
              </label>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-900 border border-zinc-800 text-red-400 uppercase">
                {thumbnailType}
              </span>
            </div>

            {/* URL da Capa Direct Input */}
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-zinc-400 block">URL da Imagem da Capa:</span>
              <input
                type="url"
                value={thumbnailUrl}
                onChange={(e) => {
                  setThumbnailUrl(e.target.value);
                  setThumbnailType('custom');
                }}
                placeholder="https://exemplo.com/imagem.jpg ou cole um link de imagem..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white font-mono text-xs focus:outline-none focus:border-red-500"
              />
            </div>

            {/* Preview Box & Controls */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-1">
              <div className="relative w-full sm:w-48 aspect-video bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 flex-shrink-0">
                {thumbnailUrl && thumbnailUrl.trim() ? (
                  <img
                    src={thumbnailUrl}
                    alt="Capa Prévia"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?q=80&w=600&auto=format&fit=crop';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs">
                    Sem Capa
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex-1 space-y-3 w-full">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleAutoGenerateThumbnail}
                    className="px-3 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Gerar Capa Automática</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs flex items-center gap-1.5 transition-all"
                  >
                    <Upload className="w-3.5 h-3.5 text-red-400" />
                    <span>{uploadingImage ? 'Enviando...' : 'Fazer Upload de Imagem'}</span>
                  </button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                {/* Preset Themes Gallery */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                    Ou escolha uma capa pronta por tema:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_THUMBNAILS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setThumbnailUrl(preset.url);
                          setThumbnailType('auto');
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-all ${
                          thumbnailUrl === preset.url
                            ? 'bg-red-950/80 border-red-500 text-red-300'
                            : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Options: Featured, Active, Display Order */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <label className="flex items-center gap-3 p-3 rounded-xl bg-zinc-950 border border-zinc-800 cursor-pointer">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-4 h-4 rounded text-red-600 focus:ring-red-500 bg-zinc-900 border-zinc-700"
              />
              <span className="text-xs font-bold text-white">Destaque Principal</span>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-xl bg-zinc-950 border border-zinc-800 cursor-pointer">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="w-4 h-4 rounded text-red-600 focus:ring-red-500 bg-zinc-900 border-zinc-700"
              />
              <span className="text-xs font-bold text-white">Vídeo Ativo</span>
            </label>

            <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center gap-2">
              <span className="text-xs font-bold text-zinc-400 whitespace-nowrap">Ordem:</span>
              <input
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(Number(e.target.value))}
                className="w-full bg-transparent text-white text-xs font-bold focus:outline-none"
              />
            </div>
          </div>

          {/* Submit Controls */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-950/50"
            >
              {saving ? 'Salvando...' : 'Salvar Vídeo'}
            </button>
          </div>
        </form>

        {/* Hidden Elements for Frame Grabbing */}
        <video ref={hiddenVideoRef} src={playbackUrl || undefined} className="hidden" crossOrigin="anonymous" />
        <canvas ref={hiddenCanvasRef} className="hidden" />
      </div>
    </div>
  );
};
