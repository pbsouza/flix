import React from 'react';
import { Play, Info, Sparkles, Clock } from 'lucide-react';
import { Video, Category } from '../types';
import { useSmartTVFocus } from '../context/FocusContext';

interface HeroFeaturedProps {
  video: Video | null;
  categories: Category[];
  onPlay: (video: Video) => void;
}

export const HeroFeatured: React.FC<HeroFeaturedProps> = ({ video, categories, onPlay }) => {
  const watchFocus = useSmartTVFocus('hero-watch-btn', () => {
    if (video) onPlay(video);
  });

  if (!video) {
    return (
      <div className="w-full h-[400px] bg-zinc-900 animate-pulse rounded-2xl flex items-center justify-center text-zinc-600">
        Carregando conteúdo em destaque...
      </div>
    );
  }

  const categoryName = categories.find((c) => c.id === video.category_id)?.name || 'Geral';
  const posterUrl = video.thumbnail_url && video.thumbnail_url.trim()
    ? video.thumbnail_url
    : 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?q=80&w=600&auto=format&fit=crop';

  return (
    <div className="relative w-full h-[480px] md:h-[540px] rounded-3xl overflow-hidden shadow-2xl mb-10 group border border-zinc-800/80">
      {/* Background Poster Image */}
      <img
        src={posterUrl}
        alt={video.title}
        className="absolute inset-0 w-full h-full object-cover object-center scale-105 group-hover:scale-100 transition-transform duration-700 brightness-75"
        loading="eager"
      />

      {/* Dark Vignette & Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent w-full md:w-3/4" />

      {/* Content Content Container */}
      <div className="absolute bottom-0 left-0 p-8 md:p-12 max-w-3xl z-10 space-y-4">
        {/* Featured Tag & Category */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-600 text-white shadow-md shadow-red-900/50">
            <Sparkles className="w-3.5 h-3.5 fill-white" />
            Destaque Principal
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-zinc-800/90 text-zinc-300 border border-zinc-700/60 backdrop-blur-md">
            {categoryName}
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-zinc-400">
            <Clock className="w-3.5 h-3.5" />
            {video.duration}
          </span>
        </div>

        {/* Video Title */}
        <h1 className="text-3xl md:text-5xl font-black text-white leading-tight tracking-tight drop-shadow-md">
          {video.title}
        </h1>

        {/* Video Synopsis */}
        <p className="text-zinc-300 text-sm md:text-base line-clamp-3 md:line-clamp-4 leading-relaxed font-normal max-w-2xl">
          {video.description || 'Sem sinopse disponível.'}
        </p>

        {/* Action Controls */}
        <div className="pt-2 flex items-center gap-4">
          <button
            {...watchFocus.focusProps}
            className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-base font-bold transition-all shadow-xl ${
              watchFocus.isFocused
                ? 'bg-red-600 text-white ring-4 ring-red-400 scale-105 shadow-red-900/60 z-20'
                : 'bg-red-600 hover:bg-red-500 text-white shadow-red-900/40'
            }`}
          >
            <Play className="w-6 h-6 fill-white" />
            <span>ASSISTIR AGORA</span>
          </button>
        </div>
      </div>
    </div>
  );
};
