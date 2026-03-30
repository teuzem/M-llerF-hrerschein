import React, { useState, useCallback, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import { useTranslation } from 'react-i18next';
import { CloudUpload as UploadCloud, X, LocationEdit as Edit2, Film, Link as LinkIcon, Image as ImageIcon, Eye } from 'lucide-react';
import ReactPlayer from 'react-player';
import ImageEditorModal from './ImageEditorModal';
import VideoPreviewEditor from './VideoPreviewEditor';

interface AdvancedMediaUploaderProps {
  onFilesChange: (files: File[]) => void;
  files: File[];
  label: string;
  maxFiles?: number;
}

const AdvancedMediaUploader: React.FC<AdvancedMediaUploaderProps> = ({ onFilesChange, files, label, maxFiles = 5 }) => {
  const { t } = useTranslation();
  const [isImageEditorOpen, setIsImageEditorOpen] = useState(false);
  const [isVideoPreviewOpen, setIsVideoPreviewOpen] = useState(false);
  const [mediaToEdit, setMediaToEdit] = useState<{ file: File, preview: string, index: number } | null>(null);
  const [mediaMode, setMediaMode] = useState<'upload' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState('');

  const handleDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = [...files, ...acceptedFiles].slice(0, maxFiles);
    onFilesChange(newFiles);
  }, [files, onFilesChange, maxFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    maxFiles: maxFiles - files.length,
    accept: { 'image/jpeg': [], 'image/png': [], 'image/webp': [], 'video/mp4': [], 'video/webm': [] },
    disabled: files.length >= maxFiles,
  });

  const removeFile = (indexToRemove: number) => {
    onFilesChange(files.filter((_, index) => index !== indexToRemove));
  };

  const openEditor = (file: File, preview: string, index: number) => {
    setMediaToEdit({ file, preview, index });
    if (file.type.startsWith('video/')) {
      setIsVideoPreviewOpen(true);
    } else {
      setIsImageEditorOpen(true);
    }
  };

  const handleEditComplete = (editedFile: File, index: number) => {
    const newFiles = [...files];
    newFiles[index] = editedFile;
    onFilesChange(newFiles);
    setIsImageEditorOpen(false);
    setIsVideoPreviewOpen(false);
  };

  const handleAddUrl = () => {
    if (urlInput && files.length < maxFiles) {
      if (ReactPlayer.canPlay(urlInput) || /\.(jpg|jpeg|png|gif|webp)$/i.test(urlInput)) {
        const isVideo = ReactPlayer.canPlay(urlInput);
        const proxyFile = new File([], urlInput, { type: isVideo ? 'video/external' : 'image/external' });
        onFilesChange([...files, proxyFile]);
        setUrlInput('');
      }
    }
  };

  const filePreviews = useMemo(() => files.map((file, index) => ({
    file,
    preview: file.type.includes('external') ? file.name : URL.createObjectURL(file),
    index
  })), [files]);

  return (
    <div>
      {isImageEditorOpen && mediaToEdit && !mediaToEdit.file.type.includes('external') && mediaToEdit.file.type.startsWith('image/') && (
        <ImageEditorModal isOpen={isImageEditorOpen} onClose={() => setIsImageEditorOpen(false)} imageSrc={mediaToEdit.preview} onSave={(file) => handleEditComplete(file, mediaToEdit.index)} />
      )}

      {isVideoPreviewOpen && mediaToEdit && !mediaToEdit.file.type.includes('external') && mediaToEdit.file.type.startsWith('video/') && (
        <VideoPreviewEditor isOpen={isVideoPreviewOpen} onClose={() => setIsVideoPreviewOpen(false)} file={mediaToEdit.file} preview={mediaToEdit.preview} onSave={(file) => handleEditComplete(file, mediaToEdit.index)} />
      )}

      <label className="block text-sm font-medium text-gray-700 mb-1">{label} ({files.length}/{maxFiles})</label>
      
      <div className="flex items-center space-x-2 border border-gray-200 rounded-lg p-1 mb-4 bg-gray-50 w-fit">
        <button type="button" onClick={() => setMediaMode('upload')} className={`px-3 py-1 rounded-md text-sm font-medium flex items-center ${mediaMode === 'upload' ? 'bg-white shadow text-german-red' : 'text-gray-600'}`}><UploadCloud className="w-4 h-4 mr-2"/>{t('testimonials.media_uploader.mode_upload')}</button>
        <button type="button" onClick={() => setMediaMode('url')} className={`px-3 py-1 rounded-md text-sm font-medium flex items-center ${mediaMode === 'url' ? 'bg-white shadow text-german-red' : 'text-gray-600'}`}><LinkIcon className="w-4 h-4 mr-2"/>{t('testimonials.media_uploader.mode_url')}</button>
      </div>

      {files.length < maxFiles && (
        <>
          {mediaMode === 'upload' && (
            <div {...getRootProps()} className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer transition-colors ${isDragActive ? 'border-blue-500 bg-blue-50' : 'hover:border-blue-400'}`}>
              <input {...getInputProps()} />
              <div className="space-y-1 text-center"><UploadCloud className="mx-auto h-12 w-12 text-gray-400" /><p className="text-sm text-gray-600">{t('testimonials.media_uploader.dropzone')}</p><p className="text-xs text-gray-500">{t('testimonials.media_uploader.file_types')}</p></div>
            </div>
          )}
          {mediaMode === 'url' && (
            <div className="flex items-center space-x-2">
              <input type="text" value={urlInput} onChange={(e) => setUrlInput(e.target.value)} placeholder={t('testimonials.media_uploader.url_placeholder')} className="w-full p-2 border border-gray-300 rounded-lg" />
              <button type="button" onClick={handleAddUrl} className="px-4 py-2 bg-german-red text-white rounded-lg">{t('testimonials.media_uploader.add')}</button>
            </div>
          )}
        </>
      )}

      {filePreviews.length > 0 && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filePreviews.map(({ file, preview, index }) => (
            <div key={`${file.name}-${index}`} className="relative group bg-gray-100 rounded-lg border aspect-square">
              {file.type.startsWith('image/') ? (
                <img src={preview} alt={file.name} className="w-full h-full rounded-md object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200 rounded-md">
                  <Film className="w-8 h-8 text-gray-600" />
                  {!file.type.includes('external') && (
                    <div className="absolute top-2 right-2 bg-german-red text-white text-xs px-2 py-1 rounded">
                      VIDEO
                    </div>
                  )}
                </div>
              )}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all rounded-md flex items-center justify-center space-x-2">
                {!file.type.includes('external') && (file.type.startsWith('image/') || file.type.startsWith('video/')) && (
                  <button type="button" onClick={() => openEditor(file, preview, index)} className="p-2 rounded-full bg-white/20 text-white opacity-0 group-hover:opacity-100 transition-opacity" title={file.type.startsWith('video/') ? t('testimonials.media_uploader.video_preview') : t('testimonials.media_uploader.edit_media')}>
                    {file.type.startsWith('video/') ? <Eye className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
                  </button>
                )}
                <button type="button" onClick={() => removeFile(index)} className="p-2 rounded-full bg-white/20 text-white opacity-0 group-hover:opacity-100 transition-opacity" title={t('testimonials.media_uploader.remove')}><X className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdvancedMediaUploader;
