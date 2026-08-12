import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Video, Category } from '../types';
import { VideoCard } from './VideoCard';

interface VideoRowProps {
  title: string;
  videos: Video[];
  categories: Category[];
  onSelectVideo: (video: Video) => void;
  rowId: string;
}

export const VideoRow: React.FC<VideoRowProps> = ({
  title,
  videos,
  categories,
  onSelectVideo,
  rowId,
}) => {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      rowRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!videos || videos.length === 0) return null;

  return (
    <div className="space-y-3 mb-8">
      {/* Row Header */}
      <div className="flex items-center justify-between px-2">
        <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <span className="w-2 h-6 bg-red-600 rounded-full inline-block" />
          {title}
        </h2>

        {/* Desktop Scroll Controls */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={() => scroll('left')}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
            title="Anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
            title="Próximo"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Horizontal Scrollable Slider */}
      <div
        ref={rowRef}
        className="flex items-center gap-4 overflow-x-auto pb-4 pt-2 scrollbar-none scroll-smooth px-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {videos.map((video) => {
          const categoryName = categories.find((c) => c.id === video.category_id)?.name;
          return (
            <VideoCard
              key={video.id}
              video={video}
              categoryName={categoryName}
              onSelect={onSelectVideo}
              focusPrefix={rowId}
            />
          );
        })}
      </div>
    </div>
  );
};
