import React from 'react';
import { Play, Sparkles, Clock, Film } from 'lucide-react';
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
      <div className="relative w-full h-[280px] sm:h-[360px] rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-zinc-950 via-zinc-900 to-zinc-900/80 border border-zinc-800 p-6 sm:p-10 flex flex-col items-center justify-center text-center space-y-4 mb-8 shadow-2xl">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-red-600/15 border border-red-500/30 flex items-center justify-center text-red-500 shadow-lg shadow-red-950/40">
          <Film className="w-7 h-7 sm:w-8 sm:h-8" />
        </div>
        <div className="max-w-md space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Catálogo Pronto para Filmes</h2>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
            O banco de dados foi limpo e atualizado com categorias de cinema (Ação, Comédia, Drama, Ficção Científica, etc.).
            Acesse o <strong className="text-red-400 font-semibold">Painel Admin</strong> no menu superior para cadastrar seus primeiros filmes e vídeos!
          </p>
        </div>
      </div>
    );
  }

  const categoryName = categories.find((c) => c.id === video.category_id)?.name || 'Geral';
  const posterUrl = video.thumbnail_url && video.thumbnail_url.trim()
    ? video.thumbnail_url
    : 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?q=80&w=600&auto=format&fit=crop';

  return (
    <div className="relative w-full h-[380px] xs:h-[440px] sm:h-[480px] md:h-[540px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl mb-8 sm:mb-10 group border border-zinc-800/80">
      {/* Background Poster Image */}
      <img
        src={posterUrl}
        alt={video.title}
        className="absolute inset-0 w-full h-full object-cover object-center scale-105 group-hover:scale-100 transition-transform duration-700 brightness-75"
        loading="eager"
      />

      {/* Dark Vignette & Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/75 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent w-full md:w-3/4" />

      {/* Content Container */}
      <div className="absolute bottom-0 left-0 p-4 xs:p-6 sm:p-8 md:p-12 max-w-3xl z-10 space-y-2.5 sm:space-y-4 w-full">
        {/* Featured Tag & Category */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-3">
          <span className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-red-600 text-white shadow-md shadow-red-900/50">
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-white" />
            Destaque
          </span>
          <span className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-zinc-800/90 text-zinc-300 border border-zinc-700/60 backdrop-blur-md">
            {categoryName}
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-medium text-zinc-400">
            <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            {video.duration}
          </span>
        </div>

        {/* Video Title */}
        <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-5xl font-black text-white leading-tight tracking-tight drop-shadow-md line-clamp-2">
          {video.title}
        </h1>

        {/* Video Synopsis */}
        <p className="text-zinc-300 text-xs sm:text-sm md:text-base line-clamp-2 xs:line-clamp-3 md:line-clamp-4 leading-relaxed font-normal max-w-2xl">
          {video.description || 'Sem sinopse disponível.'}
        </p>

        {/* Action Controls */}
        <div className="pt-1 sm:pt-2 flex items-center gap-4">
          <button
            {...watchFocus.focusProps}
            className={`w-full sm:w-auto flex items-center justify-center gap-2.5 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl text-xs sm:text-base font-bold transition-all shadow-xl active:scale-95 ${
              watchFocus.isFocused
                ? 'bg-red-600 text-white ring-4 ring-red-400 scale-105 shadow-red-900/60 z-20'
                : 'bg-red-600 hover:bg-red-500 text-white shadow-red-900/40'
            }`}
          >
            <Play className="w-4 h-4 sm:w-6 sm:h-6 fill-white" />
            <span>{video.is_series ? 'VER EPISÓDIOS' : 'ASSISTIR AGORA'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
