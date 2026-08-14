import React, { useState } from 'react';
import { Play, Clock, Video as VideoIcon } from 'lucide-react';
import { Video } from '../types';
import { useSmartTVFocus } from '../context/FocusContext';

interface VideoCardProps {
  video: Video;
  categoryName?: string;
  onSelect: (video: Video) => void;
  focusPrefix?: string;
  className?: string;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  video,
  categoryName,
  onSelect,
  focusPrefix = 'card',
  className = '',
}) => {
  const [imgError, setImgError] = useState(false);
  const cardId = `${focusPrefix}-${video.id}`;

  const { isFocused, focusProps } = useSmartTVFocus(cardId, () => onSelect(video));

  const fallbackThumbnail =
    'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?q=80&w=600&auto=format&fit=crop';
  const thumbSrc = (!imgError && video.thumbnail_url && video.thumbnail_url.trim())
    ? video.thumbnail_url
    : fallbackThumbnail;

  return (
    <div
      {...focusProps}
      className={`group relative flex-shrink-0 rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 cursor-pointer select-none transition-all duration-300 ${
        className || 'w-48 xs:w-56 sm:w-64 md:w-72'
      } ${
        isFocused
          ? 'ring-4 ring-red-500 scale-105 z-20 border-red-500 shadow-2xl shadow-red-950/80 bg-zinc-800'
          : 'hover:scale-[1.02] hover:border-zinc-700 active:scale-95'
      }`}
    >
      {/* Poster Image Box */}
      <div className="relative aspect-video w-full bg-zinc-950 overflow-hidden">
        <img
          src={thumbSrc}
          alt={video.title}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Hover/Focus Play Icon Overlay */}
        <div
          className={`absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center transition-opacity duration-200 ${
            isFocused ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
        >
          <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center shadow-lg shadow-red-900/50 transform scale-90 group-hover:scale-100 transition-transform">
            <Play className="w-6 h-6 text-white fill-white ml-0.5" />
          </div>
        </div>

        {/* Provider Tag Badge */}
        <div className="absolute top-2 left-2 flex items-center gap-1">
          {video.is_series ? (
            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-red-600 text-white shadow-md shadow-red-950/80">
              SÉRIE
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-black/70 text-zinc-300 border border-zinc-700/50 backdrop-blur-md">
              {video.provider}
            </span>
          )}
        </div>

        {/* Duration Badge */}
        <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-[10px] font-medium bg-black/80 text-zinc-200 flex items-center gap-1 backdrop-blur-md">
          <Clock className="w-3 h-3 text-red-400" />
          <span>{video.duration || '00:00'}</span>
        </div>
      </div>

      {/* Info Card Details */}
      <div className="p-3.5 space-y-1">
        {categoryName && (
          <span className="text-[11px] font-semibold text-red-400 uppercase tracking-wider block">
            {categoryName}
          </span>
        )}
        <h3 className="text-sm font-bold text-white line-clamp-1 group-hover:text-red-400 transition-colors">
          {video.title}
        </h3>
        <p className="text-xs text-zinc-400 line-clamp-2 leading-snug">
          {video.description || 'Sem descrição.'}
        </p>
      </div>
    </div>
  );
};
