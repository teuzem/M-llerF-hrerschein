import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GalleryMedia } from '../../lib/supabase';
import ImageViewerModal from './ImageViewerModal';


interface ImageGridProps {
  images: GalleryMedia[];
}

const ImageGrid: React.FC<ImageGridProps> = ({ images }) => {

  const [viewerOpen, setViewerOpen] = useState(false);
  const [startIndex, setStartIndex] = useState(0);

  const openViewer = (index: number) => {
    setStartIndex(index);
    setViewerOpen(true);
  };

  return (
    <>
      <ImageViewerModal
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
        images={images}
        startIndex={startIndex}
      />
      <motion.div
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        initial="hidden"
        animate="visible"
        variants={{
          visible: { transition: { staggerChildren: 0.05 } },
        }}
      >
        {images.map((image, index) => (
          <motion.div
            key={image.id}
            className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg shadow-lg"
            onClick={() => openViewer(index)}
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            layout
          >
            <img
              src={image.media_url}
              alt={image.description || `Image ${index}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-3 text-white">
              <p className="font-semibold text-sm truncate">{image.profiles?.full_name || 'Anonym'}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </>
  );
};

export default ImageGrid;
