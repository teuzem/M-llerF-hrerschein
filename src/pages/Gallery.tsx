import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase, GalleryMedia } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Image as ImageIcon, Video as VideoIcon, PlusCircle } from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import MediaUploader from '../components/gallery/MediaUploader';
import ImageGrid from '../components/gallery/ImageGrid';
import VideoFeed from '../components/gallery/VideoFeed';
import { useTranslation } from 'react-i18next';
import SEOHead from '../components/seo/SEOHead';
import { pageSEO } from '../lib/seoData';

const Gallery: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [media, setMedia] = useState<GalleryMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'images' | 'videos'>('images');

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
  }, []);

  const images = media.filter(m => m.media_type === 'image');
  const videos = media.filter(m => m.media_type === 'video');

  const currentLang = i18n.language.split('-')[0] as 'de' | 'en' | 'fr';
  const seoData = (pageSEO as any)[currentLang]?.gallery || pageSEO.de.gallery;

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
          </button>
        </div>

        {loading ? (
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
              videos.length > 0 ? <VideoFeed videos={videos} /> : (
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
