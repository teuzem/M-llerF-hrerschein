import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { supabase, Profile } from '../../lib/supabase';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import { Users, ArrowRight, MapPin } from 'lucide-react';
import Avatar from '../ui/Avatar';
import 'swiper/css';
import 'swiper/css/navigation';

const HomeClientCard: React.FC<{ profile: Profile }> = ({ profile }) => {
  return (
    <Link to={`/clients/${profile.id}`} className="flex flex-col items-center text-center group p-4 bg-white rounded-lg shadow-sm hover:shadow-xl transition-shadow duration-300 h-full">
      <div className="relative mb-3">
        <Avatar name={profile.full_name || ''} avatarUrl={profile.avatar_url} size="lg" />
      </div>
      <p className="font-semibold text-gray-800 text-sm truncate w-full">{profile.full_name}</p>
      {(profile.city || profile.region) && (
        <div className="flex items-center text-xs text-gray-500 mt-1">
          <MapPin className="w-3 h-3 mr-1" />
          <span>{profile.city}{profile.city && profile.region ? ', ' : ''}{profile.region}</span>
        </div>
      )}
      <p className="text-xs text-gray-500 mt-2 line-clamp-2 flex-grow">{profile.bio}</p>
    </Link>
  );
};

const HomeClientsSection = () => {
  const { t } = useTranslation();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClients = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, bio, city, region')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) console.error("Error fetching clients for home page:", error);
      else setProfiles(data as Profile[]);
      setLoading(false);
    };
    fetchClients();
  }, []);

  if (loading || profiles.length === 0) return null;

  return (
    <section className="py-20 bg-gray-50">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold mb-6 flex items-center justify-center text-gray-900">
            <Users className="w-10 h-10 mr-4 text-german-red" />
            {t('home.clients.title')}
          </h2>
        </div>
        <Swiper
          modules={[Navigation, Autoplay]}
          spaceBetween={20}
          slidesPerView={2}
          breakpoints={{
            640: { slidesPerView: 3 },
            768: { slidesPerView: 4 },
            1024: { slidesPerView: 5 },
          }}
          navigation={true}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          className="pb-8 px-4"
        >
          {profiles.map(profile => (
            <SwiperSlide key={profile.id} style={{ height: 'auto' }}>
              <HomeClientCard profile={profile} />
            </SwiperSlide>
          ))}
        </Swiper>
        <div className="text-center mt-8">
          <Link to="/clients" className="inline-flex items-center px-6 py-3 border-2 border-red-600 text-red-600 font-semibold rounded-lg hover:bg-red-600 hover:text-white transition-all">
            {t('home.clients.cta')} <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HomeClientsSection;
