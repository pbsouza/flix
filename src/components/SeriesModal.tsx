import React, { useState } from 'react';
import { X, Play, Tv, Calendar, Layers, Clock } from 'lucide-react';
import { Video, Category } from '../types';
import { useSmartTVFocus } from '../context/FocusContext';

interface SeriesModalProps {
  series: Video;
  episodes: Video[];
  category?: Category;
  onClose: () => void;
  onPlayEpisode: (episode: Video) => void;
}

export const SeriesModal: React.FC<SeriesModalProps> = ({
  series,
  episodes,
  category,
  onClose,
  onPlayEpisode,
}) => {
  // Group episodes by season
  const seasons = Array.from(new Set(episodes.map((e) => e.season || 1))).sort((a, b) => a - b);
  const [selectedSeason, setSelectedSeason] = useState<number>(seasons[0] || 1);

  const activeSeasonEpisodes = episodes
    .filter((e) => (e.season || 1) === selectedSeason)
    .sort((a, b) => (a.episode_number || 1) - (b.episode_number || 1));

  const closeFocus = useSmartTVFocus('series-close-btn', onClose);

  return (
    <div
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.95)' }}
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-3 sm:p-6 md:p-8 overflow-y-auto"
    >
      <div
        style={{ backgroundColor: '#000000' }}
        className="relative w-full max-w-5xl bg-black border border-zinc-800 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
      >
        {/* Banner Header */}
        <div
          style={{ backgroundColor: '#000000' }}
          className="relative h-48 sm:h-64 md:h-80 w-full bg-black overflow-hidden flex-shrink-0"
        >
          <img
            src={series.thumbnail_url}
            alt={series.title}
            className="w-full h-full object-cover object-center brightness-75 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-900 via-zinc-900/80 to-transparent" />

          {/* Close button */}
          <button
            {...closeFocus.focusProps}
            onClick={onClose}
            className={`absolute top-4 right-4 p-2.5 rounded-2xl transition-all z-20 ${
              closeFocus.isFocused
                ? 'bg-red-600 text-white ring-4 ring-red-400 scale-110'
                : 'bg-black/60 hover:bg-black text-zinc-300 hover:text-white border border-zinc-700/60'
            }`}
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Series Info overlay */}
          <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-8 right-4 z-10 space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] sm:text-xs font-black uppercase tracking-wider bg-red-600 text-white shadow-md shadow-red-950">
                SÉRIE
              </span>
              {category && (
                <span className="px-2.5 py-0.5 rounded text-[10px] sm:text-xs font-semibold bg-zinc-800/90 text-zinc-300 border border-zinc-700/60 backdrop-blur-md">
                  {category.name}
                </span>
              )}
              <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-red-500" />
                {episodes.length} {episodes.length === 1 ? 'episódio' : 'episódios'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight drop-shadow">
              {series.title}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl line-clamp-2 leading-relaxed">
              {series.description || 'Sem descrição cadastrada.'}
            </p>
          </div>
        </div>

        {/* Content Body: Seasons Tabs & Episodes Grid */}
        <div className="p-4 sm:p-6 md:p-8 overflow-y-auto flex-1 space-y-5">
          {/* Season Selector Tabs */}
          {seasons.length > 0 && (
            <div className="flex items-center gap-2 border-b border-zinc-800 pb-3 overflow-x-auto">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider mr-2 flex items-center gap-1.5 whitespace-nowrap">
                <Tv className="w-4 h-4 text-red-500" /> Temporadas:
              </span>
              {seasons.map((seasonNum) => (
                <button
                  key={seasonNum}
                  onClick={() => setSelectedSeason(seasonNum)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                    selectedSeason === seasonNum
                      ? 'bg-red-600 text-white shadow-lg shadow-red-950/60'
                      : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700/50'
                  }`}
                >
                  Temporada {seasonNum}
                </button>
              ))}
            </div>
          )}

          {/* Episodes List Grid */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wider">
              Episódios da Temporada {selectedSeason}
            </h3>

            {activeSeasonEpisodes.length === 0 ? (
              <div className="p-8 text-center bg-zinc-950 rounded-2xl border border-zinc-800 text-zinc-500 text-xs sm:text-sm">
                Nenhum episódio cadastrado para esta temporada ainda.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                {activeSeasonEpisodes.map((ep) => (
                  <EpisodeCard key={ep.id} episode={ep} onPlay={() => onPlayEpisode(ep)} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Sub-component EpisodeCard with Smart TV Focus
const EpisodeCard: React.FC<{ episode: Video; onPlay: () => void }> = ({ episode, onPlay }) => {
  const cardId = `ep-card-${episode.id}`;
  const focus = useSmartTVFocus(cardId, onPlay);

  return (
    <div
      {...focus.focusProps}
      onClick={onPlay}
      className={`group relative rounded-xl sm:rounded-2xl bg-zinc-950 border border-zinc-800 p-3 flex flex-col justify-between cursor-pointer transition-all duration-200 ${
        focus.isFocused
          ? 'ring-4 ring-red-500 scale-[1.03] z-20 border-red-500 bg-zinc-800 shadow-xl shadow-red-950/80'
          : 'hover:border-zinc-700 hover:bg-zinc-900 active:scale-95'
      }`}
    >
      <div className="space-y-2">
        <div className="relative aspect-video w-full rounded-lg sm:rounded-xl overflow-hidden bg-zinc-900">
          <img
            src={episode.thumbnail_url}
            alt={episode.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
            <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center shadow-lg shadow-red-950/60">
              <Play className="w-5 h-5 text-white fill-white ml-0.5" />
            </div>
          </div>
          {episode.duration && (
            <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-black/80 text-zinc-300 backdrop-blur-sm flex items-center gap-1">
              <Clock className="w-2.5 h-2.5 text-red-400" />
              {episode.duration}
            </span>
          )}
        </div>

        <div>
          <span className="text-[10px] font-bold text-red-400 uppercase block">
            Episódio {episode.episode_number || 1}
          </span>
          <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-1 group-hover:text-red-400 transition-colors">
            {episode.title}
          </h4>
          {episode.description && (
            <p className="text-[11px] text-zinc-400 line-clamp-2 mt-0.5 leading-snug">
              {episode.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
