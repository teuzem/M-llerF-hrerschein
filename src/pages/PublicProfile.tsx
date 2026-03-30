import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { supabase, Profile, Testimonial } from '../lib/supabase';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Avatar from '../components/ui/Avatar';
import TestimonialCard from '../components/testimonials/TestimonialCard';
import { Facebook, Twitter, Instagram, Linkedin, Link as LinkIcon, Calendar, AlertTriangle, MapPin } from 'lucide-react';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError(t('public_profile.not_found'));
      setLoading(false);
      return;
    }

    const fetchProfileData = async () => {
      try {
        const [profileRes, testimonialsRes] = await Promise.all([
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
            .order('created_at', { ascending: false })
        ]);

        if (profileRes.error) throw new Error(t('public_profile.not_found'));
        if (!profileRes.data.is_public) throw new Error(t('public_profile.private'));
        
        setProfile(profileRes.data);

        if (testimonialsRes.error) {
          console.warn("Could not fetch testimonials:", testimonialsRes.error.message);
          setTestimonials([]);
        } else {
          setTestimonials(testimonialsRes.data as Testimonial[]);
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
    return <div className="flex justify-center items-center h-screen"><LoadingSpinner size="lg" /></div>;
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-center">
        <AlertTriangle className="w-16 h-16 text-yellow-500 mb-4" />
        <h2 className="text-2xl font-bold">{error}</h2>
        <p className="text-gray-600 mt-2">Ce profil n'est peut-être pas public ou n'existe pas.</p>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-white">
        <div className="w-full px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto py-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <Avatar name={profile.full_name || ''} avatarUrl={profile.avatar_url} size="lg" />
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-bold text-gray-900">{profile.full_name}</h1>
              <div className="flex flex-col md:flex-row md:items-center text-gray-500 mt-2 space-y-1 md:space-y-0 md:space-x-4">
                <p className="flex items-center justify-center md:justify-start">
                  <Calendar className="w-4 h-4 mr-2" />
                  {t('public_profile.member_since')} {new Date(profile.created_at).toLocaleDateString(i18n.language, { year: 'numeric', month: 'long' })}
                </p>
                {(profile.city || profile.region) && (
                  <p className="flex items-center justify-center md:justify-start">
                    <MapPin className="w-4 h-4 mr-2" />
                    {profile.city}{profile.city && profile.region ? ', ' : ''}{profile.region}
                  </p>
                )}
              </div>
              {profile.social_links && (
                <div className="flex items-center justify-center md:justify-start space-x-3 mt-4">
                  {Object.entries(profile.social_links).map(([platform, url]) => (
                    <a key={platform} href={url} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-german-red">
                      {getSocialIcon(url)}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-12">
        <div className="w-full px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-4">{t('public_profile.bio')}</h2>
              <p className="text-gray-600 prose">{profile.bio || t('public_profile.no_bio')}</p>
            </div>
          </div>
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-6">{t('public_profile.testimonials')}</h2>
            {testimonials.length > 0 ? (
              <div className="space-y-6">
                {testimonials.map(testimonial => (
                  <TestimonialCard key={testimonial.id} testimonial={testimonial} />
                ))}
              </div>
            ) : (
              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <p className="text-gray-500">{t('public_profile.no_testimonials')}</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default PublicProfile;
