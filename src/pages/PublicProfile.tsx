import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { supabase, Profile, Testimonial, GalleryMedia } from '../lib/supabase';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Avatar from '../components/ui/Avatar';
import TestimonialCard from '../components/testimonials/TestimonialCard';
import { Facebook, Twitter, Instagram, Linkedin, Link as LinkIcon, Calendar, AlertTriangle, MapPin, ArrowLeft, ShieldCheck, User, Video, Play } from 'lucide-react';
import SEOHead from '../components/seo/SEOHead';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const socialIcons: { [key: string]: React.ReactNode } = {
  facebook: <Facebook className="w-5 h-5" />,
  twitter: <Twitter className="w-5 h-5" />,
  instagram: <Instagram className="w-5 h-5" />,
  linkedin: <Linkedin className="w-5 h-5" />,
  default: <LinkIcon className="w-5 h-5" />,
};

const getSocialIcon = (url: string) => {
  if (url.includes('facebook.com')) return socialIcons.facebook;
  if (url.includes('twitter.com') || url.includes('x.com')) return socialIcons.twitter;
  if (url.includes('instagram.com')) return socialIcons.instagram;
  if (url.includes('linkedin.com')) return socialIcons.linkedin;
  return socialIcons.default;
};

const PublicProfile: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [videos, setVideos] = useState<GalleryMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError(t('public_profile.not_found', 'Profile not found.'));
      setLoading(false);
      return;
    }

    const fetchProfileData = async () => {
      try {
        const [profileRes, testimonialsRes, videosRes] = await Promise.all([
          supabase
            .from('profiles')
            .select('id, full_name, avatar_url, bio, social_links, is_public, created_at, city, region')
            .eq('id', id)
            .single(),
          supabase
            .from('testimonials')
            .select('*, profiles(avatar_url, full_name)')
            .eq('user_id', id)
            .eq('status', 'approved')
            .order('created_at', { ascending: false }),
          supabase
            .from('gallery_media')
            .select('*')
            .eq('user_id', id)
            .eq('media_type', 'video')
            .eq('is_approved', true)
            .eq('is_public', true)
            .order('created_at', { ascending: false })
        ]);

        if (profileRes.error) throw new Error(t('public_profile.not_found', 'Profile not found.'));
        if (!profileRes.data.is_public) throw new Error(t('public_profile.private', 'This profile is private.'));
        
        setProfile(profileRes.data as Profile);

        if (testimonialsRes.error) {
          console.warn("Could not fetch testimonials:", testimonialsRes.error.message);
          setTestimonials([]);
        } else {
          setTestimonials(testimonialsRes.data as Testimonial[]);
        }

        if (videosRes.error) {
          console.warn("Could not fetch videos:", videosRes.error.message);
          setVideos([]);
        } else {
          setVideos(videosRes.data as GalleryMedia[]);
        }

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [id, t]);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen bg-gray-50"><LoadingSpinner size="lg" /></div>;
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50 text-center px-4">
        <AlertTriangle className="w-16 h-16 text-german-red mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">{error}</h2>
        <Link to="/clients" className="mt-6 inline-flex items-center text-german-red hover:text-red-800 font-medium">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('public_profile.back_to_clients', 'Back to Directory')}
        </Link>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <>
      <SEOHead
        title={`${profile.full_name} | MüllerFührerschein`}
        description={profile.bio ? profile.bio.substring(0, 150) : `View ${profile.full_name}'s verified profile on MüllerFührerschein.`}
      />
      <div className="min-h-screen bg-gray-50 pb-20">
        {/* Navigation Bar */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
            <Link to="/clients" className="inline-flex items-center text-gray-600 hover:text-german-red font-medium transition-colors">
              <ArrowLeft className="w-5 h-5 mr-2" />
              {t('public_profile.back_to_clients', 'Back to Directory')}
            </Link>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          {/* Profile Header Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-8">
            <div className="h-48 sm:h-64 bg-gradient-to-r from-gray-100 to-gray-200 relative overflow-hidden">
               {/* Abstract background */}
              <div className="absolute top-0 left-0 w-full h-full bg-german-red/10 blur-3xl -z-0" />
            </div>
            
            <div className="px-6 sm:px-10 pb-8 relative">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-20 sm:-mt-24 mb-6">
                <div className="p-2 bg-white rounded-full inline-block shadow-md relative z-10">
                  <Avatar name={profile.full_name || ''} avatarUrl={profile.avatar_url} size="lg" className="w-32 h-32 sm:w-40 sm:h-40 text-4xl" />
                </div>
                {profile.social_links && Object.keys(profile.social_links).length > 0 && (
                  <div className="flex items-center space-x-3 mt-4 sm:mt-0">
                    {Object.entries(profile.social_links).map(([platform, url]) => (
                      <a key={platform} href={url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:text-white hover:bg-german-red transition-all duration-300">
                        {getSocialIcon(url)}
                      </a>
                    ))}
                  </div>
                )}
              </div>
              
              <div>
                <h1 className="text-3xl sm:text-4xl font-black text-gray-900 flex items-center gap-2">
                  {profile.full_name}
                  <ShieldCheck className="w-8 h-8 text-german-red" aria-label="Verified Customer" />
                </h1>
                <p className="text-german-red font-semibold text-lg flex items-center gap-1.5 mt-1">
                  {t('public_profile.verified_customer', 'Verified Customer')}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-gray-500 mt-4">
                  <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium">
                      {t('public_profile.member_since', 'Member since')} {new Date(profile.created_at).toLocaleDateString(i18n.language, { year: 'numeric', month: 'long' })}
                    </span>
                  </div>
                  {(profile.city || profile.region) && (
                    <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium">
                        {profile.city}{profile.city && profile.region ? ', ' : ''}{profile.region}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Info */}
            <div className="lg:col-span-1 space-y-8">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-german-red" />
                  {t('public_profile.bio', 'About me')}
                </h2>
                <div className="text-gray-600 prose prose-red max-w-none text-base leading-relaxed">
                  {profile.bio ? (
                    <p>{profile.bio}</p>
                  ) : (
                    <p className="italic text-gray-400">{t('public_profile.no_bio', 'No biography provided.')}</p>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Right Column: Content */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Videos Section */}
              {videos.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Video className="w-6 h-6 text-german-red" />
                    {t('public_profile.my_videos', 'My Driving Videos')}
                    <span className="bg-red-50 text-german-red text-sm py-0.5 px-2.5 rounded-full ml-1">{videos.length}</span>
                  </h2>
                  <div className="relative -mx-4 sm:mx-0">
                    <Swiper
                      modules={[Navigation, Pagination]}
                      navigation
                      pagination={{ clickable: true, dynamicBullets: true }}
                      spaceBetween={24}
                      slidesPerView={1}
                      breakpoints={{
                        640: { slidesPerView: 2 },
                      }}
                      className="px-4 pb-12 pt-2"
                    >
                      {videos.map((video) => (
                        <SwiperSlide key={video.id}>
                          <div className="bg-black rounded-2xl overflow-hidden shadow-md relative group aspect-[9/16] sm:aspect-video h-[400px] sm:h-[250px] cursor-pointer">
                            {video.video_platform === 'youtube' && video.media_url ? (
                              <iframe
                                src={`https://www.youtube.com/embed/${video.media_url.split('v=')[1]?.split('&')[0] || video.media_url.split('/').pop()}`}
                                title={video.title || "Video"}
                                className="w-full h-full border-0 pointer-events-none"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              ></iframe>
                            ) : video.video_platform === 'vimeo' && video.media_url ? (
                                <iframe
                                  src={`https://player.vimeo.com/video/${video.media_url.split('/').pop()}`}
                                  title={video.title || "Video"}
                                  className="w-full h-full border-0 pointer-events-none"
                                  allow="autoplay; fullscreen; picture-in-picture"
                                  allowFullScreen
                                ></iframe>
                            ) : video.media_url ? (
                              <video
                                src={video.media_url}
                                className="w-full h-full object-cover"
                                controls
                                preload="metadata"
                              />
                            ) : (
                               <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900">
                                   <Video className="w-12 h-12 text-gray-700 mb-2" />
                                   <p className="text-gray-500 text-sm">Video Unavailable</p>
                               </div>
                            )}
                            
                            {/* Overlay for clicks on embedded iframes (optional, allows to open in modal if we wanted, but standard controls are okay. If it's a native video we let them use controls.) */}
                            {video.video_platform && (
                                <div className="absolute inset-0 z-10 flex flex-col justify-end p-4 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-100 transition-opacity">
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="w-16 h-16 bg-german-red/90 rounded-full flex items-center justify-center text-white backdrop-blur-sm shadow-xl transform group-hover:scale-110 transition-transform duration-300">
                                            <Play className="w-8 h-8 ml-1" />
                                        </div>
                                    </div>
                                    <h3 className="text-white font-bold text-lg leading-tight relative z-20 drop-shadow-md line-clamp-2">{video.title}</h3>
                                </div>
                            )}
                          </div>
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  </div>
                </div>
              )}

              {/* Testimonials Section */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  {t('public_profile.testimonials', 'My Reviews')}
                  <span className="bg-red-50 text-german-red text-sm py-0.5 px-2.5 rounded-full">{testimonials.length}</span>
                </h2>
                
                {testimonials.length > 0 ? (
                  <div className="grid grid-cols-1 gap-6">
                    {testimonials.map((testimonial, index) => (
                      <motion.div key={testimonial.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * index }}>
                        <TestimonialCard testimonial={testimonial} />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ShieldCheck className="w-8 h-8 text-gray-300" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{t('public_profile.no_reviews', 'No reviews')}</h3>
                    <p className="text-gray-500">{t('public_profile.no_testimonials', 'No reviews published yet.')}</p>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PublicProfile;
