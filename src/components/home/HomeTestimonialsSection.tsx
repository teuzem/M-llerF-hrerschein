import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { supabase, Testimonial } from '../../lib/supabase';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import { Star, ArrowRight, MapPin, Quote } from 'lucide-react';
import Avatar from '../ui/Avatar';
import 'swiper/css';

const HomeTestimonialCard: React.FC<{ testimonial: Testimonial }> = ({ testimonial }) => {
  const authorName = testimonial.profiles?.full_name || testimonial.author_name;
  const avatarUrl = testimonial.profiles?.avatar_url;
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 sm:p-6 h-full flex flex-col">
      <Quote className="w-5 h-5 text-gray-200 mb-3" />
      <p className="text-gray-600 text-sm leading-relaxed line-clamp-4 flex-grow mb-4">{testimonial.content}</p>
      <div className="flex items-center gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="w-3 h-3" fill={i < testimonial.rating ? '#F59E0B' : '#E5E7EB'} strokeWidth={0} />
        ))}
      </div>
      <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
        {testimonial.user_id ? (
          <Link to={`/clients/${testimonial.user_id}`}><Avatar name={authorName} avatarUrl={avatarUrl} size="sm" /></Link>
        ) : (
          <Avatar name={authorName} avatarUrl={avatarUrl} size="sm" />
        )}
        <div>
          <p className="font-semibold text-gray-900 text-sm">{authorName}</p>
          {(testimonial.city || testimonial.region) && (
            <div className="flex items-center text-xs text-gray-400 mt-0.5">
              <MapPin className="w-3 h-3 mr-1" />
              <span>{testimonial.city}{testimonial.city && testimonial.region ? ', ' : ''}{testimonial.region}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const HomeTestimonialsSection = () => {
  const { t } = useTranslation();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      const { data, error } = await supabase.from('testimonials').select('*, profiles(full_name, avatar_url)').eq('status', 'approved').order('created_at', { ascending: false }).limit(10);
      if (error) console.error("Error fetching testimonials:", error);
      else setTestimonials(data as Testimonial[]);
      setLoading(false);
    };
    fetchTestimonials();
  }, []);

  if (loading || testimonials.length === 0) return null;

  return (
    <section className="py-14 sm:py-16 bg-white">
      <div className="w-full px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight max-w-2xl mx-auto">{t('testimonials.title')}</h2>
        </div>
        <Swiper modules={[Autoplay]} spaceBetween={16} slidesPerView={1} breakpoints={{ 640: { slidesPerView: 2, spaceBetween: 16 }, 1024: { slidesPerView: 3, spaceBetween: 20 } }} autoplay={{ delay: 5000, disableOnInteraction: false }} className="pb-2">
          {testimonials.map(t => (
            <SwiperSlide key={t.id} style={{ height: 'auto' }}><HomeTestimonialCard testimonial={t} /></SwiperSlide>
          ))}
        </Swiper>
        <div className="text-center mt-8">
          <Link to="/testimonials" className="group inline-flex items-center gap-2 text-gray-900 font-semibold hover:text-german-red transition-colors duration-200 text-sm">
            {t('testimonials.view_all')}<ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HomeTestimonialsSection;
