import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { supabase, Profile } from '../../lib/supabase';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import { ArrowRight, MapPin } from 'lucide-react';
import Avatar from '../ui/Avatar';
import 'swiper/css';

const HomeClientCard: React.FC<{ profile: Profile }> = ({ profile }) => (
  <Link to={`/clients/${profile.id}`} className="flex flex-col items-center text-center p-4 sm:p-5 bg-white border border-gray-100 rounded-xl hover:border-gray-200 hover:shadow-md transition-all duration-300 h-full">
    <div className="mb-3"><Avatar name={profile.full_name || ''} avatarUrl={profile.avatar_url} size="lg" /></div>
    <p className="font-semibold text-gray-900 text-sm truncate w-full">{profile.full_name}</p>
    {(profile.city || profile.region) && (
      <div className="flex items-center text-xs text-gray-400 mt-1">
        <MapPin className="w-3 h-3 mr-1" />
        <span>{profile.city}{profile.city && profile.region ? ', ' : ''}{profile.region}</span>
      </div>
    )}
    {profile.bio && <p className="text-xs text-gray-500 mt-2 line-clamp-2 flex-grow">{profile.bio}</p>}
  </Link>
);

const HomeClientsSection = () => {
  const { t } = useTranslation();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClients = async () => {
      const { data, error } = await supabase.from('profiles').select('id, full_name, avatar_url, bio, city, region').eq('is_public', true).order('created_at', { ascending: false }).limit(10);
      if (error) console.error("Error fetching clients:", error);
      else setProfiles(data as Profile[]);
      setLoading(false);
    };
    fetchClients();
  }, []);

  if (loading || profiles.length === 0) return null;

  return (
    <section className="py-14 sm:py-16 bg-gray-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight max-w-2xl mx-auto">{t('home.clients.title')}</h2>
        </div>
        <Swiper modules={[Autoplay]} spaceBetween={12} slidesPerView={2} breakpoints={{ 640: { slidesPerView: 3, spaceBetween: 14 }, 768: { slidesPerView: 4, spaceBetween: 16 }, 1024: { slidesPerView: 5, spaceBetween: 16 } }} autoplay={{ delay: 3000, disableOnInteraction: false }} className="pb-2">
          {profiles.map(p => (
            <SwiperSlide key={p.id} style={{ height: 'auto' }}><HomeClientCard profile={p} /></SwiperSlide>
          ))}
        </Swiper>
        <div className="text-center mt-8">
          <Link to="/clients" className="group inline-flex items-center gap-2 text-gray-900 font-semibold hover:text-german-red transition-colors duration-200 text-sm">
            {t('home.clients.cta')}<ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HomeClientsSection;
