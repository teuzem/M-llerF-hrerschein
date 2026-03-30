import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { UploadCloud, Link as LinkIcon, X, Edit2 } from 'lucide-react';
import Button from '../ui/Button';
import ReactPlayer from 'react-player';
import EditMediaModal from './EditMediaModal';

interface MediaUploaderProps {
  onUploadSuccess: () => void;
}

interface MediaItem {
  file: File | null;
  url: string;
  preview: string | null;
  mediaType: 'image' | 'video';
}

const MediaUploader: React.FC<MediaUploaderProps> = ({ onUploadSuccess }) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [mediaItem, setMediaItem] = useState<MediaItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setMediaItem({
        file,
        url: '',
        preview: URL.createObjectURL(file),
        mediaType: file.type.startsWith('video/') ? 'video' : 'image',
      });
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: { 'image/*': [], 'video/*': [] },
  });

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    if (newUrl === '') {
      setMediaItem(null);
      return;
    }
    const isVideo = ReactPlayer.canPlay(newUrl);
    const isImage = !isVideo && /\.(jpg|jpeg|png|gif|webp|svg|avif)(\?.*)?$/i.test(newUrl);
    
    setMediaItem({
      file: null,
      url: newUrl,
      preview: (isVideo || isImage) ? newUrl : null,
      mediaType: isVideo ? 'video' : 'image',
    });
  };

  const clearSelection = () => {
    if (mediaItem?.preview && mediaItem.file) {
      URL.revokeObjectURL(mediaItem.preview);
    }
    setMediaItem(null);
  };

  const handleEditSave = (editedItem: { file?: File }) => {
    if (!mediaItem) return;

    const newFile = editedItem.file || mediaItem.file;
    let newPreview = mediaItem.preview;

    if (editedItem.file && mediaItem.preview && mediaItem.file) {
      URL.revokeObjectURL(mediaItem.preview);
      newPreview = URL.createObjectURL(editedItem.file);
    }

    setMediaItem({
      ...mediaItem,
      file: newFile,
      preview: newPreview,
    });
    setIsEditorOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return toast.error(t('gallery.uploader.login_required', 'Bitte melden Sie sich an, um Medien hochzuladen.'));
    if (!mediaItem || (!mediaItem.file && !mediaItem.url)) {
      return toast.error(t('gallery.uploader.select_file', 'Bitte wählen Sie eine Datei aus oder geben Sie eine URL ein.'));
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('media_type', mediaItem.mediaType);
      
      if (mediaItem.file) {
        formData.append('media_file', mediaItem.file, mediaItem.file.name);
      } else if (mediaItem.url) {
        formData.append('media_url_input', mediaItem.url);
      }

      const { error } = await supabase.functions.invoke('submit-gallery-media', {
        body: formData,
      });

      if (error) throw new Error(error.message);

      toast.success(t('gallery.uploader.success', 'Medien erfolgreich hinzugefügt! Sie warten auf Moderation.'));
      onUploadSuccess();
    } catch (error: any) {
      toast.error(`${t('gallery.uploader.error', 'Fehler beim Hinzufügen der Medien:')} ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {mediaItem && (
        <EditMediaModal
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
          mediaItem={mediaItem}
          onSave={handleEditSave}
        />
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        {!mediaItem ? (
          <>
            <div {...getRootProps()} className={`flex justify-center px-6 pt-10 pb-10 border-2 border-gray-300 border-dashed rounded-md cursor-pointer transition-colors ${isDragActive ? 'border-blue-500 bg-blue-50' : 'hover:border-blue-400'}`}>
              <input {...getInputProps()} />
              <div className="space-y-1 text-center">
                <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                <p className="text-sm text-gray-600">{t('gallery.uploader.dropzone', 'Datei hierher ziehen oder klicken zum Auswählen.')}</p>
              </div>
            </div>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-gray-500"><LinkIcon className="w-5 h-5" /></span>
              <input type="text" onChange={handleUrlChange} placeholder={t('gallery.uploader.url_placeholder', 'Oder URL einfügen (Bild, YouTube, TikTok...)')} className="w-full pl-10 p-3 border border-gray-300 rounded-lg" />
            </div>
          </>
        ) : (
          <div className="relative group w-full aspect-video bg-black rounded-lg overflow-hidden">
            {mediaItem.mediaType === 'image' ? (
              <img src={mediaItem.preview!} alt={t('gallery.uploader.preview', 'Vorschau')} className="w-full h-full object-contain" />
            ) : (
              <ReactPlayer url={mediaItem.preview!} playing={true} muted={true} width="100%" height="100%" />
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
              <button type="button" onClick={() => setIsEditorOpen(true)} className="p-3 bg-white/20 text-white rounded-full"><Edit2 className="w-6 h-6" /></button>
              <button type="button" onClick={clearSelection} className="p-3 bg-white/20 text-white rounded-full"><X className="w-6 h-6" /></button>
            </div>
          </div>
        )}

        <div className="text-right">
          <Button type="submit" isLoading={isLoading} disabled={!mediaItem}>
            {t('gallery.uploader.submit', 'Medien übermitteln')}
          </Button>
        </div>
      </form>
    </>
  );
};

export default MediaUploader;
