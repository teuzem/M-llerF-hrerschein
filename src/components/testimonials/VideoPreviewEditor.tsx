import React, { useState, useRef } from 'react';
import ReactPlayer from 'react-player';
import { Play, Pause, Volume2, VolumeX, Maximize, Film, RotateCw, ZoomIn, ZoomOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

interface VideoPreviewEditorProps {
  file: File;
  preview: string;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (file: File) => void;
}

const VideoPreviewEditor: React.FC<VideoPreviewEditorProps> = ({ file, preview, isOpen, onClose, onSave }) => {
  const { t } = useTranslation();
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [seeking, setSeeking] = useState(false);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);

  const playerRef = useRef<ReactPlayer>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePlayPause = () => setPlaying(!playing);
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => setVolume(parseFloat(e.target.value));
  const handleToggleMute = () => setMuted(!muted);
  const handleProgress = (state: { played: number }) => {
    if (!seeking) {
      setPlayed(state.played);
    }
  };
  const handleSeekMouseDown = () => setSeeking(true);
  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => setPlayed(parseFloat(e.target.value));
  const handleSeekMouseUp = (e: React.MouseEvent<HTMLInputElement>) => {
    setSeeking(false);
    playerRef.current?.seekTo(parseFloat(e.currentTarget.value));
  };
  const handleDuration = (duration: number) => setDuration(duration);

  const handlePlaybackRateChange = (rate: number) => setPlaybackRate(rate);
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);
  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.1, 0.5));

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const formatTime = (seconds: number) => {
    const date = new Date(seconds * 1000);
    const hh = date.getUTCHours();
    const mm = date.getUTCMinutes();
    const ss = ('0' + date.getUTCSeconds()).slice(-2);
    if (hh) {
      return `${hh}:${('0' + mm).slice(-2)}:${ss}`;
    }
    return `${mm}:${ss}`;
  };

  const resetFilters = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setRotation(0);
    setZoom(1);
  };

  const videoStyle = {
    filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`,
    transform: `rotate(${rotation}deg) scale(${zoom})`,
    transition: 'transform 0.3s ease, filter 0.3s ease',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('testimonials.media_uploader.video_editor.title', 'Aperçu et édition vidéo')}>
      <div className="space-y-4">
        <div ref={containerRef} className="relative bg-black rounded-lg overflow-hidden aspect-video">
          <div style={videoStyle} className="w-full h-full">
            <ReactPlayer
              ref={playerRef}
              url={preview}
              width="100%"
              height="100%"
              playing={playing}
              volume={volume}
              muted={muted}
              playbackRate={playbackRate}
              onProgress={handleProgress}
              onDuration={handleDuration}
              progressInterval={100}
            />
          </div>

          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 space-y-2">
            <input
              type="range"
              min={0}
              max={0.999999}
              step="any"
              value={played}
              onMouseDown={handleSeekMouseDown}
              onChange={handleSeekChange}
              onMouseUp={handleSeekMouseUp}
              className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${played * 100}%, rgba(255,255,255,0.3) ${played * 100}%, rgba(255,255,255,0.3) 100%)`
              }}
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button onClick={handlePlayPause} className="text-white hover:text-german-gold transition">
                  {playing ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                </button>

                <div className="flex items-center space-x-2 group">
                  <button onClick={handleToggleMute} className="text-white hover:text-german-gold transition">
                    {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.1}
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-20 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </div>

                <span className="text-white text-sm">
                  {formatTime(duration * played)} / {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <select
                  value={playbackRate}
                  onChange={(e) => handlePlaybackRateChange(parseFloat(e.target.value))}
                  className="bg-white/20 text-white text-sm rounded px-2 py-1 border-none outline-none cursor-pointer"
                >
                  <option value="0.5">0.5x</option>
                  <option value="0.75">0.75x</option>
                  <option value="1">1x</option>
                  <option value="1.25">1.25x</option>
                  <option value="1.5">1.5x</option>
                  <option value="2">2x</option>
                </select>

                <button onClick={toggleFullscreen} className="text-white hover:text-german-gold transition">
                  <Maximize className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          <h4 className="font-semibold text-gray-900 flex items-center">
            <Film className="w-5 h-5 mr-2 text-german-red" />
            {t('testimonials.media_uploader.video_editor.controls', "Contrôles d'édition")}
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('testimonials.media_uploader.video_editor.brightness', 'Luminosité')} : {brightness}%
              </label>
              <input
                type="range"
                min="50"
                max="150"
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('testimonials.media_uploader.video_editor.contrast', 'Contraste')} : {contrast}%
              </label>
              <input
                type="range"
                min="50"
                max="150"
                value={contrast}
                onChange={(e) => setContrast(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('testimonials.media_uploader.video_editor.saturation', 'Saturation')} : {saturation}%
              </label>
              <input
                type="range"
                min="0"
                max="200"
                value={saturation}
                onChange={(e) => setSaturation(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div className="flex items-end space-x-2">
              <button
                onClick={handleRotate}
                className="flex-1 flex items-center justify-center px-4 py-2 bg-german-red text-white rounded-lg hover:bg-red-700 transition"
              >
                <RotateCw className="w-4 h-4 mr-2" />
                {t('testimonials.media_uploader.video_editor.rotation', 'Rotation')}
              </button>
              <button
                onClick={handleZoomOut}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={handleZoomIn}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <button
              onClick={resetFilters}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition"
            >
              {t('testimonials.media_uploader.video_editor.reset', 'Réinitialiser les filtres')}
            </button>
            <div className="text-sm text-gray-600">
              <Film className="w-4 h-4 inline mr-1" />
              {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <Button variant="secondary" onClick={onClose}>
            {t('common.cancel', 'Fermer')}
          </Button>
          {onSave && (
            <Button onClick={() => onSave(file)}>
              {t('common.confirm', 'Confirmer')}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default VideoPreviewEditor;
