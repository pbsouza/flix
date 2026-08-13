import React, { useState } from 'react';
import { Category, Video } from '../types';
import { VideoCard } from './VideoCard';
import { Grid, Filter } from 'lucide-react';
import { useSmartTVFocus } from '../context/FocusContext';

interface CategoryViewProps {
  categories: Category[];
  videos: Video[];
  onSelectVideo: (video: Video) => void;
}

export const CategoryView: React.FC<CategoryViewProps> = ({ categories, videos, onSelectVideo }) => {
  const [selectedCatId, setSelectedCatId] = useState<string | null>(categories[0]?.id || null);

  const filteredVideos = selectedCatId
    ? videos.filter((v) => v.category_id === selectedCatId)
    : videos;

  return (
    <div className="space-y-8 pb-12">
      {/* View Title */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500">
          <Grid className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">Navegar por Categorias</h1>
          <p className="text-zinc-400 text-sm">Selecione uma categoria para filtrar o catálogo completo</p>
        </div>
      </div>

      {/* Category Pills Navigation */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
        <CategoryPill
          id="cat-pill-all"
          label="Todas as Categorias"
          isSelected={selectedCatId === null}
          onClick={() => setSelectedCatId(null)}
        />
        {categories.map((cat) => (
          <CategoryPill
            key={cat.id}
            id={`cat-pill-${cat.id}`}
            label={cat.name}
            isSelected={selectedCatId === cat.id}
            onClick={() => setSelectedCatId(cat.id)}
          />
        ))}
      </div>

      {/* Video Grid */}
      {filteredVideos.length === 0 ? (
        <div className="p-12 text-center bg-zinc-900/50 border border-zinc-800 rounded-2xl text-zinc-500 space-y-2">
          <Filter className="w-8 h-8 mx-auto text-zinc-600" />
          <p className="font-semibold text-zinc-400">Nenhum vídeo cadastrado nesta categoria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredVideos.map((video) => {
            const catName = categories.find((c) => c.id === video.category_id)?.name;
            return (
              <VideoCard
                key={video.id}
                video={video}
                categoryName={catName}
                onSelect={onSelectVideo}
                focusPrefix="catgrid"
                className="w-full"
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

interface CategoryPillProps {
  id: string;
  label: string;
  isSelected: boolean;
  onClick: () => void;
}

const CategoryPill: React.FC<CategoryPillProps> = ({ id, label, isSelected, onClick }) => {
  const { isFocused, focusProps } = useSmartTVFocus(id, onClick);

  return (
    <button
      {...focusProps}
      className={`px-5 py-2.5 rounded-2xl text-sm font-bold whitespace-nowrap transition-all border ${
        isSelected
          ? 'bg-red-600 text-white border-red-500 shadow-lg shadow-red-950/50'
          : 'bg-zinc-900/90 text-zinc-300 border-zinc-800 hover:bg-zinc-800 hover:text-white'
      } ${isFocused ? 'ring-4 ring-red-400 scale-105 bg-red-600 border-red-400 text-white z-10' : ''}`}
    >
      {label}
    </button>
  );
};
