import React, { useState, useRef } from 'react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import { useTranslation } from 'react-i18next';
import 'react-image-crop/dist/ReactCrop.css';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';

interface ImageEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  onSave: (file: File) => void;
}

function getCroppedImg(
  image: HTMLImageElement,
  crop: PixelCrop,
  rotation = 0
): Promise<File> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No 2d context');

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  const pixelRatio = window.devicePixelRatio;

  canvas.width = Math.floor(crop.width * scaleX * pixelRatio);
  canvas.height = Math.floor(crop.height * scaleY * pixelRatio);

  ctx.scale(pixelRatio, pixelRatio);
  ctx.imageSmoothingQuality = 'high';

  const cropX = crop.x * scaleX;
  const cropY = crop.y * scaleY;

  const rotateRads = rotation * (Math.PI / 180);
  const centerX = image.naturalWidth / 2;
  const centerY = image.naturalHeight / 2;

  ctx.save();
  ctx.translate(-cropX, -cropY);
  ctx.translate(centerX, centerY);
  ctx.rotate(rotateRads);
  ctx.scale(1, 1);
  ctx.translate(-centerX, -centerY);
  ctx.drawImage(
    image,
    0,
    0,
    image.naturalWidth,
    image.naturalHeight,
  );
  ctx.restore();

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Canvas is empty'));
        return;
      }
      resolve(new File([blob], 'cropped.jpeg', { type: 'image/jpeg' }));
    }, 'image/jpeg');
  });
}

const ImageEditorModal: React.FC<ImageEditorModalProps> = ({ isOpen, onClose, imageSrc, onSave }) => {
  const { t } = useTranslation();
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const imgRef = useRef<HTMLImageElement>(null);

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    const newCrop = centerCrop(
      makeAspectCrop({ unit: '%', width: 90 }, 16 / 9, width, height),
      width,
      height,
    );
    setCrop(newCrop);
  }

  const handleSave = async () => {
    if (completedCrop?.width && completedCrop?.height && imgRef.current) {
      const croppedImageFile = await getCroppedImg(
        imgRef.current,
        completedCrop,
        rotation,
      );
      onSave(croppedImageFile);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('testimonials.media_uploader.image_editor.title')}>
      <div className="flex flex-col items-center space-y-4">
        <div className="w-full h-96 overflow-auto bg-gray-100 rounded-lg flex items-center justify-center">
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            onComplete={c => setCompletedCrop(c)}
            aspect={16 / 9}
          >
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Crop preview"
              style={{ transform: `scale(${scale}) rotate(${rotation}deg)` }}
              onLoad={onImageLoad}
            />
          </ReactCrop>
        </div>

        <div className="w-full space-y-4">
          <div>
            <label className="text-sm font-medium">{t('testimonials.media_uploader.image_editor.zoom')}</label>
            <div className="flex items-center space-x-2">
              <ZoomOut className="w-5 h-5 text-gray-500" />
              <input
                type="range"
                value={scale}
                min="1"
                max="3"
                step="0.1"
                onChange={(e) => setScale(Number(e.target.value))}
                className="w-full"
              />
              <ZoomIn className="w-5 h-5 text-gray-500" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">{t('testimonials.media_uploader.image_editor.rotation')}</label>
            <div className="flex items-center space-x-2">
              <RotateCcw className="w-5 h-5 text-gray-500" />
              <input
                type="range"
                value={rotation}
                min="-180"
                max="180"
                step="1"
                onChange={(e) => setRotation(Number(e.target.value))}
                className="w-full"
              />
              <span className="text-sm w-12 text-right">{rotation}°</span>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end w-full space-x-3 mt-4">
          <Button variant="secondary" onClick={onClose}>{t('common.cancel')}</Button>
          <Button onClick={handleSave}>{t('testimonials.media_uploader.image_editor.save')}</Button>
        </div>
      </div>
    </Modal>
  );
};

export default ImageEditorModal;
