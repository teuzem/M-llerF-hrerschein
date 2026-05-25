import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { supabase, GalleryMedia } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Image as ImageIcon, Video as VideoIcon, PlusCircle, RefreshCw } from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import MediaUploader from '../components/gallery/MediaUploader';
import ImageGrid from '../components/gallery/ImageGrid';
import VideoFeed from '../components/gallery/VideoFeed';
import { useTranslation } from 'react-i18next';
import SEOHead from '../components/seo/SEOHead';
import { pageSEO } from '../lib/seoData';

const BUCKET_NAME = 'gallery-media';
const VIDEO_FOLDER = 'videos';

interface StorageVideo {
  id: string;
  name: string;
  url: string;
  createdAt: string;
}

const Gallery: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [media, setMedia] = useState<GalleryMedia[]>([]);
  const [storageVideos, setStorageVideos] = useState<StorageVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [storageLoading, setStorageLoading] = useState(true);
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'images' | 'videos'>('images');

  // Fetch videos from Supabase Storage bucket (real-time)
  const fetchStorageVideos = useCallback(async () => {
    try {
      setStorageLoading(true);

      const { data: files, error: listError } = await supabase.storage
        .from(BUCKET_NAME)
        .list(VIDEO_FOLDER, {
          limit: 100,
          sortBy: { column: 'created_at', order: 'desc' },
        });

      if (listError) throw listError;

      if (!files || files.length === 0) {
        setStorageVideos([]);
        return;
      }

      // Filter only video files and get public URLs
      const videoFiles = files.filter(file => 
        file.name.match(/\.(mp4|webm|mov|avi|mkv|m4v)$/i)
      );

      const videosWithUrls: StorageVideo[] = videoFiles.map(file => {
        const { data: urlData } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(`${VIDEO_FOLDER}/${file.name}`);

        return {
          id: file.id || file.name,
          name: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
          url: urlData.publicUrl,
          createdAt: file.created_at || new Date().toISOString(),
        };
      });

      setStorageVideos(videosWithUrls);
    } catch (error: any) {
      console.error('[v0] Error fetching storage videos:', error);
      toast.error(t('gallery.storage_fetch_error'));
    } finally {
      setStorageLoading(false);
    }
  }, [t]);

  // Fetch gallery media from database
  const fetchData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('gallery_media')
        .select('*')
        .eq('is_approved', true)
        .eq('is_public', true)
        .order('created_at', { ascending: false});

      if (error) throw error;
      setMedia(data as any);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchStorageVideos();

    // Set up real-time subscription for storage changes
    const channel = supabase
      .channel('gallery-storage-videos')
      .on('postgres_changes', {
        event: '*',
        schema: 'storage',
        table: 'objects',
        filter: `bucket_id=eq.${BUCKET_NAME}`,
      }, () => {
        fetchStorageVideos();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchStorageVideos]);

  const images = media.filter(m => m.media_type === 'image');
  const dbVideos = media.filter(m => m.media_type === 'video');
  
  // Convert storage videos to GalleryMedia format for VideoFeed component
  const storageVideosAsGalleryMedia: GalleryMedia[] = storageVideos.map(sv => ({
    id: sv.id,
    user_id: null,
    media_type: 'video' as const,
    media_url: sv.url,
    title: sv.name,
    is_approved: true,
    is_public: true,
    created_at: sv.createdAt,
    profiles: null,
    likes: [{ count: 0 }],
    comments: [{ count: 0 }],
  }));

  // Combine database videos with storage videos (storage videos first as testimonials)
  const allVideos = [...storageVideosAsGalleryMedia, ...dbVideos];

  const currentLang = i18n.language.split('-')[0] as 'de' | 'en' | 'fr';
  const seoData = (pageSEO as any)[currentLang]?.gallery || pageSEO.de.gallery;

  const isLoadingContent = loading || (activeTab === 'videos' && storageLoading);

  return (
    <div className="min-h-screen bg-gray-100">
      <SEOHead 
        title={seoData.title}
        description={seoData.description}
        keywords={seoData.keywords}
        locale={currentLang}
      />
      <Modal isOpen={isUploaderOpen} onClose={() => setIsUploaderOpen(false)} title={t('gallery.add_media')}>
        <MediaUploader onUploadSuccess={() => {
          setIsUploaderOpen(false);
          fetchData();
          fetchStorageVideos();
        }} />
      </Modal>

      <section className="bg-gradient-to-br from-german-black via-german-red to-gray-900 text-white py-20">
        <div className="w-full px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl lg:text-6xl font-bold mb-4">
            {t('gallery.title')}
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-xl lg:text-2xl text-blue-100 max-w-3xl mx-auto">
            {t('gallery.subtitle')}
          </motion.p>
          {user && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-8">
              <Button onClick={() => setIsUploaderOpen(true)} className="bg-white text-german-red hover:bg-gray-100">
                <PlusCircle className="w-5 h-5 mr-2" />
                {t('gallery.add_media')}
              </Button>
            </motion.div>
          )}
        </div>
      </section>

      <div className="w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-12">
        <div className="flex justify-center mb-8 border-b border-gray-200">
          <button onClick={() => setActiveTab('images')} className={`flex items-center gap-2 px-6 py-3 font-medium text-lg border-b-2 ${activeTab === 'images' ? 'border-german-red text-german-red' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            <ImageIcon /> {t('gallery.images_title')}
          </button>
          <button onClick={() => setActiveTab('videos')} className={`flex items-center gap-2 px-6 py-3 font-medium text-lg border-b-2 ${activeTab === 'videos' ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            <VideoIcon /> {t('gallery.videos_title')}
            {storageVideos.length > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-red-100 text-red-600 text-xs font-semibold rounded-full">
                {allVideos.length}
              </span>
            )}
          </button>
        </div>

        {/* Refresh button for videos tab */}
        {activeTab === 'videos' && (
          <div className="flex justify-end mb-4">
            <button
              onClick={() => {
                fetchData();
                fetchStorageVideos();
              }}
              disabled={isLoadingContent}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingContent ? 'animate-spin' : ''}`} />
              {t('gallery.refresh')}
            </button>
          </div>
        )}

        {isLoadingContent ? (
          <div className="flex justify-center items-center h-64"><LoadingSpinner size="lg" /></div>
        ) : (
          <div>
            {activeTab === 'images' && (
              images.length > 0 ? <ImageGrid images={images} /> : (
                <div className="text-center py-16 text-gray-500">
                  <ImageIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <p>{t('gallery.no_images')}</p>
                </div>
              )
            )}
            {activeTab === 'videos' && (
              allVideos.length > 0 ? (
                <div>
                  {/* Storage Videos Section - Testimonials */}
                  {storageVideosAsGalleryMedia.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <VideoIcon className="w-5 h-5 text-red-600" />
                        {t('gallery.testimonial_videos')}
                        <span className="text-sm font-normal text-gray-500">
                          ({storageVideosAsGalleryMedia.length})
                        </span>
                      </h3>
                      <VideoFeed videos={storageVideosAsGalleryMedia} />
                    </div>
                  )}
                  
                  {/* Database Videos Section - User Uploads */}
                  {dbVideos.length > 0 && (
                    <div className="mt-12">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <VideoIcon className="w-5 h-5 text-blue-600" />
                        {t('gallery.user_videos')}
                        <span className="text-sm font-normal text-gray-500">
                          ({dbVideos.length})
                        </span>
                      </h3>
                      <VideoFeed videos={dbVideos} />
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-16 text-gray-500">
                  <VideoIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <p>{t('gallery.no_videos')}</p>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Gallery;
