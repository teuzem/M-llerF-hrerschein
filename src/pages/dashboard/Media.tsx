import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase, GalleryMedia } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Button from '../../components/ui/Button';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import MediaStats from '../../components/dashboard/media/MediaStats';
import MediaShareStatsChart from '../../components/dashboard/media/MediaShareStatsChart';
import MediaInteractionChart from '../../components/dashboard/media/MediaInteractionChart';
import UserMediaCard from '../../components/dashboard/media/UserMediaCard';
import EditUserMediaModal from '../../components/dashboard/media/EditUserMediaModal';
import { Image as ImageIcon, Video as VideoIcon, PlusCircle } from 'lucide-react';

type StatusTab = 'published' | 'pending' | 'rejected';
type MediaTypeTab = 'image' | 'video';

const DashboardMedia: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [media, setMedia] = useState<GalleryMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [mediaTypeTab, setMediaTypeTab] = useState<MediaTypeTab>('image');
  const [statusTab, setStatusTab] = useState<StatusTab>('published');
  const [editingMedia, setEditingMedia] = useState<GalleryMedia | null>(null);

  const fetchMedia = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('gallery_media')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMedia(data as any[]);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('dashboard.media.delete_confirm', 'Sind Sie sicher, dass Sie dieses Medium löschen möchten?'))) return;

    try {
      const { error } = await supabase.from('gallery_media').delete().eq('id', id);
      if (error) throw error;
      setMedia(prev => prev.filter(m => m.id !== id));
      toast.success(t('dashboard.media.delete_success', 'Medium erfolgreich gelöscht'));
    } catch (error: any) {
      toast.error(t('dashboard.media.delete_error', 'Fehler beim Löschen des Mediums'));
    }
  };

  const handleEdit = (mediaItem: GalleryMedia) => {
    setEditingMedia(mediaItem);
  };

  const filteredMedia = useMemo(() => {
    const statusMap = {
      published: 'approved',
      pending: 'pending',
      rejected: 'rejected',
    };
    return media.filter(m => m.media_type === mediaTypeTab && (m as any).status === statusMap[statusTab]);
  }, [media, mediaTypeTab, statusTab]);

  const statusTabs: { id: StatusTab; label: string }[] = [
    { id: 'published', label: t('dashboard.media.tab_published', 'Veröffentlicht') },
    { id: 'pending', label: t('dashboard.media.tab_pending', 'Ausstehend') },
    { id: 'rejected', label: t('dashboard.media.tab_rejected', 'Abgelehnt') },
  ];

  if (loading) {
    return <div className="flex justify-center items-center h-full"><LoadingSpinner size="lg" /></div>;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <EditUserMediaModal
        isOpen={!!editingMedia}
        onClose={() => setEditingMedia(null)}
        media={editingMedia}
        onUpdate={fetchMedia}
      />

      <DashboardHeader
        title={t('dashboard.media.title', 'Medien')}
        subtitle={t('dashboard.media.subtitle', 'Verwalten Sie Ihre Bilder und Videos')}
        icon={ImageIcon}
      >
        <Button as={Link} to="/gallery" className="bg-white text-german-red hover:bg-gray-100">
          <PlusCircle className="w-4 h-4 mr-2" />
          {t('dashboard.media.add_new', 'Neue Medien hinzufügen')}
        </Button>
      </DashboardHeader>

      <MediaStats media={media} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
          <div className="mb-4 border-b">
            <div className="flex space-x-4">
              <button onClick={() => setMediaTypeTab('image')} className={`flex items-center gap-2 pb-2 border-b-2 ${mediaTypeTab === 'image' ? 'border-german-red text-german-red' : 'border-transparent text-gray-500'}`}>
                <ImageIcon className="w-5 h-5"/> {t('dashboard.media.type_images', 'Bilder')}
              </button>
              <button onClick={() => setMediaTypeTab('video')} className={`flex items-center gap-2 pb-2 border-b-2 ${mediaTypeTab === 'video' ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500'}`}>
                <VideoIcon className="w-5 h-5"/> {t('dashboard.media.type_videos', 'Videos')}
              </button>
            </div>
          </div>
          <div className="mb-4 border-b">
            <nav className="-mb-px flex space-x-6 overflow-x-auto">
              {statusTabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setStatusTab(tab.id)}
                  className={`${
                    statusTab === tab.id
                      ? 'border-german-red text-german-red'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
          
          <div className="space-y-4">
            {filteredMedia.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredMedia.map(item => (
                  <UserMediaCard key={item.id} media={item} onDelete={handleDelete} onEdit={handleEdit} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">{t('dashboard.media.empty', 'Keine Medien vorhanden')}</h3>
              </div>
            )}
          </div>
        </div>
        <div className="lg:col-span-1 space-y-8">
          <MediaShareStatsChart media={media} />
          <MediaInteractionChart media={media} />
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardMedia;
