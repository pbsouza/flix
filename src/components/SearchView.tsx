import React, { useState } from 'react';
import { Search, Film, AlertCircle } from 'lucide-react';
import { Video, Category } from '../types';
import { VideoCard } from './VideoCard';
import { useSmartTVFocus } from '../context/FocusContext';

interface SearchViewProps {
  videos: Video[];
  categories: Category[];
  onSelectVideo: (video: Video) => void;
}

export const SearchView: React.FC<SearchViewProps> = ({ videos, categories, onSelectVideo }) => {
  const [query, setQuery] = useState('');

  const searchInputFocus = useSmartTVFocus('search-input-box');

  const filtered = query.trim()
    ? videos.filter((v) => {
        const q = query.toLowerCase();
        const cat = categories.find((c) => c.id === v.category_id)?.name.toLowerCase() || '';
        return (
          v.title.toLowerCase().includes(q) ||
          v.description.toLowerCase().includes(q) ||
          cat.includes(q)
        );
      })
    : videos;

  return (
    <div className="space-y-8 pb-12">
      {/* Search Bar Input */}
      <div className="relative max-w-2xl mx-auto">
        <Search className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 w-5 h-5 sm:w-6 sm:h-6 text-zinc-400" />
        <input
          {...searchInputFocus.focusProps}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Pesquisar por título, sinopse ou categoria..."
          className={`w-full pl-11 sm:pl-14 pr-4 sm:pr-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-zinc-900 border text-white placeholder-zinc-500 text-sm sm:text-lg font-medium focus:outline-none transition-all ${
            searchInputFocus.isFocused
              ? 'ring-4 ring-red-500 border-red-500 bg-zinc-800'
              : 'border-zinc-800 hover:border-zinc-700'
          }`}
          autoFocus
        />
      </div>

      {/* Results Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base sm:text-xl font-bold text-white flex items-center gap-2">
            <Film className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
            {query.trim() ? `Resultados para "${query}"` : 'Todos os Vídeos'}
          </h2>
          <span className="text-[11px] sm:text-xs font-semibold text-zinc-400">
            {filtered.length} {filtered.length === 1 ? 'vídeo' : 'vídeos'}
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="p-8 sm:p-12 text-center bg-zinc-900/50 border border-zinc-800 rounded-2xl text-zinc-500 space-y-3">
            <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 mx-auto text-zinc-600" />
            <h3 className="text-base sm:text-lg font-bold text-zinc-300">Nenhum resultado encontrado</h3>
            <p className="text-xs sm:text-sm text-zinc-500">Tente buscar usando termos diferentes ou o nome da categoria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filtered.map((video) => {
              const catName = categories.find((c) => c.id === video.category_id)?.name;
              return (
                <VideoCard
                  key={video.id}
                  video={video}
                  categoryName={catName}
                  onSelect={onSelectVideo}
                  focusPrefix="searchgrid"
                  className="w-full"
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
