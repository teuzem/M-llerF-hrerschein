import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { supabase, Testimonial } from '../../lib/supabase';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation, Autoplay } from 'swiper/modules';
import { Star, MessageSquare, ArrowRight, MapPin } from 'lucide-react';
import Avatar from '../ui/Avatar';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const HomeTestimonialCard: React.FC<{ testimonial: Testimonial }> = ({ testimonial }) => {
  const authorName = testimonial.profiles?.full_name || testimonial.author_name;
  const avatarUrl = testimonial.profiles?.avatar_url;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md h-full flex flex-col">
      <div className="flex items-center mb-4">
        {testimonial.user_id ? (
          <Link to={`/clients/${testimonial.user_id}`} className="transition-transform duration-200 hover:scale-105">
            <Avatar name={authorName} avatarUrl={avatarUrl} size="md" />
          </Link>
        ) : (
          <Avatar name={authorName} avatarUrl={avatarUrl} size="md" />
        )}
        <div className="ml-4">
          <p className="font-bold text-gray-800">{authorName}</p>
          {(testimonial.city || testimonial.region) && (
            <div className="flex items-center text-xs text-gray-500">
              <MapPin className="w-3 h-3 mr-1" />
              <span>{testimonial.city}{testimonial.city && testimonial.region ? ', ' : ''}{testimonial.region}</span>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center mb-2">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="w-4 h-4" fill={i < testimonial.rating ? '#FFC107' : '#E0E0E0'} strokeWidth={0} />
        ))}
      </div>
      <p className="text-gray-600 italic text-sm line-clamp-4 flex-grow">"{testimonial.content}"</p>
    </div>
  );
};

const HomeTestimonialsSection = () => {
  const { t } = useTranslation();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*, profiles(full_name, avatar_url)')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) console.error("Error fetching testimonials for home page:", error);
      else setTestimonials(data as Testimonial[]);
      setLoading(false);
    };
    fetchTestimonials();
  }, []);

  if (loading || testimonials.length === 0) return null;

  return (
    <section className="py-20 bg-white">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold mb-6 flex items-center justify-center text-gray-900">
            <MessageSquare className="w-10 h-10 mr-4 text-red-600" />
            {t('testimonials.title')}
          </h2>
        </div>
        <Swiper
          modules={[Pagination, Navigation, Autoplay]}
          spaceBetween={30}
          slidesPerView={1}
          breakpoints={{
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          pagination={{ clickable: true }}
          navigation={true}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          className="pb-12"
        >
          {testimonials.map(testimonial => (
            <SwiperSlide key={testimonial.id} style={{ height: 'auto' }}>
              <HomeTestimonialCard testimonial={testimonial} />
            </SwiperSlide>
          ))}
        </Swiper>
        <div className="text-center mt-8">
          <Link to="/testimonials" className="inline-flex items-center px-6 py-3 border-2 border-german-red text-german-red font-semibold rounded-lg hover:bg-german-red hover:text-white transition-all">
            {t('testimonials.view_all')} <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>

      </div>
    </section>
  );
};

export default HomeTestimonialsSection;
