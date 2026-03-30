import React, { useState, useRef } from 'react';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import { useTranslation } from 'react-i18next';
import 'react-image-crop/dist/ReactCrop.css';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

interface ImageCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  onCropComplete: (file: File) => void;
}

function toBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob(resolve);
  });
}

const ImageCropModal: React.FC<ImageCropModalProps> = ({ isOpen, onClose, imageSrc, onCropComplete }) => {
  const { t } = useTranslation();
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);

  const handleSaveCrop = async () => {
    if (!completedCrop || !imgRef.current) {
      return;
    }

    const canvas = document.createElement('canvas');
    const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return;
    }

    ctx.drawImage(
      imgRef.current,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height
    );

    const blob = await toBlob(canvas);
    if (blob) {
      const file = new File([blob], 'cropped_image.jpeg', { type: 'image/jpeg' });
      onCropComplete(file);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('application.form.crop_title')}>
      <div className="flex flex-col items-center">
        <ReactCrop
          crop={crop}
          onChange={c => setCrop(c)}
          onComplete={c => setCompletedCrop(c)}
          aspect={1}
          minWidth={100}
        >
          <img ref={imgRef} src={imageSrc} alt="Crop preview" style={{ maxHeight: '70vh' }} />
        </ReactCrop>
        <Button onClick={handleSaveCrop} className="mt-4">
          {t('application.form.save_crop')}
        </Button>
      </div>
    </Modal>
  );
};

export default ImageCropModal;
