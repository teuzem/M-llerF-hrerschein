import React, { useState, useRef } from 'react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import { useTranslation } from 'react-i18next';
import 'react-image-crop/dist/ReactCrop.css';
import Button from '../ui/Button';
import { RotateCcw, ZoomIn, ZoomOut, MoveHorizontal } from 'lucide-react';

interface AdvancedImageEditorProps {
  imageSrc: string;
  onSave: (file: File) => void;
  onClose: () => void;
}

async function getTransformedImage(
  image: HTMLImageElement,
  crop: PixelCrop,
  rotate = 0,
  flip = { horizontal: false, vertical: false }
): Promise<File> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No 2d context');

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  canvas.width = Math.floor(crop.width * scaleX);
  canvas.height = Math.floor(crop.height * scaleY);

  ctx.imageSmoothingQuality = 'high';

  const cropX = crop.x * scaleX;
  const cropY = crop.y * scaleY;
  const rotateRads = rotate * (Math.PI / 180);
  const centerX = image.naturalWidth / 2;
  const centerY = image.naturalHeight / 2;

  ctx.save();
  ctx.translate(-cropX, -cropY);
  ctx.translate(centerX, centerY);
  ctx.rotate(rotateRads);
  ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
  ctx.translate(-centerX, -centerY);
  ctx.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight);
  ctx.restore();

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) return reject(new Error('Canvas is empty'));
      resolve(new File([blob], 'edited-image.jpeg', { type: 'image/jpeg' }));
    }, 'image/jpeg');
  });
}

const AdvancedImageEditor: React.FC<AdvancedImageEditorProps> = ({ imageSrc, onSave, onClose }) => {
  const { t } = useTranslation();
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);
  const [flip, setFlip] = useState({ horizontal: false, vertical: false });
  const [aspect, setAspect] = useState<number | undefined>(undefined);

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    const newCrop = centerCrop(makeAspectCrop({ unit: '%', width: 90 }, aspect || width / height, width, height), width, height);
    setCrop(newCrop);
  }

  const handleSave = async () => {
    if (completedCrop?.width && completedCrop?.height && imgRef.current) {
      const editedFile = await getTransformedImage(imgRef.current, completedCrop, rotate, flip);
      onSave(editedFile);
      onClose();
    }
  };

  return (
    <div className="space-y-4">
      <div className="w-full h-96 overflow-auto bg-gray-900 rounded-lg flex items-center justify-center p-2">
        <ReactCrop crop={crop} onChange={c => setCrop(c)} onComplete={c => setCompletedCrop(c)} aspect={aspect}>
          <img ref={imgRef} src={imageSrc} alt={t('gallery.uploader.preview', 'Bildvorschau')} style={{ transform: `scale(${scale}) rotate(${rotate}deg) scaleX(${flip.horizontal ? -1 : 1}) scaleY(${flip.vertical ? -1 : 1})` }} onLoad={onImageLoad} />
        </ReactCrop>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">{t('gallery.uploader.zoom', 'Zoom')}</label>
          <div className="flex items-center gap-2"><ZoomOut className="w-5 h-5 text-gray-500" /><input type="range" value={scale} min="1" max="3" step="0.1" onChange={(e) => setScale(Number(e.target.value))} className="w-full" /><ZoomIn className="w-5 h-5 text-gray-500" /></div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">{t('gallery.uploader.rotation', 'Rotation')}</label>
          <div className="flex items-center gap-2"><RotateCcw className="w-5 h-5 text-gray-500" /><input type="range" value={rotate} min="-180" max="180" step="1" onChange={(e) => setRotate(Number(e.target.value))} className="w-full" /><span className="text-sm w-12 text-right">{rotate}°</span></div>
        </div>
      </div>

      <div className="border-t pt-4">
        <p className="text-sm font-medium text-gray-700 mb-2">{t('gallery.uploader.tools', 'Werkzeuge')}</p>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => setFlip(f => ({ ...f, horizontal: !f.horizontal }))}><MoveHorizontal className="w-4 h-4 mr-2" /> {t('gallery.uploader.flip_horiz', 'Horizontal spiegeln')}</Button>
          <Button variant="secondary" onClick={() => setAspect(16 / 9)}>16:9</Button>
          <Button variant="secondary" onClick={() => setAspect(4 / 3)}>4:3</Button>
          <Button variant="secondary" onClick={() => setAspect(1)}>1:1</Button>
          <Button variant="secondary" onClick={() => setAspect(undefined)}>{t('gallery.uploader.free', 'Frei')}</Button>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-4">
        <Button variant="secondary" onClick={onClose}>{t('common.cancel', 'Abbrechen')}</Button>
        <Button onClick={handleSave}>{t('common.save', 'Speichern')}</Button>
      </div>
    </div>
  );
};

export default AdvancedImageEditor;
