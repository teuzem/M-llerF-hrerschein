import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Zoom } from 'swiper/modules';
import { GalleryMedia } from '../../lib/supabase';
import { X } from 'lucide-react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/zoom';

interface ImageViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: GalleryMedia[];
  startIndex: number;
}

const ImageViewerModal: React.FC<ImageViewerModalProps> = ({ isOpen, onClose, images, startIndex }) => {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full h-full transform transition-all">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 z-10 p-2 text-white bg-black/30 rounded-full hover:bg-black/50"
                >
                  <X className="w-6 h-6" />
                </button>
                <Swiper
                  modules={[Navigation, Pagination, Zoom]}
                  initialSlide={startIndex}
                  navigation={{
                    nextEl: '.swiper-button-next',
                    prevEl: '.swiper-button-prev',
                  }}
                  pagination={{ clickable: true, dynamicBullets: true }}
                  zoom={true}
                  className="h-full w-full"
                  style={{
                    '--swiper-navigation-color': '#fff',
                    '--swiper-pagination-color': '#fff',
                  } as React.CSSProperties}
                >
                  {images.map((image) => (
                    <SwiperSlide key={image.id}>
                      <div className="swiper-zoom-container flex items-center justify-center h-[90vh]">
                        <img src={image.media_url} alt={image.description || ''} className="max-w-full max-h-full object-contain" />
                      </div>
                    </SwiperSlide>
                  ))}
                  <div className="swiper-button-next"></div>
                  <div className="swiper-button-prev"></div>
                </Swiper>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ImageViewerModal;
