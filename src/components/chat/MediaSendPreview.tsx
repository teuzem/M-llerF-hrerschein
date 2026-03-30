import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { Film, FileText, Music, X, Plus } from 'lucide-react';

interface MediaSendPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  files: File[];
  conversationId: string;
}

const MediaSendPreview: React.FC<MediaSendPreviewProps> = ({ isOpen, onClose, files: initialFiles, conversationId }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [caption, setCaption] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (isOpen && initialFiles.length > 0) {
      setFiles(initialFiles);
      setActiveIndex(0);
      setCaption('');
    }
  }, [isOpen, initialFiles]);

  if (!isOpen || files.length === 0) return null;

  const activeFile = files[activeIndex];
  const isExternal = activeFile.type.startsWith('external');
  const realType = isExternal ? activeFile.type.split('/')[1] : activeFile.type.split('/')[0];
  const url = isExternal ? activeFile.name : URL.createObjectURL(activeFile);

  const handleSend = async () => {
    if (!user || files.length === 0) return;
    setIsSending(true);

    try {
      const messagesToInsert = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        let media_url: string;
        
        const isExt = file.type.startsWith('external');
        const rType = isExt ? file.type.split('/')[1] : file.type.split('/')[0];
        
        let media_type: 'image' | 'video' | 'voice' | 'file' = 'file';
        if (rType === 'image') media_type = 'image';
        else if (rType === 'video') media_type = 'video';
        else if (rType === 'audio') media_type = 'voice';

        if (isExt) {
          media_url = file.name;
        } else {
          const filePath = `${user.id}/${conversationId}/${Date.now()}-${file.name}`;
          const { error: uploadError } = await supabase.storage.from('chat_media').upload(filePath, file);
          if (uploadError) throw new Error(`Échec de l'upload pour ${file.name}`);
          const { data: urlData } = supabase.storage.from('chat_media').getPublicUrl(filePath);
          media_url = urlData.publicUrl;

          // Auto-save all media and documents to the user's gallery
          await supabase.from('gallery_media').insert({
            user_id: user.id,
            media_url: media_url,
            media_type: media_type,
            caption: i === 0 ? caption : '',
            is_approved: true
          });
        }

        messagesToInsert.push({
          conversation_id: conversationId,
          user_id: user.id,
          content: i === 0 ? caption : '', // Only first file gets the caption
          media_url: media_url,
          media_type: media_type,
        });
      }

      const { error: insertError } = await supabase.from('messages').insert(messagesToInsert);
      if (insertError) throw insertError;

      toast.success(t('chat.media_sent', 'Médias envoyés !'));
      onClose();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSending(false);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    if (newFiles.length === 0) {
      onClose();
    } else {
      setFiles(newFiles);
      if (activeIndex >= newFiles.length) {
        setActiveIndex(newFiles.length - 1);
      }
    }
  };

  const handleAddFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const renderPreview = (file: File, type: string, activeUrl: string) => {
    if (type === 'image') {
      return <img src={activeUrl} alt="Preview" className="max-w-full max-h-full object-contain bg-black/5 rounded-xl shadow-inner border border-gray-100" />;
    } else if (type === 'video') {
      return <video src={activeUrl} controls className="max-w-full max-h-full object-contain bg-black/90 rounded-xl shadow-lg border border-gray-800" />;
    } else if (type === 'audio') {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-100 rounded-xl p-6 shadow-inner border border-purple-200">
          <div className="w-24 h-24 bg-white rounded-full shadow-lg flex items-center justify-center mb-6">
            <Music className="w-12 h-12 text-purple-500 animate-pulse" />
          </div>
          <audio src={activeUrl} controls className="w-full max-w-md shadow-md rounded-full" />
          <p className="mt-6 font-semibold text-gray-800 text-lg truncate max-w-sm px-4 py-2 bg-white/50 backdrop-blur-sm rounded-full">{isExternal ? 'Audio Galerie' : file.name}</p>
        </div>
      );
    } else {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-100 rounded-xl p-6 shadow-inner border border-blue-200">
           <div className="p-6 bg-white rounded-full shadow-md mb-6">
             <FileText className="w-16 h-16 text-[#0055A4]" />
           </div>
           <p className="font-bold text-gray-800 text-xl truncate w-full text-center max-w-md px-4">{isExternal ? 'Document Galerie' : file.name}</p>
           {!isExternal && <p className="text-sm text-gray-500 mt-2 font-bold tracking-wider bg-white/60 px-4 py-1.5 rounded-full">{file.name.split('.').pop()} • {(file.size / 1024 / 1024).toFixed(2)} MB</p>}
        </div>
      );
    }
  };

  const renderThumbnail = (file: File, idx: number) => {
    const isExt = file.type.startsWith('external');
    const rType = isExt ? file.type.split('/')[1] : file.type.split('/')[0];
    const thumbUrl = isExt ? file.name : URL.createObjectURL(file);
    
    return (
      <div 
        key={idx} 
        className={`relative flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 cursor-pointer transition-all duration-200 ease-out ${idx === activeIndex ? 'border-[#0055A4] scale-105 shadow-md shadow-blue-200' : 'border-transparent opacity-60 hover:opacity-100'}`}
        onClick={() => setActiveIndex(idx)}
      >
        <button 
          onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
          className="absolute -top-1 -right-1 bg-black/70 text-white rounded-full p-0.5 hover:bg-red-500 z-10 transition-colors backdrop-blur-sm"
        >
          <X className="w-3.5 h-3.5" />
        </button>
        
        {rType === 'image' ? (
          <img src={thumbUrl} className="w-full h-full object-cover" alt="" />
        ) : rType === 'video' ? (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center"><Film className="w-6 h-6 text-white/70" /></div>
        ) : rType === 'audio' ? (
          <div className="w-full h-full bg-purple-100 flex items-center justify-center"><Music className="w-6 h-6 text-purple-500" /></div>
        ) : (
          <div className="w-full h-full bg-blue-100 flex items-center justify-center"><FileText className="w-6 h-6 text-[#0055A4]" /></div>
        )}
      </div>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('chat.send_media', 'Envoyer des médias')}>
      <div className="flex flex-col gap-5">
        {/* Main Preview Area */}
        <div className="relative w-full h-[450px] flex items-center justify-center bg-gray-50 rounded-2xl overflow-hidden shadow-inner">
          {renderPreview(activeFile, realType, url)}
        </div>
        
        {/* Thumbnails Carousel */}
        <div className="flex items-center gap-3 overflow-x-auto py-3 custom-scrollbar px-2 bg-gray-50/50 rounded-xl">
          {files.map((f, i) => renderThumbnail(f, i))}
          
          <label className="flex-shrink-0 w-16 h-16 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:text-[#0055A4] hover:border-[#0055A4] hover:bg-blue-50 cursor-pointer transition-all duration-200 shadow-sm">
            <Plus className="w-7 h-7" />
            <input type="file" multiple className="hidden" onChange={handleAddFiles} />
          </label>
        </div>

        {/* Caption and Controls */}
        <div className="flex flex-col gap-4 mt-2 border-t border-gray-100 pt-4">
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder={t('chat.caption_placeholder', 'Ajouter une légende...')}
            rows={2}
            className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#0055A4]/20 focus:border-[#0055A4] outline-none resize-none transition-shadow shadow-sm placeholder-gray-400 text-gray-700"
          />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={onClose} className="px-6 rounded-xl font-medium shadow-sm hover:shadow">Annuler</Button>
            <Button onClick={handleSend} isLoading={isSending} className="px-8 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all text-white bg-[#0055A4] hover:-translate-y-0.5">
              Envoyer {files.length > 1 ? `(${files.length})` : ''}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default MediaSendPreview;
