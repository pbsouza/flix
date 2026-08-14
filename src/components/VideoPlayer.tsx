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
  Loader2,
  RefreshCw,
} from 'lucide-react';
import Hls from 'hls.js';
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
  const hlsRef = useRef<Hls | null>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isBuffering, setIsBuffering] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [useIframeMode, setUseIframeMode] = useState(false);

  const controlsTimeoutRef = useRef<any>(null);
  const bufferingTimeoutRef = useRef<any>(null);

  // Focusable elements in TV Player
  const closeFocus = useSmartTVFocus('player-close', onClose);
  const playFocus = useSmartTVFocus('player-play-btn', () => togglePlay());
  const rewindFocus = useSmartTVFocus('player-rewind-btn', () => seek(-10));
  const forwardFocus = useSmartTVFocus('player-forward-btn', () => seek(10));
  const muteFocus = useSmartTVFocus('player-mute-btn', () => toggleMute());
  const fullscreenFocus = useSmartTVFocus('player-fullscreen-btn', () => toggleFullscreen());
  const fallbackFocus = useSmartTVFocus('player-fallback-btn', () => togglePlaybackMode());

  // Helper to extract Google Drive File ID
  const getGoogleDriveFileId = (url: string): string | null => {
    if (!url) return null;
    const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
                  url.match(/[?&]id=([a-zA-Z0-9_-]+)/) ||
                  url.match(/\/proxy\/gdrive\/([a-zA-Z0-9_-]+)/) ||
                  url.match(/\/stream\/gdrive\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  };

  // Determine media source
  const sourceUrl = video.playback_url || video.source_url || '';
  const gdriveId = getGoogleDriveFileId(sourceUrl) || getGoogleDriveFileId(video.source_url || '');

  const isMega = (url: string) => url.includes('mega.nz') || url.includes('mega.io') || video.provider === 'mega';
  const targetMegaUrl = isMega(sourceUrl) ? sourceUrl : (isMega(video.source_url || '') ? video.source_url : '');

  // Direct video stream URL for HTML5 tag
  let directStreamUrl = sourceUrl;
  if (gdriveId) {
    directStreamUrl = `/api/stream/gdrive/${gdriveId}`;
  } else if (targetMegaUrl) {
    directStreamUrl = `/api/stream/mega?url=${encodeURIComponent(targetMegaUrl)}`;
  }

  // IFrame embed URL fallback (Google Drive / Mega / YouTube / etc.)
  const getIframeEmbedUrl = (): string => {
    if (gdriveId) {
      return `https://drive.google.com/file/d/${gdriveId}/preview`;
    }
    if (sourceUrl.includes('youtube.com') || sourceUrl.includes('youtu.be') || video.provider === 'youtube') {
      const ytMatch = sourceUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
      const id = ytMatch ? ytMatch[1] : '';
      if (id) {
        return `https://www.youtube.com/embed/${id}?autoplay=1&playsinline=1&enablejsapi=1&rel=0`;
      }
    }
    if (video.provider === 'mega' || sourceUrl.includes('mega.nz') || sourceUrl.includes('mega.io')) {
      const megaMatch = sourceUrl.match(/mega\.(?:nz|io)\/(?:file|embed)\/([a-zA-Z0-9_-]+)(?:[#!]([a-zA-Z0-9_-]+))?/i);
      if (megaMatch && megaMatch[1]) {
        const key = megaMatch[2] ? `#${megaMatch[2]}` : '';
        return `https://mega.nz/embed/${megaMatch[1]}${key}?autoplay=1`;
      }
    }
    return sourceUrl;
  };

  const isHlsStream = directStreamUrl.includes('.m3u8') || video.provider === 'hls';
  const isYoutube = sourceUrl.includes('youtube.com') || sourceUrl.includes('youtu.be') || video.provider === 'youtube';

  // Toggle between HTML5 video and IFrame
  const togglePlaybackMode = () => {
    setHasError(false);
    setIsBuffering(true);
    setUseIframeMode(!useIframeMode);
  };

  // Hide controls after inactivity
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

  // Safety timer for buffering overlay: auto-hide after 4 seconds if media is playing
  useEffect(() => {
    if (isBuffering) {
      if (bufferingTimeoutRef.current) clearTimeout(bufferingTimeoutRef.current);
      bufferingTimeoutRef.current = setTimeout(() => {
        if (videoRef.current && !videoRef.current.paused) {
          setIsBuffering(false);
        }
      }, 4000);
    }
    return () => {
      if (bufferingTimeoutRef.current) clearTimeout(bufferingTimeoutRef.current);
    };
  }, [isBuffering]);

  // Function to execute resilient autoplay (handles policy blocks by attempting muted autoplay if necessary)
  const attemptAutoplay = useCallback((videoEl: HTMLVideoElement) => {
    const playPromise = videoEl.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
          setIsBuffering(false);
        })
        .catch((err) => {
          console.warn('Direct unmuted autoplay blocked, retrying with muted fallback:', err);
          videoEl.muted = true;
          setIsMuted(true);
          videoEl
            .play()
            .then(() => {
              setIsPlaying(true);
              setIsBuffering(false);
            })
            .catch((finalErr) => {
              console.warn('Playback paused or blocked:', finalErr);
              setIsPlaying(false);
            });
        });
    }
  }, []);

  // HLS.js & Video Element Engine Setup for Smart TVs
  useEffect(() => {
    if (useIframeMode || isYoutube || !videoRef.current) return;

    const videoEl = videoRef.current;
    setIsBuffering(true);
    setHasError(false);

    // Cleanup existing Hls instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (isHlsStream && Hls.isSupported()) {
      // Smart TV optimized HLS buffer configuration
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        maxBufferLength: 20, // Limit RAM allocation for TV WebViews
        maxMaxBufferLength: 40,
        maxBufferHole: 0.5,
        highBufferWatchdogPeriod: 2,
        manifestLoadingTimeOut: 15000,
        manifestLoadingMaxRetry: 4,
        levelLoadingTimeOut: 15000,
      });

      hls.loadSource(directStreamUrl);
      hls.attachMedia(videoEl);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsBuffering(false);
        attemptAutoplay(videoEl);
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              // Fallback to iframe if HLS fatal error occurs
              setUseIframeMode(true);
              break;
          }
        }
      });

      hlsRef.current = hls;
    } else {
      // Direct MP4 / WebM / Stream Proxy
      videoEl.src = directStreamUrl;
      videoEl.load();
      attemptAutoplay(videoEl);
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [useIframeMode, isYoutube, directStreamUrl, isHlsStream, attemptAutoplay]);

  // Controls
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
    resetControlsTimeout();
  };

  const seek = (seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(
      0,
      Math.min(videoRef.current.duration || Infinity, videoRef.current.currentTime + seconds)
    );
    resetControlsTimeout();
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
    resetControlsTimeout();
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
    resetControlsTimeout();
  };

  // Smart TV Remote & Keyboard Event Handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      resetControlsTimeout();

      // TV Back Keys (Escape, Backspace, Samsung Tizen 10009, LG WebOS 461)
      if (
        e.key === 'Escape' ||
        e.key === 'Backspace' ||
        e.key === 'Back' ||
        e.key === 'GoBack' ||
        e.keyCode === 10009 ||
        e.keyCode === 461
      ) {
        onClose();
        return;
      }

      if (useIframeMode) return;

      // Enter / Space / PlayPause TV Keys
      if (e.key === ' ' || e.key === 'Enter' || e.key === 'MediaPlayPause' || e.keyCode === 13) {
        if (document.activeElement?.tagName !== 'BUTTON') {
          e.preventDefault();
          togglePlay();
        }
      } else if (e.key === 'ArrowLeft') {
        seek(-10);
      } else if (e.key === 'ArrowRight') {
        seek(10);
      } else if (e.key === 'm') {
        toggleMute();
      } else if (e.key === 'f') {
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [useIframeMode, isPlaying, onClose]);

  const formatTime = (timeInSec: number) => {
    if (isNaN(timeInSec) || timeInSec <= 0) return '00:00';
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
      style={{ backgroundColor: '#000000' }}
      className="fixed inset-0 z-50 bg-black flex items-center justify-center select-none overflow-hidden"
    >
      {/* Top Header Overlay */}
      <div
        className={`absolute top-0 left-0 right-0 p-4 sm:p-6 z-40 bg-gradient-to-b from-black via-black/70 to-transparent flex items-center justify-between transition-opacity duration-300 gap-3 ${
          showControls ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <button
          {...closeFocus.focusProps}
          onClick={() => {
            closeFocus.focusProps.onClick?.();
            onClose();
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white font-bold transition-all shadow-xl cursor-pointer ${
            closeFocus.isFocused ? 'ring-4 ring-red-500 scale-105 bg-red-600 border-red-500' : 'hover:bg-red-600'
          }`}
          title="Voltar (Esc / Voltar)"
        >
          <ArrowLeft className="w-5 h-5 text-red-500 group-hover:text-white" />
          <span className="text-sm sm:text-base">Voltar</span>
        </button>

        <div className="text-right max-w-md pointer-events-none">
          <h2 className="text-sm sm:text-lg font-bold text-white truncate drop-shadow">{video.title}</h2>
          {category && (
            <span className="text-xs text-red-400 font-semibold uppercase tracking-wider block">
              {category.name}
            </span>
          )}
        </div>
      </div>

      {/* VIDEO ENGINE CONTAINER */}
      <div
        style={{ backgroundColor: '#000000' }}
        className="relative w-full h-full flex items-center justify-center bg-black"
      >
        {hasError ? (
          <div className="p-8 text-center space-y-4 max-w-md z-40 bg-zinc-950/90 rounded-2xl border border-zinc-800 shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-red-900/40 border border-red-500 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-white">Não foi possível reproduzir o vídeo</h3>
            <p className="text-zinc-400 text-xs sm:text-sm">
              O link da mídia pode requerer troca para o modo de exibição secundário ou o provedor está indisponível.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                {...fallbackFocus.focusProps}
                onClick={togglePlaybackMode}
                className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-sm flex items-center justify-center gap-2 transition-colors border border-zinc-700"
              >
                <RefreshCw className="w-4 h-4 text-red-400" /> Alternar Player ({useIframeMode ? 'HTML5' : 'IFrame'})
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition-colors"
              >
                Voltar ao Menu
              </button>
            </div>
          </div>
        ) : useIframeMode || isYoutube ? (
          <iframe
            src={getIframeEmbedUrl()}
            style={{ backgroundColor: '#000000' }}
            className="w-full h-full border-0 bg-black"
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture; accelerometer; gyroscope"
            title={video.title}
            onLoad={() => setIsBuffering(false)}
            onError={() => setHasError(true)}
          />
        ) : (
          <>
            <video
              ref={videoRef}
              controls={false}
              autoPlay
              playsInline
              // @ts-ignore
              webkit-playsinline="true"
              preload="auto"
              crossOrigin="anonymous"
              style={{ backgroundColor: '#000000' }}
              className="w-full h-full object-contain cursor-pointer bg-black"
              onClick={togglePlay}
              onLoadStart={() => setIsBuffering(true)}
              onWaiting={() => setIsBuffering(true)}
              onStalled={() => setIsBuffering(true)}
              onCanPlay={() => {
                setIsBuffering(false);
                if (videoRef.current && videoRef.current.paused) {
                  attemptAutoplay(videoRef.current);
                }
              }}
              onLoadedData={() => {
                setIsBuffering(false);
                if (videoRef.current && videoRef.current.paused) {
                  attemptAutoplay(videoRef.current);
                }
              }}
              onPlaying={() => {
                setIsBuffering(false);
                setIsPlaying(true);
              }}
              onTimeUpdate={() => {
                setIsBuffering(false);
                if (videoRef.current) {
                  setCurrentTime(videoRef.current.currentTime);
                }
              }}
              onLoadedMetadata={() => {
                setIsBuffering(false);
                if (videoRef.current) {
                  setDuration(videoRef.current.duration);
                  if (videoRef.current.paused) {
                    attemptAutoplay(videoRef.current);
                  }
                }
              }}
              onError={() => {
                // Auto switch to iframe mode on HTML5 direct playback error
                setUseIframeMode(true);
              }}
              onEnded={() => setIsPlaying(false)}
            />

            {/* Muted Autoplay Warning Banner on TV */}
            {isMuted && isPlaying && !isBuffering && (
              <button
                onClick={toggleMute}
                className="absolute top-20 right-6 z-40 bg-red-600/95 hover:bg-red-600 text-white px-3.5 py-1.5 rounded-full text-xs font-bold shadow-2xl flex items-center gap-2 border border-red-400 animate-pulse cursor-pointer"
              >
                <VolumeX className="w-4 h-4" />
                <span>Vídeo mudo (Clique para Ativar Som)</span>
              </button>
            )}

            {/* Smart TV Buffering Indicator */}
            {isBuffering && (
              <div
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)' }}
                className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-30 animate-fadeIn"
              >
                <Loader2 className="w-12 h-12 text-red-600 animate-spin mb-3" />
                <span className="text-xs text-zinc-200 font-semibold bg-zinc-950 px-4 py-1.5 rounded-full border border-zinc-800 shadow-xl">
                  Iniciando transmissão para a Smart TV...
                </span>
              </div>
            )}
          </>
        )}
      </div>

      {/* BOTTOM CONTROLS BAR (HTML5) */}
      {!useIframeMode && !isYoutube && (
        <div
          className={`absolute bottom-0 left-0 right-0 p-4 sm:p-6 z-40 bg-gradient-to-t from-black via-black/80 to-transparent transition-opacity duration-300 space-y-3 ${
            showControls ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        >
          {/* Progress Bar */}
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
            <div className="flex justify-between text-xs font-medium text-zinc-400 px-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Buttons Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                {...rewindFocus.focusProps}
                className={`p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white transition-all ${
                  rewindFocus.isFocused ? 'ring-4 ring-red-500 scale-105 bg-red-600' : ''
                }`}
                title="Voltar 10s"
              >
                <RotateCcw className="w-5 h-5" />
              </button>

              <button
                {...playFocus.focusProps}
                className={`p-3 rounded-2xl bg-red-600 text-white transition-all shadow-lg ${
                  playFocus.isFocused ? 'ring-4 ring-red-400 scale-110 shadow-red-900/80' : ''
                }`}
                title={isPlaying ? 'Pausar' : 'Reproduzir'}
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 fill-white" />}
              </button>

              <button
                {...forwardFocus.focusProps}
                className={`p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white transition-all ${
                  forwardFocus.isFocused ? 'ring-4 ring-red-500 scale-105 bg-red-600' : ''
                }`}
                title="Avançar 10s"
              >
                <RotateCw className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                {...fallbackFocus.focusProps}
                onClick={togglePlaybackMode}
                className={`p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white transition-all ${
                  fallbackFocus.isFocused ? 'ring-4 ring-red-500 scale-105 bg-red-600 text-white' : ''
                }`}
                title="Alternar Player (HTML5 / IFrame)"
              >
                <Tv className="w-5 h-5" />
              </button>

              <button
                {...muteFocus.focusProps}
                className={`p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white transition-all ${
                  muteFocus.isFocused ? 'ring-4 ring-red-500 scale-105 bg-red-600' : ''
                }`}
                title="Som"
              >
                {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5" />}
              </button>

              <button
                {...fullscreenFocus.focusProps}
                className={`p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white transition-all ${
                  fullscreenFocus.isFocused ? 'ring-4 ring-red-500 scale-105 bg-red-600' : ''
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
