import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize,
  ArrowLeft,
  Tv,
  AlertCircle,
  Clock,
  Tag,
} from 'lucide-react';
import { Video, Category } from '../types';
import { useSmartTVFocus } from '../context/FocusContext';

interface VideoPlayerProps {
  video: Video;
  category?: Category;
  onClose: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ video, category, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isIframeFallback, setIsIframeFallback] = useState(false);

  const controlsTimeoutRef = useRef<any>(null);

  // Focusable elements in TV Player
  const closeFocus = useSmartTVFocus('player-close', onClose);
  const playFocus = useSmartTVFocus('player-play-btn', () => togglePlay());
  const rewindFocus = useSmartTVFocus('player-rewind-btn', () => seek(-10));
  const forwardFocus = useSmartTVFocus('player-forward-btn', () => seek(10));
  const muteFocus = useSmartTVFocus('player-mute-btn', () => toggleMute());
  const fullscreenFocus = useSmartTVFocus('player-fullscreen-btn', () => toggleFullscreen());

  // Hide controls after 4 seconds of inactivity
  const resetControlsTimeout = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 4500);
  }, [isPlaying]);

  useEffect(() => {
    resetControlsTimeout();
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [resetControlsTimeout]);

  // Check if provider is an iframe embed or direct HTML5
  useEffect(() => {
    const url = (video.playback_url || video.source_url || '').toLowerCase();
    if (
      video.provider === 'mega' ||
      video.provider === 'gdrive' ||
      video.provider === 'youtube' ||
      url.includes('drive.google.com') ||
      url.includes('/proxy/gdrive/') ||
      url.includes('mega.nz') ||
      url.includes('mega.io') ||
      url.includes('/preview') ||
      url.includes('youtube.com') ||
      url.includes('youtu.be')
    ) {
      setIsIframeFallback(true);
    } else {
      setIsIframeFallback(false);
    }
  }, [video]);

  // Helper to format embed iframe URLs (Google Drive, Mega, YouTube, etc.)
  const getIframeUrl = (vid: Video): string => {
    const playback = vid.playback_url || '';
    const source = vid.source_url || '';
    const combined = `${playback} ${source}`;

    // Google Drive: Convert any file view/proxy link to preview embed
    if (vid.provider === 'gdrive' || combined.includes('drive.google.com') || combined.includes('/proxy/gdrive/')) {
      const match = combined.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
                    combined.match(/[?&]id=([a-zA-Z0-9_-]+)/) ||
                    combined.match(/\/proxy\/gdrive\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        return `https://drive.google.com/file/d/${match[1]}/preview`;
      }
      if (playback.includes('/preview')) return playback;
    }

    // Mega.nz: Convert sharing link to official embed
    if (vid.provider === 'mega' || combined.includes('mega.nz') || combined.includes('mega.io')) {
      if (playback.includes('/embed/')) return playback;
      if (playback.includes('/file/')) return playback.replace('/file/', '/embed/');
      const megaMatch = combined.match(/mega\.(?:nz|io)\/(?:file|embed)\/([a-zA-Z0-9_-]+)(?:[#!]([a-zA-Z0-9_-]+))?/i);
      if (megaMatch && megaMatch[1]) {
        const key = megaMatch[2] ? `#${megaMatch[2]}` : '';
        return `https://mega.nz/embed/${megaMatch[1]}${key}`;
      }
    }

    return playback || source;
  };

  // Play/Pause toggle
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
    resetControlsTimeout();
  };

  // Seek helper
  const seek = (seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(
      0,
      Math.min(videoRef.current.duration, videoRef.current.currentTime + seconds)
    );
    resetControlsTimeout();
  };

  // Toggle Mute
  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
    resetControlsTimeout();
  };

  // Toggle Fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error('Fullscreen request failed', err);
      });
    } else {
      document.exitFullscreen();
    }
    resetControlsTimeout();
  };

  // Keyboard Shortcuts inside Player
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      resetControlsTimeout();
      if (e.key === ' ' || e.key === 'k') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'ArrowLeft') {
        seek(-10);
      } else if (e.key === 'ArrowRight') {
        seek(10);
      } else if (e.key === 'Escape' || e.key === 'Backspace') {
        onClose();
      } else if (e.key === 'm') {
        toggleMute();
      } else if (e.key === 'f') {
        toggleFullscreen();
      }
    };

    const handleSmartTVBack = () => onClose();

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('smarttv-back', handleSmartTVBack);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('smarttv-back', handleSmartTVBack);
    };
  }, [isPlaying, onClose]);

  // Format time mm:ss or hh:mm:ss
  const formatTime = (timeInSec: number) => {
    if (isNaN(timeInSec)) return '00:00';
    const hrs = Math.floor(timeInSec / 3600);
    const mins = Math.floor((timeInSec % 3600) / 60);
    const secs = Math.floor(timeInSec % 60);

    if (hrs > 0) {
      return `${hrs}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={resetControlsTimeout}
      onClick={resetControlsTimeout}
      className="fixed inset-0 z-50 bg-black flex items-center justify-center select-none overflow-hidden"
    >
      {/* Top Hover / Sensitivity Zone for showing controls */}
      <div
        onMouseMove={resetControlsTimeout}
        onMouseEnter={resetControlsTimeout}
        className="absolute top-0 left-0 right-0 h-24 z-30 pointer-events-auto"
      />

      {/* Top Header Controls Overlay with Back Button */}
      <div
        className={`absolute top-0 left-0 right-0 p-4 md:p-6 z-40 bg-gradient-to-b from-black/95 via-black/60 to-transparent flex items-center justify-between transition-opacity duration-700 ease-in-out ${
          showControls ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <button
          {...closeFocus.focusProps}
          onClick={() => {
            closeFocus.focusProps.onClick?.();
            onClose();
          }}
          className={`flex items-center gap-2.5 px-4 md:px-5 py-2.5 md:py-3 rounded-2xl bg-zinc-900/90 border border-zinc-700/80 text-white font-bold transition-all shadow-2xl backdrop-blur-md cursor-pointer ${
            closeFocus.isFocused ? 'ring-4 ring-red-500 scale-105 bg-red-600 border-red-500' : 'hover:bg-red-600 hover:border-red-500 active:scale-95'
          }`}
          title="Voltar ao catálogo"
        >
          <ArrowLeft className="w-5 h-5 text-red-500 group-hover:text-white transition-colors" />
          <span className="text-sm md:text-base">Voltar ao Menu</span>
        </button>

        <div className="text-right max-w-xl pointer-events-none">
          <h2 className="text-base md:text-xl font-bold text-white line-clamp-1 drop-shadow-md">{video.title}</h2>
          {category && (
            <span className="text-xs text-red-400 font-semibold uppercase tracking-wider block drop-shadow">
              {category.name}
            </span>
          )}
        </div>
      </div>

      {/* VIDEO ENGINE / EMBED */}
      {isIframeFallback ? (
        <iframe
          src={getIframeUrl(video)}
          className="w-full h-full border-0"
          allow="autoplay; encrypted-media; fullscreen"
          title={video.title}
        />
      ) : (
        <video
          ref={videoRef}
          src={video.playback_url || undefined}
          autoPlay
          playsInline
          onTimeUpdate={() => {
            if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
          }}
          onLoadedMetadata={() => {
            if (videoRef.current) setDuration(videoRef.current.duration);
          }}
          onError={() => {
            if (!isIframeFallback) {
              setIsIframeFallback(true);
            } else {
              setHasError(true);
            }
          }}
          onEnded={() => setIsPlaying(false)}
          className="w-full h-full object-contain"
        />
      )}

      {/* ERROR FALLBACK NOTIFICATION */}
      {hasError && (
        <div className="absolute inset-0 bg-zinc-950/95 flex flex-col items-center justify-center p-8 text-center space-y-4 z-40">
          <div className="w-16 h-16 rounded-full bg-red-900/50 border border-red-500 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-2xl font-bold text-white">Não foi possível carregar o vídeo</h3>
          <p className="text-zinc-400 max-w-md text-sm">
            O link do vídeo ou o servidor do provedor ({video.provider}) pode estar indisponível ou restringindo reprodução direta HTML5.
          </p>
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-500 transition-colors"
          >
            Voltar e tentar outro vídeo
          </button>
        </div>
      )}

      {/* BOTTOM CONTROL BAR OVERLAY */}
      {!isIframeFallback && (
        <div
          className={`absolute bottom-0 left-0 right-0 p-6 md:p-8 z-30 bg-gradient-to-t from-black/95 via-black/70 to-transparent transition-opacity duration-700 ease-in-out space-y-4 ${
            showControls ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        >
          {/* Progress Seek Bar */}
          <div className="space-y-1">
            <div
              className="w-full h-2 bg-zinc-800 rounded-full cursor-pointer overflow-hidden relative"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const pos = (e.clientX - rect.left) / rect.width;
                if (videoRef.current && duration) {
                  videoRef.current.currentTime = pos * duration;
                }
              }}
            >
              <div
                className="h-full bg-red-600 rounded-full transition-all duration-100"
                style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-xs font-semibold text-zinc-400 px-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Action Buttons Row */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-4">
              <button
                {...rewindFocus.focusProps}
                className={`p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 text-white transition-all ${
                  rewindFocus.isFocused ? 'ring-4 ring-red-500 scale-110 bg-red-600 border-red-500' : ''
                }`}
                title="Voltar 10s"
              >
                <RotateCcw className="w-5 h-5" />
              </button>

              <button
                {...playFocus.focusProps}
                className={`p-4 rounded-2xl bg-red-600 text-white transition-all shadow-lg ${
                  playFocus.isFocused ? 'ring-4 ring-red-400 scale-110 shadow-red-900/70' : ''
                }`}
                title={isPlaying ? 'Pausar' : 'Reproduzir'}
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 fill-white" />}
              </button>

              <button
                {...forwardFocus.focusProps}
                className={`p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 text-white transition-all ${
                  forwardFocus.isFocused ? 'ring-4 ring-red-500 scale-110 bg-red-600 border-red-500' : ''
                }`}
                title="Avançar 10s"
              >
                <RotateCw className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-4">
              <button
                {...muteFocus.focusProps}
                className={`p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 text-white transition-all ${
                  muteFocus.isFocused ? 'ring-4 ring-red-500 scale-110 bg-red-600 border-red-500' : ''
                }`}
                title="Mutar"
              >
                {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5" />}
              </button>

              <button
                {...fullscreenFocus.focusProps}
                className={`p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 text-white transition-all ${
                  fullscreenFocus.isFocused ? 'ring-4 ring-red-500 scale-110 bg-red-600 border-red-500' : ''
                }`}
                title="Tela Cheia"
              >
                <Maximize className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
