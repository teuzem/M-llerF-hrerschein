import React from 'react';
import { useTranslation } from 'react-i18next';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination, Navigation } from 'swiper/modules';
import ReactPlayer from 'react-player';
import { Camera, Video } from 'lucide-react';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { Testimonial } from '../../lib/supabase';

interface MediaCarouselsProps {
  testimonials: Testimonial[];
}

const MediaCarousels: React.FC<MediaCarouselsProps> = ({ testimonials }) => {
  const { t } = useTranslation();
  
  const allMedia = testimonials.flatMap(t => t.media_urls || []);
  const images = allMedia.filter(url => !ReactPlayer.canPlay(url));
  const videos = allMedia.filter(url => ReactPlayer.canPlay(url));

  if (images.length === 0 && videos.length === 0) {
    return null;
  }

  return (
    <div className="mt-16 space-y-16">
      {images.length > 0 && (
        <div>
          <h3 className="text-2xl font-bold text-center mb-8 flex items-center justify-center text-gray-800">
            <Camera className="w-6 h-6 mr-3 text-german-red" />
            {t('testimonials.carousels.images')}
          </h3>
          <Swiper
            effect={'coverflow'}
            grabCursor={true}
            centeredSlides={true}
            slidesPerView={'auto'}
            coverflowEffect={{
              rotate: 50,
              stretch: 0,
              depth: 100,
              modifier: 1,
              slideShadows: true,
            }}
            pagination={{ clickable: true }}
            navigation={true}
            modules={[EffectCoverflow, Pagination, Navigation]}
            className="w-full pb-10"
          >
            {images.map((url, index) => (
              <SwiperSlide key={index} style={{ width: '300px', height: '200px' }}>
                <img src={url} alt={`Media ${index}`} className="w-full h-full object-cover rounded-lg shadow-lg" />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}

      {videos.length > 0 && (
        <div>
          <h3 className="text-2xl font-bold text-center mb-8 flex items-center justify-center text-gray-800">
            <Video className="w-6 h-6 mr-3 text-red-600" />
            {t('testimonials.carousels.videos')}
          </h3>
          <Swiper
            slidesPerView={1}
            spaceBetween={30}
            breakpoints={{
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            pagination={{ clickable: true }}
            navigation={true}
            modules={[Pagination, Navigation]}
            className="w-full pb-10"
          >
            {videos.map((url, index) => (
              <SwiperSlide key={index}>
                <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-lg">
                  <ReactPlayer url={url} width="100%" height="100%" controls light={true} />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}
    </div>
  );
};

export default MediaCarousels;
