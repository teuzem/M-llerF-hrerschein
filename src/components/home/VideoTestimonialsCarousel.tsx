import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  SkipBack,
  SkipForward,
  Settings,
  X,
  Loader2,
  Video,
  RefreshCw,
} from 'lucide-react';

interface StorageVideo {
  id: string;
  name: string;
  url: string;
  createdAt: string;
}

interface VideoPlayerState {
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  isFullscreen: boolean;
  playbackRate: number;
  isBuffering: boolean;
  progress: number;
}

const BUCKET_NAME = 'gallery-media';
const VIDEO_FOLDER = 'videos';
const AUTO_SCROLL_INTERVAL = 8000;
const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5, 2];

const VideoTestimonialsCarousel: React.FC = () => {
  const { t } = useTranslation();
  const [videos, setVideos] = useState<StorageVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  
  const [playerState, setPlayerState] = useState<VideoPlayerState>({
    isPlaying: true,
    isMuted: true,
    volume: 0.7,
    currentTime: 0,
    duration: 0,
    isFullscreen: false,
    playbackRate: 1,
    isBuffering: false,
    progress: 0,
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const autoScrollTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch videos from Supabase Storage in real-time
  const fetchVideos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('[v0] Fetching videos from bucket:', BUCKET_NAME, 'folder:', VIDEO_FOLDER);

      const { data: files, error: listError } = await supabase.storage
        .from(BUCKET_NAME)
        .list(VIDEO_FOLDER, {
          limit: 100,
          sortBy: { column: 'created_at', order: 'desc' },
        });

      console.log('[v0] Storage list response:', { files, listError });

      if (listError) {
        console.error('[v0] Storage list error:', listError);
        throw listError;
      }

      if (!files || files.length === 0) {
        console.log('[v0] No files found in videos folder');
        setVideos([]);
        setLoading(false);
        return;
      }

      // Filter only video files and get public URLs
      const videoFiles = files.filter(file => 
        file.name.match(/\.(mp4|webm|mov|avi|mkv|m4v)$/i)
      );

      console.log('[v0] Found video files:', videoFiles.length);

      const videosWithUrls: StorageVideo[] = videoFiles.map(file => {
        const { data: urlData } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(`${VIDEO_FOLDER}/${file.name}`);

        console.log('[v0] Generated URL for', file.name, ':', urlData.publicUrl);

        return {
          id: file.id || file.name,
          name: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
          url: urlData.publicUrl,
          createdAt: file.created_at || new Date().toISOString(),
        };
      });

      setVideos(videosWithUrls);
    } catch (err: any) {
      console.error('[v0] Error fetching videos:', err);
      setError(err.message || t('videoTestimonials.fetchError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  // Real-time subscription to storage changes
  useEffect(() => {
    fetchVideos();

    // Set up real-time channel for storage changes
    const channel = supabase
      .channel('storage-videos')
      .on('postgres_changes', {
        event: '*',
        schema: 'storage',
        table: 'objects',
        filter: `bucket_id=eq.${BUCKET_NAME}`,
      }, () => {
        fetchVideos();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchVideos]);

  // Auto-scroll functionality
  useEffect(() => {
    if (isAutoScrolling && videos.length > 1) {
      autoScrollTimerRef.current = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % videos.length);
      }, AUTO_SCROLL_INTERVAL);
    }

    return () => {
      if (autoScrollTimerRef.current) {
        clearInterval(autoScrollTimerRef.current);
      }
    };
  }, [isAutoScrolling, videos.length]);

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setPlayerState(prev => ({
        ...prev,
        currentTime: video.currentTime,
        progress: (video.currentTime / video.duration) * 100,
      }));
    };

    const handleLoadedMetadata = () => {
      setPlayerState(prev => ({
        ...prev,
        duration: video.duration,
        isBuffering: false,
      }));
    };

    const handleWaiting = () => {
      setPlayerState(prev => ({ ...prev, isBuffering: true }));
    };

    const handlePlaying = () => {
      setPlayerState(prev => ({ ...prev, isBuffering: false }));
    };

    const handleEnded = () => {
      if (isAutoScrolling) {
        setCurrentIndex(prev => (prev + 1) % videos.length);
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('ended', handleEnded);
    };
  }, [currentIndex, isAutoScrolling, videos.length]);

  // Reset video when index changes
  useEffect(() => {
    const video = videoRef.current;
    if (video && videos.length > 0) {
      video.load();
      if (playerState.isPlaying) {
        video.play().catch(() => {});
      }
    }
  }, [currentIndex, videos.length]);

  // Control functions
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (playerState.isPlaying) {
      video.pause();
      setIsAutoScrolling(false);
    } else {
      video.play();
    }
    setPlayerState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !playerState.isMuted;
    setPlayerState(prev => ({ ...prev, isMuted: !prev.isMuted }));
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const volume = parseFloat(e.target.value);
    video.volume = volume;
    video.muted = volume === 0;
    setPlayerState(prev => ({ 
      ...prev, 
      volume, 
      isMuted: volume === 0 
    }));
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    const progressBar = progressRef.current;
    if (!video || !progressBar) return;

    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    video.currentTime = percentage * video.duration;
  };

  const handlePlaybackRateChange = (rate: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.playbackRate = rate;
    setPlayerState(prev => ({ ...prev, playbackRate: rate }));
    setShowSettings(false);
  };

  const toggleFullscreen = async () => {
    const container = containerRef.current;
    if (!container) return;

    try {
      if (!document.fullscreenElement) {
        await container.requestFullscreen();
        setPlayerState(prev => ({ ...prev, isFullscreen: true }));
      } else {
        await document.exitFullscreen();
        setPlayerState(prev => ({ ...prev, isFullscreen: false }));
      }
    } catch (err) {
      console.error('[v0] Fullscreen error:', err);
    }
  };

  const goToVideo = (index: number) => {
    setCurrentIndex(index);
    setIsAutoScrolling(false);
    if (autoScrollTimerRef.current) {
      clearInterval(autoScrollTimerRef.current);
    }
  };

  const goToPrevious = () => {
    goToVideo(currentIndex === 0 ? videos.length - 1 : currentIndex - 1);
  };

  const goToNext = () => {
    goToVideo((currentIndex + 1) % videos.length);
  };

  const skip = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + seconds));
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;

      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          skip(-10);
          break;
        case 'ArrowRight':
          e.preventDefault();
          skip(10);
          break;
        case 'ArrowUp':
          e.preventDefault();
          goToPrevious();
          break;
        case 'ArrowDown':
          e.preventDefault();
          goToNext();
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playerState, currentIndex, videos.length]);

  if (loading) {
    return (
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="w-full px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <div className="flex flex-col items-center justify-center h-64">
            <Loader2 className="w-10 h-10 text-red-600 animate-spin mb-4" />
            <p className="text-gray-500">{t('videoTestimonials.loading')}</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="w-full px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Video className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchVideos}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              {t('videoTestimonials.retry')}
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (videos.length === 0) {
    return null;
  }

  const currentVideo = videos[currentIndex];

  return (
    <section className="py-16 sm:py-20 bg-gray-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10 sm:mb-12"
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight max-w-2xl mx-auto mb-3">
            {t('videoTestimonials.title')}
          </h2>
          <p className="text-gray-600 text-base sm:text-lg max-w-xl mx-auto">
            {t('videoTestimonials.subtitle')}
          </p>
        </motion.div>

        {/* Video Player Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          ref={containerRef}
          className="relative bg-black rounded-2xl overflow-hidden shadow-2xl mx-auto max-w-4xl"
        >
          {/* Main Video */}
          <div className="relative aspect-[9/16] sm:aspect-video">
            <video
              ref={videoRef}
              src={currentVideo.url}
              className="w-full h-full object-contain bg-black"
              playsInline
              autoPlay
              muted={playerState.isMuted}
              loop={videos.length === 1}
              crossOrigin="anonymous"
            />

            {/* Buffering Indicator */}
            <AnimatePresence>
              {playerState.isBuffering && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center bg-black/30"
                >
                  <Loader2 className="w-12 h-12 text-white animate-spin" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Click to Play/Pause Overlay */}
            <div
              className="absolute inset-0 cursor-pointer"
              onClick={togglePlay}
            />

            {/* Play/Pause Icon on Click */}
            <AnimatePresence>
              {!playerState.isPlaying && !playerState.isBuffering && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                >
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <Play className="w-10 h-10 text-white ml-1" fill="white" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Arrows */}
            {videos.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all"
                  aria-label={t('videoTestimonials.previous')}
                >
                  <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); goToNext(); }}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all"
                  aria-label={t('videoTestimonials.next')}
                >
                  <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </>
            )}

            {/* Video Controls Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 sm:p-4">
              {/* Progress Bar */}
              <div
                ref={progressRef}
                className="w-full h-1.5 bg-white/30 rounded-full cursor-pointer mb-3 group"
                onClick={handleProgressClick}
              >
                <div
                  className="h-full bg-red-500 rounded-full relative transition-all"
                  style={{ width: `${playerState.progress}%` }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>

              {/* Controls Row */}
              <div className="flex items-center justify-between gap-2 sm:gap-4">
                {/* Left Controls */}
                <div className="flex items-center gap-1 sm:gap-2">
                  <button
                    onClick={togglePlay}
                    className="p-1.5 sm:p-2 hover:bg-white/20 rounded-full transition-colors"
                    aria-label={playerState.isPlaying ? t('videoTestimonials.pause') : t('videoTestimonials.play')}
                  >
                    {playerState.isPlaying ? (
                      <Pause className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    ) : (
                      <Play className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    )}
                  </button>

                  <button
                    onClick={() => skip(-10)}
                    className="hidden sm:block p-2 hover:bg-white/20 rounded-full transition-colors"
                    aria-label={t('videoTestimonials.skipBack')}
                  >
                    <SkipBack className="w-4 h-4 text-white" />
                  </button>

                  <button
                    onClick={() => skip(10)}
                    className="hidden sm:block p-2 hover:bg-white/20 rounded-full transition-colors"
                    aria-label={t('videoTestimonials.skipForward')}
                  >
                    <SkipForward className="w-4 h-4 text-white" />
                  </button>

                  {/* Volume Control */}
                  <div className="hidden sm:flex items-center gap-2 group">
                    <button
                      onClick={toggleMute}
                      className="p-2 hover:bg-white/20 rounded-full transition-colors"
                      aria-label={playerState.isMuted ? t('videoTestimonials.unmute') : t('videoTestimonials.mute')}
                    >
                      {playerState.isMuted ? (
                        <VolumeX className="w-4 h-4 text-white" />
                      ) : (
                        <Volume2 className="w-4 h-4 text-white" />
                      )}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={playerState.isMuted ? 0 : playerState.volume}
                      onChange={handleVolumeChange}
                      className="w-0 group-hover:w-20 transition-all duration-300 accent-red-500"
                    />
                  </div>

                  {/* Time Display */}
                  <span className="text-white text-xs sm:text-sm ml-1 sm:ml-2 tabular-nums">
                    {formatTime(playerState.currentTime)} / {formatTime(playerState.duration)}
                  </span>
                </div>

                {/* Right Controls */}
                <div className="flex items-center gap-1 sm:gap-2">
                  {/* Mobile Volume Toggle */}
                  <button
                    onClick={toggleMute}
                    className="sm:hidden p-1.5 hover:bg-white/20 rounded-full transition-colors"
                    aria-label={playerState.isMuted ? t('videoTestimonials.unmute') : t('videoTestimonials.mute')}
                  >
                    {playerState.isMuted ? (
                      <VolumeX className="w-4 h-4 text-white" />
                    ) : (
                      <Volume2 className="w-4 h-4 text-white" />
                    )}
                  </button>

                  {/* Settings */}
                  <div className="relative">
                    <button
                      onClick={() => setShowSettings(!showSettings)}
                      className="p-1.5 sm:p-2 hover:bg-white/20 rounded-full transition-colors"
                      aria-label={t('videoTestimonials.settings')}
                    >
                      <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </button>

                    <AnimatePresence>
                      {showSettings && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute bottom-full right-0 mb-2 bg-gray-900/95 backdrop-blur-sm rounded-lg p-3 min-w-[140px] shadow-xl"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white text-xs font-medium">
                              {t('videoTestimonials.playbackSpeed')}
                            </span>
                            <button onClick={() => setShowSettings(false)}>
                              <X className="w-3 h-3 text-gray-400" />
                            </button>
                          </div>
                          <div className="space-y-1">
                            {PLAYBACK_RATES.map(rate => (
                              <button
                                key={rate}
                                onClick={() => handlePlaybackRateChange(rate)}
                                className={`w-full text-left px-2 py-1 text-sm rounded ${
                                  playerState.playbackRate === rate
                                    ? 'bg-red-600 text-white'
                                    : 'text-gray-300 hover:bg-white/10'
                                }`}
                              >
                                {rate}x
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Fullscreen */}
                  <button
                    onClick={toggleFullscreen}
                    className="p-1.5 sm:p-2 hover:bg-white/20 rounded-full transition-colors"
                    aria-label={playerState.isFullscreen ? t('videoTestimonials.exitFullscreen') : t('videoTestimonials.fullscreen')}
                  >
                    {playerState.isFullscreen ? (
                      <Minimize2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    ) : (
                      <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Video Thumbnails / Navigation Dots */}
        {videos.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center justify-center gap-2 mt-6"
          >
            {/* Auto-scroll toggle */}
            <button
              onClick={() => setIsAutoScrolling(!isAutoScrolling)}
              className={`mr-4 px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                isAutoScrolling
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              {isAutoScrolling ? t('videoTestimonials.autoplayOn') : t('videoTestimonials.autoplayOff')}
            </button>

            {/* Navigation dots */}
            <div className="flex items-center gap-2">
              {videos.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToVideo(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    index === currentIndex
                      ? 'bg-red-600 w-8'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`${t('videoTestimonials.goToVideo')} ${index + 1}`}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Video Counter */}
        <div className="text-center mt-4 text-sm text-gray-500">
          {currentIndex + 1} / {videos.length} {t('videoTestimonials.videos')}
        </div>
      </div>
    </section>
  );
};

export default VideoTestimonialsCarousel;
