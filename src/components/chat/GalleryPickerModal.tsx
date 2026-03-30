import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import Modal from '../ui/Modal';
import LoadingSpinner from '../ui/LoadingSpinner';
import { Image as ImageIcon, Video, FileText, UploadCloud } from 'lucide-react';

interface GalleryPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (media: { media_url: string; media_type: 'image' | 'video' | 'file' }) => void;
  onFileUpload?: (files: File[]) => void;
}

const GalleryPickerModal: React.FC<GalleryPickerModalProps> = ({ isOpen, onClose, onSelect, onFileUpload }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'gallery' | 'documents'>('gallery');
  const [media, setMedia] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && user) {
      if (activeTab === 'gallery') {
        fetchGallery();
      } else {
        fetchDocuments();
      }
    }
  }, [isOpen, user, activeTab]);

  const fetchGallery = async () => {
    setLoading(true);
    try {
      const { data: galleryData } = await supabase
        .from('gallery_media')
        .select('*')
        .eq('user_id', user?.id)
        .in('media_type', ['image', 'video'])
        .order('created_at', { ascending: false });
      
      const { data: profileData } = await supabase
        .from('profiles')
        .select('avatar_url, cover_url')
        .eq('id', user?.id)
        .single();

      let allMedia: any[] = galleryData || [];

      if (profileData) {
        if (profileData.avatar_url) {
          const { data } = supabase.storage.from('avatars').getPublicUrl(profileData.avatar_url);
          if (data && data.publicUrl) {
            allMedia.unshift({ id: 'avatar', media_type: 'image', media_url: data.publicUrl });
          }
        }
        if (profileData.cover_url) {
          const { data } = supabase.storage.from('avatars').getPublicUrl(profileData.cover_url);
          if (data && data.publicUrl) {
            allMedia.unshift({ id: 'cover', media_type: 'image', media_url: data.publicUrl });
          }
        }
      }
      setMedia(allMedia);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const fetchDocuments = async () => {
    setLoading(true);
    const { data: appDocsData, error: appDocsError } = await supabase
      .from('application_documents')
      .select('*, license_applications!inner(user_id)')
      .eq('license_applications.user_id', user?.id)
      .order('uploaded_at', { ascending: false });
    
    if (appDocsError) console.error(appDocsError);

    const { data: genericDocsData, error: genericDocsError } = await supabase
      .from('gallery_media')
      .select('*')
      .eq('user_id', user?.id)
      .in('media_type', ['file', 'audio', 'voice'])
      .order('created_at', { ascending: false });

    if (genericDocsError) console.error(genericDocsError);

    const formattedGenericDocs = (genericDocsData || []).map(doc => ({
      id: doc.id,
      file_name: decodeURIComponent(doc.media_url.split('/').pop() || 'Document').replace(/^\d+-/, ''),
      file_path: doc.media_url, 
      isFromGalleryMedia: true
    }));

    setDocuments([...formattedGenericDocs, ...(appDocsData || [])]);
    setLoading(false);
  };

  const handleDocumentSelect = (doc: any) => {
    if (doc.isFromGalleryMedia) {
      onSelect({ media_url: doc.file_path, media_type: 'file' });
    } else {
      const { data } = supabase.storage.from('application-documents').getPublicUrl(doc.file_path);
      if (data && data.publicUrl) {
        onSelect({ media_url: data.publicUrl, media_type: 'file' });
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0 && onFileUpload) {
      onFileUpload(Array.from(e.target.files));
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Sélecteur de Média">
      <div className="flex justify-between items-end border-b border-gray-200 mb-4">
        <div className="flex">
          <button
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'gallery' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('gallery')}
          >
            Ma Galerie (Photos/Vidéos)
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'documents' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('documents')}
          >
            Mes Documents
          </button>
        </div>
      </div>

      <div className="mb-4">
        <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50 text-gray-500 hover:bg-blue-50 hover:border-[#0055A4] hover:text-[#0055A4] transition-colors cursor-pointer group shadow-sm">
          <UploadCloud className="w-10 h-10 mb-2 text-gray-400 group-hover:text-[#0055A4] transition-colors" />
          <span className="text-base font-bold text-center">Glissez ou cliquez pour importer depuis le PC</span>
          <span className="text-sm mt-1 text-center">Images, Vidéos, Audios, Documents</span>
          <input type="file" multiple className="hidden" onChange={handleFileChange} />
        </label>
      </div>

      <div className="h-80 overflow-y-auto pr-1">
        {loading ? (
          <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>
        ) : (
          <>
            {activeTab === 'gallery' && (
              <div className="grid grid-cols-3 gap-2 pb-4">
                {media.length === 0 && <p className="col-span-3 text-center text-gray-500 italic py-4">Aucun média dans la galerie.</p>}
                {media.map((item, idx) => (
                  <div key={item.id + '-' + idx} className="relative aspect-square cursor-pointer group bg-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow transition-shadow" onClick={() => onSelect({ media_url: item.media_url, media_type: item.media_type })}>
                    <img src={item.media_type === 'image' ? item.media_url : item.thumbnail_url || item.media_url} className="w-full h-full object-cover" alt="" />
                    {item.media_type === 'video' && <Video className="absolute bottom-1 right-1 w-5 h-5 text-white drop-shadow-md" />}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <ImageIcon className="w-8 h-8 text-white" />
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {activeTab === 'documents' && (
              <div className="grid grid-cols-2 gap-3 pb-4">
                {documents.length === 0 && <p className="col-span-2 text-center text-gray-500 italic py-4">Aucun document trouvé sur la plateforme.</p>}
                {documents.map((doc, idx) => (
                  <div key={doc.id + '-' + idx} onClick={() => handleDocumentSelect(doc)} className="relative flex flex-col items-center justify-center p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-blue-50 hover:border-blue-200 transition-colors group h-32 bg-gray-50 shadow-sm hover:shadow">
                    <FileText className="w-10 h-10 text-blue-500 mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-xs text-center font-medium text-gray-700 truncate w-full px-2" title={doc.file_name}>
                      {doc.file_name || 'Document sans nom'}
                    </span>
                    <span className="text-[10px] text-gray-400 mt-1 uppercase">
                      {doc.file_name?.split('.').pop() || 'Fichier'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
};

export default GalleryPickerModal;
